import {Request, Response, NextFunction, Router} from 'express'
import Question from '../models/question'
import {sequelize} from '../db/sequelizeConnector'
import {StatusCodes} from '../utilites/StatusCodes'
import RunningGameStorage from "../utilites/RunningGameStorage";

class GameController {

    public readonly path = '/game'
    public router = Router()

    constructor() {
        this.router.post(this.path + '/start', this.startGame)
        this.router.get(this.path + '/getTIme', this.getTime)
    }

    startGame(request: Request, response: Response, next: NextFunction): void {
        let category = request.headers.category

        //TODO: more validation e.g. isValidCategory? isValidString? etc.
        if (!category || typeof category !== "string" || Array.isArray(category)){
            response.sendStatus(StatusCodes.NotFound)
        }

        response.sendStatus(RunningGameStorage.instance().startGame(<string>request.headers.tokenkey, <string>category))
    }

    getTime(request: Request, response: Response, next: NextFunction) {
        response.send({
            time: <number>RunningGameStorage.instance().getTime(<string>request.headers.tokenkey)
        })
    }
}

export default GameController
