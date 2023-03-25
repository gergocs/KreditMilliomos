import {NextFunction, Request, Response, Router} from 'express'
import Question from '../models/question'
import {sequelize} from '../db/sequelizeConnector'
import {StatusCodes} from '../utilites/StatusCodes'
import RunningGameStorage from "../utilites/RunningGameStorage"

class GameController {

    public readonly path = '/game'
    public router = Router()

    constructor() {
        this.router.post(this.path + '/start', this.startGame)
        this.router.get(this.path + '/getTime', this.getTime)
        this.router.get(this.path + '/evaluateGame', this.evaluateGame)
        this.router.get(this.path + '/useHalf', this.useHalf)
        this.router.get(this.path + '/useSwitch', this.useSwitch)
        this.router.get(this.path + '/useAudience', this.useAudience)
        this.router.post(this.path + '/giveUp', this.giveUp)
        this.router.post(this.path + '/endGame', this.endGame)
    }

    startGame(request: Request, response: Response, next: NextFunction): void {
        let myCategory = request.headers.category
        let difficulty = request.headers.difficulty

        if (!myCategory || typeof myCategory !== "string" || Array.isArray(myCategory) || myCategory.length > 255) {
            response.sendStatus(StatusCodes.NotFound)
            response.end()
        }

        if (!difficulty || isNaN(Number(difficulty)) || Array.isArray(difficulty) || Number(difficulty) < 0 || Number(difficulty) > 2) {
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
            time: <number>RunningGameStorage.instance().getTime(<string>request.headers.tokenkey),
            remainingTime: <number>RunningGameStorage.instance().getRemainingTime(<string>request.headers.tokenkey)
        })
    }

    evaluateGame(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let question

        if (RunningGameStorage.instance().hasQuestion(token)) {
            question = RunningGameStorage.instance().evaluateGame(token, <string>request.headers.answer)
        } else {
            question = RunningGameStorage.instance().evaluateGame(token, "")
        }

        if (typeof question == "boolean") {
            if (question) {
                response.send({
                    win: true
                })
            }
        } else if (!question) {
            response.send({
                win: false
            })
        } else {

            //TODO: From the returned question we should remove the correct answer field
            if (question instanceof Question) {
                question.answerCorrect = '';
            }

            response.send(question)
        }

        response.end()
    }

    useSwitch(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let question = RunningGameStorage.instance().useSwitch(token)

        if (!question) {
            response.sendStatus(StatusCodes.BadRequest)
        } else {
            
            //TODO: From the returned question we should remove the correct answer field
            if (question instanceof Question) {
                question.answerCorrect = '';
            }

            response.send(question)
        }

        response.end()
    }

    useAudience(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let guess = RunningGameStorage.instance().useAudience(token)

        if (!guess) {
            response.sendStatus(StatusCodes.BadRequest)
        } else {
            response.send({
                guess: guess
            })
        }

        response.end()
    }

    useHalf(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let question = RunningGameStorage.instance().useHalf(token)

        if (!question) {
            response.sendStatus(StatusCodes.BadRequest)
        } else {

            //TODO: From the returned question we should remove the correct answer field
            if (question instanceof Question) {
                question.answerCorrect = '';
            }

            response.send(question)
        }

        response.end()
    }

    giveUp(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let save = (<string>request.headers.tokenkey).toLowerCase() == 'true'

        response.sendStatus(RunningGameStorage.instance().giveUpGame(token, save) ? StatusCodes.Ok : StatusCodes.BadRequest)
        response.end()
    }

    endGame(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let save = (<string>request.headers.tokenkey).toLowerCase() == 'true'

        RunningGameStorage.instance().endGame(token, save)

        response.sendStatus(StatusCodes.Ok)
        response.end()
    }
}

export default GameController
