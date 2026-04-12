import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"


const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, password, mobileNumber, Addresh, category="general" } = req.body

    if ([userName, email, password, mobileNumber, Addresh].some((filed) => !filed || filed?.trim() === "")) {
        throw new ApiError(400, "All fields are required.")
    }

}

)



export { registerUser }