import {Request, Response, NextFunction, Router} from 'express'
import {getAuth} from 'firebase-admin/auth'
import User from '../models/user'
import {sequelize} from '../db/sequelizeConnector'
import {StatusCodes} from '../utilites/StatusCodes'
import {MailSender} from "../utilites/mailSender";
import { RegExPatterns } from 'utilites/RegExPatterns'

class UserController {
    private readonly path = '/user'
    public router = Router()

    constructor() {
        this.router.get(this.path, this.getUser)
        this.router.get(this.path + '/admin/allUsers', this.listAllUsers)
        this.router.get(this.path + '/admin/bannedUsers', this.getBannedUsers)
        this.router.get(this.path + '/isAdmin', this.isUserAdmin)
        this.router.post(this.path, this.createUser)
        this.router.put(this.path + '/admin/ban', this.banUser)
        this.router.put(this.path, this.updateUser)
    }

    getUser = (request: Request, response: Response, next: NextFunction) => {
        const tokenKey = request.headers.tokenkey

        sequelize.sync()
            .then(() => {
                User.findOne({where: {tokenKey}})
                    .then(user => {
                        if (!user) {
                            response.status(StatusCodes.NotFound).send({error: 'User not found'})
                            response.end()
                        } else {
                            response.send(user)
                            response.end()
                        }
                    })
                    .catch(error => {
                        response.sendStatus(StatusCodes.InternalError)
                        response.end()
                    })
            })
            .catch(error => {
                response.sendStatus(StatusCodes.ServiceUnavailable)
                response.end()
            })
    }

    createUser(request: Request, response: Response, next: NextFunction) {
        sequelize.sync()
            .then(() => {
                const tokenKey = request.headers.tokenkey
                const name = request.headers.nickname
                let email = request.headers.email
                const firstName = request.headers.firstname
                const lastName = request.headers.lastname
                
                if (!email || email.length == 0 || email == "undefined" || typeof email !== "string" || Array.isArray(email)) {
                    response.sendStatus(StatusCodes.BadRequest)
                    response.end()
                }
                email = <string>email

                if (!RegExPatterns.emailValidatorPattern.test(email)) {
                    response.sendStatus(StatusCodes.BadRequest)
                    response.end()
                }

                if (!tokenKey || tokenKey.length != 28) {
                    response.sendStatus(StatusCodes.BadRequest)
                    response.end()
                }

                if (!name || name.length == 0 || name == "undefined") {
                    response.sendStatus(StatusCodes.BadRequest)
                    response.end()
                }

                if (!firstName || firstName.length == 0 || firstName == "undefined") {
                    response.sendStatus(StatusCodes.BadRequest)
                    response.end()
                }

                if (!lastName || lastName.length == 0 || lastName == "undefined") {
                    response.sendStatus(StatusCodes.BadRequest)
                    response.end()
                }

                User.create({
                    tokenKey: <string>tokenKey,
                    name: <string>name,
                    email: <string>email,
                    lastName: <string>lastName,
                    firstName: <string>firstName,
                    isAdmin: JSON.stringify(request.headers.isadmin) === 'true'
                })
                    .then(user => {
                        response.sendStatus(StatusCodes.Ok)
                        response.end()
                    })
                    .catch(error => {
                        response.sendStatus(StatusCodes.InternalError)
                        response.end()
                    })
            })
            .catch(error => {
                response.sendStatus(StatusCodes.ServiceUnavailable)
                response.end()
            })
    }

    isUserAdmin = (request: Request, response: Response, next: NextFunction) => {
        const tokenKey = request.headers.tokenkey

        if (!tokenKey || tokenKey.length != 28) {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
        }

        sequelize.sync()
            .then(() => {
                User.findOne({where: {tokenKey}})
                    .then(user => {
                        if (user && user.isAdmin) {
                            response.sendStatus(StatusCodes.Ok)
                            response.end()
                        } else {
                            response.sendStatus(StatusCodes.IAmATeaPod)
                            response.end()
                        }
                    })
                    .catch(error => {
                        response.sendStatus(StatusCodes.InternalError)
                        response.end()
                    })
            })
            .catch(error => {
                response.sendStatus(StatusCodes.ServiceUnavailable)
                response.end()
            })
    }

