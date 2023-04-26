import {NextFunction, Request, Response, Router} from "express";
import {StatusCodes} from "../utilites/StatusCodes";
import {sequelize} from "../db/sequelizeConnector";
import Achievement from "../models/achievement";
import {Op} from "sequelize";
import User from "../models/user";
import user from "../models/user";
import CacheHandler from "../utilites/cacheHandler";

class AchievementController {

    public readonly path = '/achievements';
    public router = Router()

    constructor() {
        this.router.get(this.path, this.getAchievements)
        this.router.get(this.path + '/status', this.getAchievementStatus)
    }

    private async getAchievements(request: Request, response: Response, next: NextFunction) {
        let tokens = new Array<string>()
        let users

        if ((<string>request.headers.tokenkey).length === 0) {
            let names = JSON.parse(<string>request.headers.tokens)

            if (!Array.isArray(names)) {
                response.sendStatus(StatusCodes.BadRequest)
                response.end()
                return
            }

            await sequelize.sync()
            users = await User.findAll({
                where: {
                    name: {
                        [Op.in]: <string[]>names
                    }
                }
            })

            for (let i = 0; i < users.length; i++) {
                tokens.push(users[i].tokenKey)
            }
        } else {
            users = undefined
            tokens.push(<string>request.headers.tokenkey)
        }
        sequelize.sync().then(() => {
            Achievement.findAll({
                where: {
                    tokenKey: {
                        [Op.in]: <string[]>tokens
                    }
                }
            }).then(r => {
                let result = new Map<string, string[]>()
                for (let i = 0; i < tokens.length; i++) {
                    result.set(tokens[i], new Array<string>())
                }

                for (let i = 0; i < r.length; i++) {
                    result.set(r[i].tokenKey, r[i].achievement)
                }

                if (users) {
                    for (let i = 0; i < users.length; i++) {
                        let tmp = result.get(users[i].tokenKey)

                        if (!tmp) {
                            continue
                        }

                        result.delete(users[i].tokenKey)
                        result.set(users[i].name, tmp)
                    }
                }

                response.send(Object.fromEntries(result))
                response.end()
            }).catch(err => {
                response.sendStatus(StatusCodes.InternalError)
                response.end()
            })
        }).catch(err => {
            response.sendStatus(StatusCodes.ServiceUnavailable)
            response.end()
        })
    }

    private async getAchievementStatus(request: Request, response: Response, next: NextFunction) {
        let token = request.headers.tokenkey

        if (typeof token !== 'string') {
            response.sendStatus(StatusCodes.BadRequest)
            response.end()
            return
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // TODO move this code to frontend

        let map = CacheHandler.getInstance().get(token + 'achievements')

        response.send({
            result: Object.fromEntries(map)
        })
    }
}

export default AchievementController
