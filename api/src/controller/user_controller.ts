
import * as express from 'express'
import User from '../model/user.interface'

class UserController {

    public path = '/user'
    public router = express.Router()

    constructor() {
        this.router.get(this.path + '/get', this.getUser)
        this.router.post(this.path + '/create', this.createUser)
        this.router.post(this.path + '/isAdmin', this.isUserAdmin)
    }

    getUser = (request: express.Request, response: express.Response) => {
        
        //TODO: get user from database via sequelize
        //use mvc model!
        response.send('User Data')
    }

    createUser = (request: express.Request, response: express.Response) => {
        
        //TODO: create user in database via sequelize
        //use mvc model!
        console.log(JSON.stringify(request.headers.tokenkey))
        response.sendStatus(200)
    }

    isUserAdmin = (request: express.Request, response: express.Response) => {
        
        //TODO: check if user is admin in database via sequelize
        //use mvc model!
        console.log(JSON.stringify(request.headers.tokenkey))
        response.sendStatus(200)
    }
}
export default UserController