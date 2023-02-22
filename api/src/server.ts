import App from './app'
import UserController from './controller/user_controller'

const app = new App(
  [
    new UserController()
  ],
  3000
)

app.listen()
