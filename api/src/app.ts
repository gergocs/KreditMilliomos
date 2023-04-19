import express, {Application} from 'express'
import * as bodyParser from 'body-parser'
import * as admin from 'firebase-admin'
import {type Auth, getAuth} from 'firebase-admin/auth'
const serviceAccount = require('../kreditmilliomos-firebase-adminsdk-77e37-136a215381.json')
import cors from 'cors'
import {readFileSync} from 'fs'
import * as https from 'https'
import {StatusCodes} from "./utilites/StatusCodes";
import {sequelize} from './db/sequelizeConnector'
import User from "./models/user";
import TrustedTokenHandler from "./utilites/trustedTokenHandler";
import CacheHandler from "./utilites/cacheHandler";

class App {
    public app: Application
    public readonly port: number
    private readonly fireAuth: Auth

    constructor(controllers, port) {
        this.app = express()
        this.port = port

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })

        this.fireAuth = getAuth()
        this.initializeMiddlewares()
        this.initializeControllers(controllers)
    }

    private initializeMiddlewares(): void {
        this.app.use(cors({
            origin: '*' // TODO limit for only specific origins
        }))

        this.app.use(bodyParser.json())
        this.app.use((req, res, next): void => {
            if (req.method === 'GET' && req.path.includes('/scoreBoard/top')){
                next()
                return
            } else {
                if (req.headers.tokenkey === undefined) {
                    res.status(StatusCodes.Unauthorized).send('No token')
                    res.end()
                    return
                }

                if (TrustedTokenHandler.instance().isValidToken(req.headers.tokenkey as string)){
                    next()
                } else {
                    this.fireAuth.getUser(req.headers.tokenkey as string).then(r => {
                        TrustedTokenHandler.instance().addToken(req.headers.tokenkey as string)
                        next()
                    }).catch(er => {
                        res.status(StatusCodes.Unauthorized).send('Invalid token')
                        res.end()
                    })
                }
            }
        })

        this.app.use((request, response, next) => {
            if (request.method !== 'GET'
                || (!request.path.includes('/scoreBoard')
                    && !request.path.includes('playableQuestionCategories')
                    && !request.path.includes('allUsers')
                    && !request.path.includes('allQuestion'))) {
                return next()
            }

            const key = request.originalUrl
            const cached = CacheHandler.getInstance().get(key)

            if (cached) {
                response.send(cached)
            } else {
                next()
            }
        })

        this.app.use((req, res, next): void => {
            if (!req.path.includes('admin')) {
                next()
            }else{
                const tokenKey = req.headers.tokenkey

                sequelize.sync()
                    .then(() => {
                        User.findOne({where: {tokenKey}})
                            .then(user => {
                                if (user && user.isAdmin) {
                                    next()
                                } else {
                                    res.sendStatus(StatusCodes.Unauthorized)
                                    res.end()
                                }
                            })
                            .catch(error => {
                                res.sendStatus(StatusCodes.InternalError)
                                res.end()
                            })
                    })
                    .catch(error => {
                        res.sendStatus(StatusCodes.ServiceUnavailable)
                        res.end()
                    })
            }

        })
    }

    private initializeControllers(controllers): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router)
        })
    }

    public listen(isHttps = false): void {
        sequelize.validate().then(r => {
            console.log('Database connection is valid')
            sequelize.authenticate().then(r => {
                console.log("Authenticated successfully")
            }).catch(e => {
                console.log("Failed to authenticate")
                console.log(e)
                process.exit()
                return
            })
        }).catch(e => {
            console.log('Database connection is invalid')
            console.log(e)
            process.exit()
            return
        })

        if (isHttps) {
            const options = {
                key: readFileSync('/etc/letsencrypt/live/kreditmilliomos.mooo.com/privkey.pem'),
                cert: readFileSync('/etc/letsencrypt/live/kreditmilliomos.mooo.com/fullchain.pem'),
            };

            https.createServer(options, this.app).listen(80, function () {
                console.log("Express server listening on port " + 80);
            });
        } else {
            this.app.listen(this.port, () => {
                console.log(`App listening on the port ${this.port}`)
            })
        }
    }
}

export default App
