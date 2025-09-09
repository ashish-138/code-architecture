import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser';
import errorHandler from '../src/middlewares/error.middleware.js'


const app = express()

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin); 
  },
  credentials: true
}));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser());
app.use(morgan('combined'))



import userRouter from '../src/routes/user.routes.js'


app.use("/api/v1/user", userRouter)


app.use(errorHandler)
export {app}
