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

    getUser = (request: Request, response: Response, next: NextFunction) => {
      const tokenKey = JSON.stringify(request.headers.tokenkey)
    
      sequelize.sync()
        .then(() => {
          User.findOne({ where: { tokenKey } })
            .then(user => {
              if (!user) {
                response.status(404).send('User not found')
              } else {
                response.send(user);
              }
            })
            .catch(error => next("Error in findOne\n: " + error))
            
        })
        .catch(error => next("Error in sync:\n " + error))
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

    isUserAdmin = (request: Request, response: Response, next: NextFunction) => {
      const tokenKey = JSON.stringify(request.headers.tokenkey)
    
      sequelize.sync()
        .then(() => {
          User.findOne({ where: { tokenKey } })
            .then(user => {
              if (user && user.isAdmin) {
                response.sendStatus(200)
              } else {
                response.sendStatus(418)
              }
            })
            .catch(error => next("Error in findOne\n: " + error))
        })
        .catch(error => next("Error in sync:\n " + error))
    }
}

export default UserController
