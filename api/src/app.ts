import express from 'express'
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

class App {
    public app: express.Application
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
