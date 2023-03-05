import App from './app'
import UserController from './controllers/user_controller'
import QuestionController from './controllers/question_controller'
import * as dotenv from 'dotenv'

dotenv.config()

const app = new App(
  [
    new UserController(),
    new QuestionController()
  ],
  process.env.PORT || 8080
)

app.listen()
