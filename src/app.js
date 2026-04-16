import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { BaseEndPoint } from "./constants.js"
import { DeleteLocalSaveImgFile } from "../src/utils/DeleteLocalSaveImageFile.utils.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.static("public"))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser(process.env.COOKIE_SECRET_KEY))


//routes import 

import userRoute from "./routes/user.routes.js"


//declare routes 

app.use(`${BaseEndPoint}/users`, userRoute)


//handle error 
app.use((err, req, res, next) => {
    console.log(err)
    if (!res.headersSent) {
        DeleteLocalSaveImgFile(req.file?.path)
        return res.status(400).json(
            err?.code === "LIMIT_FILE_SIZE" ? "File too large (max 7MB)" : err?.code === "INVALID_FILE_TYPE" ? err?.message : err?.message || err?.code || "Something went wrong."
        )
    }

    console.log(err?.message || err?.code || err )

})

export { app }

