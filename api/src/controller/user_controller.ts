import * as express from 'express'

class UserController {
  public path = '/user'
  public router = express.Router()

  constructor () {
    this.router.get(this.path + '/get', this.getUser)
    this.router.post(this.path + '/create', this.createUser)
    this.router.post(this.path + '/isAdmin', this.isUserAdmin)
  }

  getUser = (request: express.Request, response: express.Response): void => {
    // TODO: get user from database via sequelize
    // use mvc model!
    response.send('User Data')
  }

  createUser = (request: express.Request, response: express.Response): void => {
    // TODO: create user in database via sequelize
    // use mvc model!
    response.sendStatus(200)
  }

  isUserAdmin = (request: express.Request, response: express.Response): void => {
    // TODO: check if user is admin in database via sequelize
    // use mvc model!
    response.sendStatus(200)
  }
}

export default UserController
