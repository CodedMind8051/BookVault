import { ApiError } from "../utils/ApiError.utils.js";
import { User } from "../models/user.model.js";

const isAdmin = async (req, _, next) => {
    try {

        const user = req?.user

        if (!user || !user.isAdmin) {
            throw new ApiError(400, "Unauthorized request.", true)
        }

        next()

    } catch (error) {
        next(error)
    }
}

export { isAdmin }