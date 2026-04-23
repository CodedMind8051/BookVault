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
import adminRoute from "./routes/admin.routes.js"
import bookRoute from "./routes/book.routes.js"


//declare routes 
app.use(`${BaseEndPoint}/users`, userRoute)
app.use(`${BaseEndPoint}/admin`, adminRoute)
app.use(`${BaseEndPoint}/book`, bookRoute)


//handle error 
app.use((err, req, res, next) => {

    !err.ShowToUser ? console.error(err) : null

    if (!res.headersSent) {
        DeleteLocalSaveImgFile(req.file?.path)
        return res.status(err?.statusCode || 500).json(
            err?.code === "LIMIT_FILE_SIZE" ? { statusCode: 400, message: "File too large (max 7MB)", success: false } : err?.code === "INVALID_FILE_TYPE" ? { statusCode: 400, message: err?.message, success: false } : err?.ShowToUser ? { statusCode: 400, message: err?.message, success: false } : { statusCode: 500, message: "Something went wrong , please try again.", success: false }
        )
    }


})

export { app }

