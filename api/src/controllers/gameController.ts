import {Request, Response, NextFunction, Router} from 'express'
import Question from '../models/question'
import {sequelize} from '../db/sequelizeConnector'
import {StatusCodes} from '../utilites/StatusCodes'
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
        let difficulty = request.headers.difficulty

        if (!myCategory || typeof myCategory !== "string" || Array.isArray(myCategory) || myCategory.length > 255) {
            response.sendStatus(StatusCodes.NotFound)
            response.end()
        }

        if (!difficulty || isNaN(Number(difficulty)) || Array.isArray(difficulty) || Number(difficulty) < 0 || Number(difficulty) > 2){
            response.sendStatus(StatusCodes.NotFound)
            response.end()
        }

        sequelize.sync().then(() => {
            Question.findOne({where: {category: myCategory}})
                .then(data => {
                    //if there's data in category it's valid
                    if (data != null || data != undefined) {
                        response.sendStatus(RunningGameStorage.instance().startGame(<string>request.headers.tokenkey, <string>myCategory, <number><unknown>difficulty))
                        response.end()
                    } else {
                        response.sendStatus(StatusCodes.NotFound)
                        response.end()
                    }
                }).catch(error => {
                response.sendStatus(StatusCodes.InternalError)
                response.end()
            })
        }).catch(error => {
            response.sendStatus(StatusCodes.ServiceUnavailable)
            response.end()
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

        //TODO: From the returned question we should remove the correct answer field
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
