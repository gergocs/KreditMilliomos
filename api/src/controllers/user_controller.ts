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
        const tokenKey = JSON.stringify(request.headers.tokenkey)

        sequelize.sync()
            .then(() => {
                User.findOne({where: {tokenKey}})
                    .then(user => {
                        if (!user) {
                            response.status(StatusCodes.IAmATeaPod).send({error: 'User not found'})
                        } else {
                            response.send(user)
                        }
                    })
                    .catch(error => response.sendStatus(StatusCodes.InternalError))
            })
            .catch(error => response.sendStatus(StatusCodes.ServiceUnavailable))
    }


    createUser(request: Request, response: Response, next: NextFunction) {
        sequelize.sync()
            .then(() => {
                User.create({
                    tokenKey: JSON.stringify(request.headers.tokenkey),
                    isAdmin: JSON.stringify(request.headers.isadmin) === 'true'
                })
                    .then(user => {
                        response.sendStatus(StatusCodes.Ok)
                    })
                    .catch(error => response.sendStatus(StatusCodes.InternalError))
            })
            .catch(error => response.sendStatus(StatusCodes.ServiceUnavailable))
    }

    isUserAdmin = (request: Request, response: Response, next: NextFunction) => {
        const tokenKey = JSON.stringify(request.headers.tokenkey)

        sequelize.sync()
            .then(() => {
                User.findOne({where: {tokenKey}})
                    .then(user => {
                        if (user && user.isAdmin) {
                            response.sendStatus(StatusCodes.Ok)
                        } else {
                            response.sendStatus(StatusCodes.IAmATeaPod)
                        }
                    })
                    .catch(error => response.sendStatus(StatusCodes.InternalError))
            })
            .catch(error => response.sendStatus(StatusCodes.ServiceUnavailable))
    }
}

export default UserController
