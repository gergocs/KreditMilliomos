import { Express, Request, Response, NextFunction, Router } from 'express';
import User from '../model/user'
import { sequelize } from '../db/sequelizeConnector'

class UserController {

    public path = '/user'
    public router = Router()

    constructor() {

        this.router.get(this.path + '/get', this.getUser)
        this.router.post(this.path + '/create', this.createUser)
        this.router.post(this.path + '/isAdmin', this.isUserAdmin)
    }

    getUser = (request: Request, response: Response) => {

        //TODO: get user from database via sequelize
        //use mvc model!
        response.send('User Data')
    }

    createUser(request: Request, response: Response, next: NextFunction) {

        sequelize.sync()
            .then(() => {
                User.create({

                    tokenKey: JSON.stringify(request.headers.tokenkey),
                    isAdmin: JSON.stringify(request.headers.isadmin) === 'true'
                })
                    .then(user => {
                        response.sendStatus(200)

                    })
                    .catch(error => next("Error in create\n: " + error))
            })
            .catch(error => next("Error in sync:\n " + error))
    }

    isUserAdmin = (request: Request, response: Response) => {

        //TODO: check if user is admin in database via sequelize
        //use mvc model!
        console.log(JSON.stringify(request.headers.tokenkey))
        response.sendStatus(200)
    }
}

export default UserController
