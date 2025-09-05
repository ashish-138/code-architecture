import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'


const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(morgan('combined'))



import userRouter from '../src/routes/user.routes.js'


app.use("/api/v1/user", userRouter)



export {app}