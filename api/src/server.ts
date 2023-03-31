import App from './app'
import UserController from './controllers/userController'
import QuestionController from './controllers/questionController'
import gameController from "./controllers/gameController";
import * as dotenv from 'dotenv'
import * as process from "process";
import {ScoreBoardController} from "./controllers/scoreBoardController";

dotenv.config()

const app = new App(
    [
        new UserController(),
        new QuestionController(),
        new gameController(),
        new ScoreBoardController()
    ],
    process.env.PORT || 8080
)

app.listen(process.argv[2] == "https")
