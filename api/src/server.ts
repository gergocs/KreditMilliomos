import App from './app'
import UserController from './controllers/userController'
import QuestionController from './controllers/questionController'
import gameController from "./controllers/gameController";
import * as dotenv from 'dotenv'
import * as process from "process";
import {ScoreBoardController} from "./controllers/scoreBoardController";
import HealthController from './controllers/healthController';
import AchievementController from "./controllers/achievementController";

dotenv.config()

const app = new App(
    [
        new UserController(),
        new QuestionController(),
        new gameController(),
        new ScoreBoardController(),
        new HealthController(),
        new AchievementController()
    ],
    process.env.PORT || 8080
)

app.listen(process.argv[2] == "https")
