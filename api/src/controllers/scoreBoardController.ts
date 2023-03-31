import {NextFunction, Request, Response, Router} from "express";
import {sequelize} from "../db/sequelizeConnector";
import ScoreBoard from "../models/scoreBoard";
import {StatusCodes} from "../utilites/StatusCodes";

export class ScoreBoardController {
    public readonly path = '/scoreBoard'
    public router = Router()

    constructor() {
        this.router.get(this.path, this.getAll)
        this.router.get(this.path + '/top', this.getTopX)
    }

    getAll(request: Request, response: Response, next: NextFunction): void {
        sequelize.sync().then(() => {
            ScoreBoard.findAll().then(r => {
                response.send(r)
                response.end()
            }).catch(e => {
                response.sendStatus(StatusCodes.InternalError)
                response.end()
            })
        }).catch(e => {
            response.sendStatus(StatusCodes.ServiceUnavailable)
            response.end()
        })
    }

    getTopX(request: Request, response: Response, next: NextFunction): void {
        let x = Number(request.headers.topx)
        sequelize.sync().then(() => {
            ScoreBoard.findAll().then(r => {
                let results = new Array<ScoreBoard>()
                let scores = new Map<number, number>()

                for (let i = 0; i < r.length; i++) {
                    let item = r.at(i)
                    if (item) {
                        scores.set(i, item.level * (1 / Number(item.time)))
                    }
                }

                const sortedScores = new Map([...scores.entries()].sort((a, b) => b[1] - a[1]));
                let index = 0

                sortedScores.forEach((value, key) => {
                    if (index >= x) {
                        return
                    }

                    index++
                    results.push(r[key])
                })

                response.send(results)
                response.end()
            }).catch(e => {
                response.sendStatus(StatusCodes.InternalError)
                response.end()
            })
        }).catch(e => {
            response.sendStatus(StatusCodes.ServiceUnavailable)
            response.end()
        })
    }
}
