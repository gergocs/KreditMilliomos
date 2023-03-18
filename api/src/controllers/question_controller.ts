import {Request, Response, NextFunction, Router} from 'express'
import Question from '../models/question'
import {sequelize} from '../db/sequelizeConnector'
import {StatusCodes} from '../utilites/StatusCodes'

class QuestionController {

    public readonly path = '/question'
    public router = Router()

    constructor() {
        this.router.get(this.path + '/admin/allQuestion', this.getAllQuestion)
        this.router.post(this.path + '/admin/import', this.importQuestion)
        this.router.post(this.path + '/admin', this.createQuestion)
        this.router.delete(this.path + '/admin', this.deleteQuestion)
    }

    createQuestion(request: Request, response: Response, next: NextFunction) {
        //TODO validate input
        sequelize.sync()
            .then(() => {
                Question.create({
                    category: request.body.category as string,
                    question: request.body.question as string,
                    level: request.body.level as number,
                    answerA: request.body.answerA as string,
                    answerB: request.body.answerB as string,
                    answerC: request.body.answerC as string,
                    answerD: request.body.answerD as string,
                    answerCorrect: request.body.answerCorrect as string
                })
                    .then(data => {
                        response.sendStatus(StatusCodes.Ok)
                        response.end()
                    })
                    .catch(error => {
                        response.sendStatus(StatusCodes.InternalError)
                        response.end()
                    })
            })
            .catch(error => {
                response.sendStatus(StatusCodes.ServiceUnavailable)
                response.end()
            })
    }

    importQuestion(request: Request, response: Response, next: NextFunction) {
        sequelize.sync()
            .then(() => {
                Question.bulkCreate(request.body)
                    .then(data => {
                        response.sendStatus(StatusCodes.Ok)
                        response.end()
                    })
                    .catch(error => {
                        response.sendStatus(StatusCodes.InternalError)
                        response.end()
                    })
            })
            .catch(error => {
                response.sendStatus(StatusCodes.ServiceUnavailable)
                response.end()
            })
    }

    getAllQuestion(request: Request, response: Response, next: NextFunction) {
        sequelize.sync().then(() => {
            Question.findAll().then(data => {
                response.send(data)
                response.end()
            }).catch(error => {
                response.sendStatus(StatusCodes.InternalError)
                response.end()
            })
        }).catch(error => {
            response.sendStatus(StatusCodes.ServiceUnavailable)
            response.end()
        })
    }

    deleteQuestion(request: Request, response: Response, next: NextFunction) {
        let question = request.body.question

        if (!question) {
            response.sendStatus(StatusCodes.IAmATeaPod)
            response.end()
        }

        sequelize.sync().then(() => {
            Question.destroy({where: {question: question}}).then(r => {
                response.sendStatus(StatusCodes.NoContent)
                response.end()
            }).catch(error => {
                response.sendStatus(StatusCodes.InternalError)
                response.end()
            })
        }).catch(error => {
            response.sendStatus(StatusCodes.ServiceUnavailable)
            response.end()
        })
    }
}

export default QuestionController
