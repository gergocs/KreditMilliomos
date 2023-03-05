import express from 'express'
import * as bodyParser from 'body-parser'
import * as admin from 'firebase-admin'
import {type Auth, getAuth} from 'firebase-admin/auth'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../kreditmilliomos-firebase-adminsdk-77e37-136a215381.json')
import cors from 'cors'
import {StatusCodes} from "./utilites/StatusCodes";

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
                return
            }

            this.fireAuth.getUser(req.headers.tokenkey as string).then(r => {
                next()
            }).catch(er => {
                res.status(StatusCodes.Unauthorized).send('Invalid token')
            })
        })
    }

    private initializeControllers(controllers): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router)
        })
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`)
        })
    }
}

export default App
