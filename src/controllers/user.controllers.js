import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { DeleteLocalSaveImgFile } from "../utils/DeleteLocalSaveImageFile.utils.js"
import validator from "validator"
import { User } from "../models/user.model.js"
import { File_UploadToCloudinary, File_DeleteToCloudinary } from "../utils/cloudinary.utils.js"
import { CookiesOptions, CloudinaryFolderPathForUserProfileImages } from "../constants.js"




const generate_Access_Refresh_Token = async (userId) => {

    const user = await User.findById(userId)
    const AccessToken = await user.generateAccessToken()
    const RefreshToken = await user.generateRefreshToken()

    if (!AccessToken || !RefreshToken) {
        throw new ApiError("500", "Something went wrong during generating access and refresh token , please try again.", true)
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
        throw new ApiError(400, "All fields are required." , true)
    }

    if (!validator.isEmail(email) || !validator.isMobilePhone(mobileNumber.toString()) || password.trim().length < 8) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(
            400,
            `${!validator.isEmail(email) ? "Invalid email format." : ""} ${!validator.isMobilePhone(mobileNumber.toString()) ? "Invalid mobile number format." : ""} ${password.trim().length < 8 ? "Password must be at least 8 characters long." : ""}`.trim().replaceAll("\n", ""),
            true
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
        throw new ApiError(400, "User with email or username already exists." , true)
    }


    const { AvatarImageUrl, AvatarImagePublicId } = await File_UploadToCloudinary(avatarImageLocalPath, CloudinaryFolderPathForUserProfileImages)

    if (!AvatarImageUrl) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(500, "Avatar image is not uploaded successfully to cloud  server , please try again." , true)
    }

    const CreatedUser = await User.create({
        userName,
        email,
        password,
        mobileNumber,
        address: address,
        avatarImage: AvatarImageUrl,
        avatarImagePublicId: AvatarImagePublicId,
        category
    })



    if (!CreatedUser) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        await File_DeleteToCloudinary(AvatarImagePublicId)
        throw new ApiError(500, "User is not created successfully , please try again.", true)
    }

    const { AccessToken, RefreshToken } = await generate_Access_Refresh_Token(CreatedUser._id)

    res
        .status(200)
        .cookie("accessToken", AccessToken, CookiesOptions)
        .cookie("refreshToken", RefreshToken, CookiesOptions)
        .json(new ApiResponse(200, "", "User registered successfully."))


}

)



export { registerUser }