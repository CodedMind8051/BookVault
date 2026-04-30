import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.utils.js"


const AuthenticateJwtToken = async (req, _, next) => {

    try {
        const { accessToken } = req?.signedCookies || req?.cookies

        if (!accessToken || accessToken.trim() === "") {
            throw new ApiError(400, "Unauthorized request", true)
        }

        const decodedToken = await jwt.verify(accessToken, process.env.JWT_AccessToken_SECRET_KEY)

        const user = await User.findById(decodedToken?.userId).select("-password -refreshToken ")

        if (!user || user?.bannedStatus) {
            let error = user?.bannedStatus ? "You are banned by the admin" : "Unauthorized request"
            throw new ApiError(400, error, true)
        }

        req.user = user

        next()

    } catch (err) {
        next(err)
    }
}


export { AuthenticateJwtToken }