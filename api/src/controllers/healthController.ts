import {NextFunction, Request, Response, Router} from "express";
import {sequelize} from "../db/sequelizeConnector";
import {StatusCodes} from "../utilites/StatusCodes";

class HealthController {
    public readonly path = '/health'
    public router = Router()

    constructor() {
        this.router.get(this.path, this.getHealth)
    }

    private getHealth(request: Request, response: Response, next: NextFunction) {
        sequelize.validate().then(r => {
            sequelize.authenticate().then(r => {
                response.sendStatus(StatusCodes.Ok)
                response.end()
            }).catch(e => {
                response.sendStatus(StatusCodes.InternalError)
                response.end()
                return
            })
        }).catch(e => {
            response.sendStatus(StatusCodes.InternalError)
            response.end()
            return
        })
    }
}

export default HealthController
