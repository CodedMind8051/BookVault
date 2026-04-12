import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { BaseEndPoint } from "./constants.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.static("public"))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())


//routes import 

import userRoute from "./routes/user.routes.js"


//decelear routes 

app.use(`${BaseEndPoint}/users`, userRoute)


//handel error 
app.use((err, req , res , next) => {
   
    if (!res.headersSent) {
        return res.status(400).json(err?.message || err?.code || err)
    }

})

export { app }