    listAllUsers = (request: Request, response: Response, next: NextFunction) => {
        sequelize.sync()
            .then(() => {
                User.findAll().then(
                    users => {
                        response.send(users)
                        response.end()
                    }
                ).catch(error => response.sendStatus(StatusCodes.InternalError))
            }).catch(error => response.sendStatus(StatusCodes.ServiceUnavailable))
    }

    getBannedUsers = (request: Request, response: Response, next: NextFunction) => {
        let bannedUsers = new Array<string>()
        const listAllUsers = (nextPageToken) => {
            getAuth()
                .listUsers(1000, nextPageToken)
                .then((listUsersResult) => {
                    listUsersResult.users.forEach((userRecord) => {
                        if (userRecord.disabled) {
                            bannedUsers.push(userRecord.uid)
                        }
                    });

                    if (listUsersResult.pageToken) {
                        listAllUsers(listUsersResult.pageToken)
                    } else {
                        response.send(bannedUsers)
                        response.end()
                    }
                })
                .catch((error) => {
                    response.sendStatus(StatusCodes.ServiceUnavailable)
                    response.end()
                });
        };

        listAllUsers(undefined)
    }

    banUser = (request: Request, response: Response, next: NextFunction) => {
        try {
            const isBan = request.body.isBan
            const token = request.body.tokenkey

            const todayDate = new Date()
            const banSubject = "Kreditmilliomos felhasználói fiók felfüggesztése"
            const bannMessage = "Tisztelt Felhasználó!\n" +
            "Sajnálattal értesítjük, hogy felhasználói fiókja határozatlan időre felfüggesztésre került!\n" +
            "Moderátoraink visszajelzése alapján a tevékenységei sértették a Kreditmilliomos felhasználói szabályzatát.\n" +
            "Felhasználói fiókja jelen helyzetben (" + todayDate.toLocaleString() + ") nem elérhető.\n"
            "A további korlátozások feloldásának feltételeiért, keresse a weboldalon megdott elérhetőségen kollégáinkat!\n" +
            "Köszönettel:\n" +
            "Kreditmilliomos csapata"

            const unBanSubject = "Kreditmilliomos felhasználói fiók feloldása"
            const unBanMessage = "Tisztelt Felhasználó!\n" +
            "Örömmel értesítjük, hogy felhasználói fiókját kollégáink visszaállították!\n" +
            "Felhasználói fiókja jelen helyzetben (" + todayDate.toLocaleString() + ") ismét elérhető.\n" +
            "További kellemes játékot kíván!\n" +
            "Kreditmilliomos csapata"

            if (typeof token === "string") {
                getAuth().updateUser(token, {
                    disabled: isBan
                }).then((userRecord) => {
                    if (isBan){
                        MailSender.instance().sendEmail(
                            userRecord.email,
                            banSubject,
                            bannMessage)
                    } else {
                        MailSender.instance().sendEmail(
                            userRecord.email,
                            unBanSubject,
                            unBanMessage)
                    }
                    response.sendStatus(StatusCodes.Ok)
                    response.end()
                }).catch((error) => {
                    response.sendStatus(StatusCodes.ServiceUnavailable)
                    response.end()
                })
            } else {
                throw new Error()
            }
        } catch (e) {
            response.sendStatus(StatusCodes.UnprocessableContent)
            response.end()
        }
    }

    updateUser = (request: Request, response: Response, next: NextFunction) => {
        const tokenKey = request.headers.tokenkey
        const name = request.headers.nickname
        const firstName = request.headers.firstname
        const lastName = request.headers.lastname

        if (!tokenKey || tokenKey.length != 28) {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
        }

        if (!name || name.length == 0 || name == "undefined") {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
        }

        if (!firstName || firstName.length == 0 || firstName == "undefined") {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
        }

        if (!lastName || lastName.length == 0 || lastName == "undefined") {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
        }

        sequelize.sync()
            .then(() => {
                User.update({
                    name: <string>name,
                    firstName: <string>firstName,
                    lastName: <string>lastName,
                }, {where: {tokenKey: tokenKey}})
                    .then(r => {
                        response.sendStatus(StatusCodes.Ok)
                        response.end()
                    })
                    .catch(error => {
                        response.sendStatus(StatusCodes.InternalError)
                        response.end()
                    })
            })
            .catch(error => {
                response.sendStatus(StatusCodes.ServiceUnavailable)
                response.end()
            })
    }
}

export default UserController
