import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { DeleteLocalSaveImgFile } from "../utils/DeleteLocalSaveImageFile.utils.js"
import validator from "validator"
import { User } from "../models/user.model.js"
import { File_UploadToCloudinary } from "../utils/cloudinary.utils.js"
import { CookiesOptions } from "../constants.js"




const generate_Access_Refresh_Token = async (userId) => {

    const user = await User.findById(userId)
    const AccessToken = await user.generateAccessToken()
    const RefreshToken = await user.generateRefreshToken()

    if (!AccessToken || !RefreshToken) {
        throw new ApiError("500", "Something went wrong during generating access and refresh token , please try again.")
    }

    user.refreshToken = RefreshToken
    user.save({ validateBeforeSave: false })

    return { AccessToken, RefreshToken }

}

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, password, mobileNumber, address, category = "general" } = req.body
    const avatarImageLocalPath = req?.file?.path

    if (!avatarImageLocalPath) {
        throw new ApiError(400, "Avatar image is required.")
    }



    if ([userName, email, password, mobileNumber, address].some((field) => !field || field?.trim() === "")) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(400, "All fields are required.")
    }

    if (!validator.isEmail(email) || !validator.isMobilePhone(mobileNumber.toString()) || password.trim().length < 8) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(
            400,
            `${!validator.isEmail(email) ? "Invalid email format." : ""} ${!validator.isMobilePhone(mobileNumber.toString()) ? "Invalid mobile number format." : ""} ${password.trim().length < 8 ? "Password must be at least 8 characters long." : ""}`.trim().replaceAll("\n", "")
        )
    }




    const userExisted = await User.findOne(
        {
            $or: [
                { userName },
                { email }
            ]
        }
    )

    if (userExisted) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(400, "User with email or username already exists.")
    }


    const avatarImgPublicUrl = await File_UploadToCloudinary(avatarImageLocalPath)

    if (!avatarImgPublicUrl) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(500, "Avatar image is not uploaded successfully to cloud  server , please try again.")
    }

    const CreatedUser = await User.create({
        userName,
        email,
        password,
        mobileNumber,
        address: address,
        avatarImage: avatarImgPublicUrl,
        category
    })


    if (!CreatedUser) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(500, "User is not created successfully , please try again.")
    }

    const { AccessToken, RefreshToken } = await generate_Access_Refresh_Token(CreatedUser._id)

    res
        .status(200)
        .cookie("accessToken", AccessToken, CookiesOptions)
        .cookie("refreshToken", RefreshToken,CookiesOptions)
        .json(new ApiResponse(200, "", "User registered successfully."))


}

)



export { registerUser }