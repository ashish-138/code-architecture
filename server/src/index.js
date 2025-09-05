import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
})


import { app } from './app.js'
import connectDB from './db/index.js'


connectDB().then(()=>{
    app.listen(process.env.PORT || 8001, ()=>{
        console.log("Server is running!")
    })
}).catch((error)=>{
    console.log("Mongodb connection failed!")
})