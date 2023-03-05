import {Request, Response, NextFunction, Router} from 'express'
import Question from '../models/question'
import {sequelize} from '../db/sequelizeConnector'
import {StatusCodes} from '../utilites/StatusCodes'

class QuestionController {

    public readonly path = '/question'
    public router = Router()

    constructor() {
        this.router.post(this.path + '/create', this.createQuestion)
    }

    createQuestion(request: Request, response: Response, next: NextFunction) {

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
                    })
                    .catch(error => response.sendStatus(StatusCodes.InternalError))
            })
            .catch(error => response.sendStatus(StatusCodes.ServiceUnavailable))
    }
}

export default QuestionController
