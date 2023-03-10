import {Request, Response, NextFunction, Router} from 'express'
import User from '../models/user'
import {sequelize} from '../db/sequelizeConnector'
import {StatusCodes} from '../utilites/StatusCodes'

class UserController {
    private readonly path = '/user'
    public router = Router()

    constructor() {
        this.router.get(this.path + '/get', this.getUser)
        this.router.post(this.path + '/create', this.createUser)
        this.router.post(this.path + '/isAdmin', this.isUserAdmin)
    }

    getUser = (request: Request, response: Response, next: NextFunction) => {
        const tokenKey = request.headers.tokenkey

        sequelize.sync()
            .then(() => {
                User.findOne({where: {tokenKey}})
                    .then(user => {
                        if (!user) {
                            response.status(StatusCodes.IAmATeaPod).send({error: 'User not found'})
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
                const email = request.headers.email // TODO https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
                const firstName = request.headers.firstname
                const lastName = request.headers.lastname

                if (!tokenKey || tokenKey.length != 28) {
                    response.sendStatus(StatusCodes.IAmATeaPod)
                    response.end()
                }

                if (!name || name.length == 0 || name == "undefined") {
                    response.sendStatus(StatusCodes.IAmATeaPod)
                    response.end()
                }

                if (!firstName || firstName.length == 0 || firstName == "undefined") {
                    response.sendStatus(StatusCodes.IAmATeaPod)
                    response.end()
                }

                if (!lastName || lastName.length == 0 || lastName == "undefined") {
                    response.sendStatus(StatusCodes.IAmATeaPod)
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
                        console.log(error)
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
}

export default UserController
