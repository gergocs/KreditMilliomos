import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = 3000

app.get('/', (req, res) => {

  res.send('main page')
})


//TODO: Kiszervezni a Typescript routingot OOP szerint
app.post('/', (req, res) => {

  console.log(JSON.stringify(req.headers.tokenkey))
  res.sendStatus(200)})


app.listen(port, () => console.log(`[server]: Server is running at http://localhost:${port}`))
