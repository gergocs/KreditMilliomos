import { Request, Response, NextFunction, Router } from 'express'
import Question from '../models/question'
import { sequelize } from '../db/sequelizeConnector'
import { StatusCodes } from '../utilites/StatusCodes'
import RunningGameStorage from "../utilites/RunningGameStorage"

class GameController {

    public readonly path = '/game'
    public router = Router()

    constructor() {
        this.router.post(this.path + '/start', this.startGame)
        this.router.get(this.path + '/getTIme', this.getTime)
        this.router.get(this.path + '/getActualQuestion', this.getActualQuestion)

        this.router.get(this.path + '/useHalf', this.useHalf)
        this.router.get(this.path + '/useMobile', this.useMobile)
    }

    startGame(request: Request, response: Response, next: NextFunction): void {
        let myCategory = request.headers.category

        //TODO: more validation e.g. isValidCategory? isValidString? etc.
        if (!myCategory || typeof myCategory !== "string" || Array.isArray(myCategory)) {
            response.sendStatus(StatusCodes.NotFound)
        }

        if (myCategory === undefined) {
            response.sendStatus(StatusCodes.NotFound)
        }

        if (myCategory != undefined && myCategory.length > 255) {
            response.sendStatus(StatusCodes.NotFound)
        }

        sequelize.sync().then(() => {
            Question.findOne({ where: { category: myCategory } })
                .then(data => { 
                    
                    //if there's data in category it's valid
                    if (data != null || data != undefined) {

                        response.sendStatus(RunningGameStorage.instance().startGame(<string>request.headers.tokenkey, <string>myCategory))

                    } else {
                        
                        throw response.sendStatus(StatusCodes.NotFound)
                    }
                }).catch(error => { 
                     response.sendStatus(StatusCodes.InternalError)
                })
        }).catch(error => {
            response.sendStatus(StatusCodes.ServiceUnavailable)
        })
    }

    getTime(request: Request, response: Response, next: NextFunction) {
        response.send({
            time: <number>RunningGameStorage.instance().getTime(<string>request.headers.tokenkey)
        })
    }

    getActualQuestion(request: Request, response: Response, next: NextFunction): void {
        
        //Game osztály hozzáférés
        RunningGameStorage.instance().runningGames[<string>request.headers.tokenkey]

        //TODO
    }

    useMobile(request: Request, response: Response, next: NextFunction): void {
        
        //TODO
    }

    useAudience(request: Request, response: Response, next: NextFunction): void {
        
        //TODO
    }

    useHalf(request: Request, response: Response, next: NextFunction): void {
        
        //TODO
    }
}

export default GameController
