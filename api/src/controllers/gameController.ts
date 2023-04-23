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
        let maxTimePerQuestion = request.headers.maxtimeperquestion

        if (!myCategory || typeof myCategory !== "string" || Array.isArray(myCategory) || myCategory.length > 255) {
            response.sendStatus(StatusCodes.NotFound)
            response.end()
        }

        if (!difficulty || isNaN(Number(difficulty)) || Array.isArray(difficulty) || Number(difficulty) < 0 || Number(difficulty) > 2) {
            response.sendStatus(StatusCodes.NotFound)
            response.end()
        }

        if (!maxTimePerQuestion || isNaN(Number(difficulty)) || Array.isArray(difficulty)) {
            maxTimePerQuestion = "NaN"
        }

        sequelize.sync().then(() => {
            Question.findOne({where: {category: myCategory}})
                .then(data => {
                    //if there's data in category it's valid
                    if (data != null || data != undefined) {
                        response.sendStatus(RunningGameStorage.instance().startGame(<string>request.headers.tokenkey, <string>myCategory, <number><unknown>difficulty, maxTimePerQuestion == "NaN" ? Infinity : Number(maxTimePerQuestion),))
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

    async getTime(request: Request, response: Response, next: NextFunction) {
        response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        });

        response.flushHeaders()

        response.write('retry: 1000\n\n') // retry every 1 second

        while (RunningGameStorage.instance().isTimeRunning(<string>request.headers.tokenkey)) {
            response.write(`data: ${Math.abs(Number(RunningGameStorage.instance().getRemainingTime(<string>request.headers.tokenkey)))}\n\n`)
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
        }
    }

    evaluateGame(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let answer = <string>request.headers.answer
        let question
        let prevQuestion: string | undefined

        if (RunningGameStorage.instance().hasQuestion(token)) {
            prevQuestion = RunningGameStorage.instance().getQuestion(token)
            question = RunningGameStorage.instance().evaluateGame(token, answer)
        } else {
            question = RunningGameStorage.instance().evaluateGame(token, "")
        }

        if (!question) {
            response.send({
                question: undefined,
                win: {
                    time: Date.now() - Number(RunningGameStorage.instance().getTime(token)),
                    level: RunningGameStorage.instance().getLevel(token),
                    difficulty: RunningGameStorage.instance().getDifficulty(token),
                    win: false,
                    correct: prevQuestion
                }
            })
            response.end()
        } else {
            question.then(r => {
                if (typeof r == "boolean") {
                    response.send({
                        question: undefined,
                        win: {
                            time: Date.now() - Number(RunningGameStorage.instance().getTime(token)),
                            level: RunningGameStorage.instance().getLevel(token),
                            difficulty: RunningGameStorage.instance().getDifficulty(token),
                            win: r,
                            correct: prevQuestion
                        }
                    })
                } else if (r instanceof Question) {
                    let q = JSON.parse(JSON.stringify(r))
                    q.answerCorrect = '';
                    response.send({
                        question: q,
                        win: undefined
                    })
                } else {
                    response.send({
                        question: undefined,
                        win: {
                            time: 0,
                            level: 0,
                            difficulty: 0,
                            win: false,
                            correct: undefined
                        }
                    })
                }

                response.end()
            }).catch(err => {
                response.sendStatus(StatusCodes.BadRequest)
                response.end()
                return
            })
        }

    }

    useSwitch(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let question = RunningGameStorage.instance().useSwitch(token)

        if (!question) {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
        } else {
            question.then(r => {
                if (r) {
                    let q = JSON.parse(JSON.stringify(r))
                    q.answerCorrect = '';
                    response.send({
                        question: q,
                        win: undefined
                    })
                }
            }).catch(error => {
                response.sendStatus(StatusCodes.BadRequest)
                response.end()
                return
            })
        }
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
        let question

        try {
            question = RunningGameStorage.instance().useHalf(token)
        } catch (e) {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
            return
        }

        if (!question) {
            response.sendStatus(StatusCodes.BadRequest)
        } else {
            question.answerCorrect = '';
            response.send(question)
        }

        response.end()
    }

    giveUp(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let save = (<string>request.headers.save).toLowerCase() == 'true'
        let canGiveUp = RunningGameStorage.instance().giveUpGame(token, save)

        if (!canGiveUp) {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
        } else {
            let level = RunningGameStorage.instance().getLevel(token)

            if (!level) {
                level = 0
            } else {
                level--
            }

            response.send({
                question: undefined,
                win: {
                    time: Date.now() - Number(RunningGameStorage.instance().getTime(token)),
                    level: level,
                    difficulty: RunningGameStorage.instance().getDifficulty(token),
                    win: level != 0
                }
            })

            RunningGameStorage.instance().endGame(token, false)
        }

        response.end()
    }

    endGame(request: Request, response: Response, next: NextFunction): void {
        let token = <string>request.headers.tokenkey
        let save = (<string>request.headers.save).toLowerCase() == 'true'

        response.status(StatusCodes.Ok)
        response.send({
            question: undefined,
            win: {
                time: Date.now() - Number(RunningGameStorage.instance().getTime(token)),
                level: RunningGameStorage.instance().getLevel(token),
                difficulty: RunningGameStorage.instance().getDifficulty(token),
                win: RunningGameStorage.instance().getLevel(token) == 16
            }
        })

        RunningGameStorage.instance().endGame(token, save)

        response.end()
    }
}

export default GameController
