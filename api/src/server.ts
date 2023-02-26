import App from './app'
import UserController from './controller/user_controller'
import * as dotenv from 'dotenv'
dotenv.config()

const app = new App(
  [
    new UserController()
  ],
  process.env.PORT || 8080
)

app.listen()
