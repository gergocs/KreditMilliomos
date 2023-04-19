import {NextFunction, Request, Response, Router} from "express";
import {sequelize} from "../db/sequelizeConnector";
import ScoreBoard from "../models/scoreBoard";
import {StatusCodes} from "../utilites/StatusCodes";
import User from "../models/user";
import CacheHandler from "../utilites/cacheHandler";

export class ScoreBoardController {
    public readonly path = '/scoreBoard'
    public router = Router()

    constructor() {
        this.router.get(this.path, this.getAll)
        this.router.get(this.path + '/top', this.getTopX)
    }

    getAll(request: Request, response: Response, next: NextFunction): void {
        let token = request.headers.tokenkey
        let isTokenNeeded = true

        if (!token || typeof token !== "string" || token.length > 28 || Array.isArray(token)) {
            response.sendStatus(StatusCodes.NotFound)
            response.end()
        }

        if (request.headers.istoken !== "true") {
            isTokenNeeded = false
        }

        token = <string>token

        sequelize.sync().then(() => {
            ScoreBoard.findAll(isTokenNeeded ? {
                    where: {
                        tokenKey: token
                    }
                } : undefined
            ).then(r => {
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

        if (!x || Array.isArray(x) || Number.isNaN(x)) {
            response.sendStatus(StatusCodes.NotFound)
            response.end()
        }

        sequelize.sync().then(() => {
            ScoreBoard.findAll().then(async r => {
                let results = new Map<string, number>()
                let retVal = new Map<string, number>()

                for (let i = 0; i < r.length; i++) {
                    if (results.has(r[i].tokenKey)) {
                        // @ts-ignore
                        results.set(r[i].tokenKey, results.get(r[i].tokenKey) + r[i].level)
                    } else {
                        results.set(r[i].tokenKey, r[i].level)
                    }
                }

                results = new Map([...results.entries()].sort((a, b) => b[1] - a[1]));

                for (let [key, value] of results.entries()) {
                    if (retVal.size >= x || retVal.size + 1 === results.size) {
                        // This endpoint is expensive, so we must cache the response.
                        CacheHandler.getInstance().set(request.originalUrl, {
                            result: Object.fromEntries(retVal)
                        }, 300) // cache for 5 minutes
                        response.send({
                            result: Object.fromEntries(retVal)
                        })
                        response.end()
                        break;
                    }

                    let user = await User.findOne({where: {tokenKey: key}});

                    if (user && !user.isAdmin) {
                        retVal.set(user.name, value)
                    }
                }
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
