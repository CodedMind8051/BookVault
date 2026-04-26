import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import { DeleteLocalSaveImgFile } from "../utils/DeleteLocalSaveImageFile.utils.js"
import validator from "validator"
import { User } from "../models/user.model.js"
import { File_UploadToCloudinary, File_DeleteToCloudinary } from "../utils/cloudinary.utils.js"
import { CookiesOptions, CloudinaryFolderPathForUserProfileImages } from "../constants.js"
import jwt from "jsonwebtoken";
import { Borrow } from "../models/borrow.model.js"





const generate_Access_Refresh_Token = async (userId) => {


    try {

        const user = await User.findById(userId)
        const AccessToken = await user.generateAccessToken()
        const RefreshToken = await user.generateRefreshToken()

        if (!AccessToken || !RefreshToken) {
            throw new ApiError("500", "Something went wrong during generating access and refresh token , please try again.", true)
        }

        user.refreshToken = RefreshToken
        await user.save({ validateBeforeSave: false })

        return { AccessToken, RefreshToken }
    } catch (error) {
        return null
    }

}

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, password, mobileNumber, address, category = "general" } = req?.body
    const avatarImageLocalPath = req?.file?.path

    if (!avatarImageLocalPath) {
        throw new ApiError(400, "Avatar image is required.", true)
    }



    if ([userName, email, password, mobileNumber, address].some((field) => !field || field?.toString()?.trim() === "")) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(400, "All fields are required.", true)
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
        throw new ApiError(400, "User with email or username already exists.", true)
    }


    const { ImageUrl, ImagePublicId } = await File_UploadToCloudinary(avatarImageLocalPath, CloudinaryFolderPathForUserProfileImages)

    if (!ImageUrl) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        throw new ApiError(500, "Avatar image is not uploaded successfully to cloud  server , please try again.", true)
    }

    const CreatedUser = await User.create({
        userName,
        email,
        password,
        mobileNumber,
        address: address,
        avatarImage: ImageUrl,
        avatarImagePublicId: ImagePublicId,
        category
    })



    if (!CreatedUser) {
        DeleteLocalSaveImgFile(avatarImageLocalPath)
        await File_DeleteToCloudinary(ImagePublicId)
        throw new ApiError(500, "User is not created successfully , please try again.", true)
    }

    const { AccessToken, RefreshToken } = await generate_Access_Refresh_Token(CreatedUser._id)

    const user = await User.findById(CreatedUser?._id).select("-password -refreshToken -bannedStatus")

    return res
        .status(200)
        .cookie("accessToken", AccessToken, CookiesOptions)
        .cookie("refreshToken", RefreshToken, CookiesOptions)
        .json(new ApiResponse(200, { user: user }, "User registered successfully."))


}

)


const loginUser = asyncHandler(async (req, res) => {

    const { Username_OR_Email, password } = req?.body

    if ([Username_OR_Email, password].some((field) => !field || field?.toString()?.trim() === "")) {
        throw new ApiError(400, "All filed are required.", true)
    }

    const ExistedUser = await User.findOne({
        $or: [{ userName: Username_OR_Email?.toString()?.trim().toLowerCase() }, { email: Username_OR_Email?.toString()?.trim() }]
    })

    if (!ExistedUser) {
        throw new ApiError(400, "User with this username or email not exist", true)
    }

    if (ExistedUser.bannedStatus) {
        throw new ApiError(400, "You are banned by the admin ", true)
    }

    const VerifiedPassword = await ExistedUser.CheckPassword(password)

    if (!VerifiedPassword) {
        throw new ApiError(400, "Wrong password , please enter correct password and try again.", true)
    }


    const { AccessToken, RefreshToken } = await generate_Access_Refresh_Token(ExistedUser?._id)

    const loggedInUser = await User.findById(ExistedUser?._id).select("-password -refreshToken -bannedStatus")

    return res
        .status(200)
        .cookie("accessToken", AccessToken, CookiesOptions)
        .cookie("refreshToken", RefreshToken, CookiesOptions)
        .json(new ApiResponse(200, { user: loggedInUser }, "User login successfully."))



})

const RenewAccessToken = asyncHandler(async (req, res) => {


    const IncomingRefreshToken = req?.signedCookies?.refreshToken || req?.cookies?.refreshToken


    if (!IncomingRefreshToken || IncomingRefreshToken.trim() === "") {
        throw new ApiError(400, "Unauthorized request.", true)
    }

    const DecodedToken = await jwt.verify(IncomingRefreshToken, process.env.JWT_RefreshToken_SECRET_KEY)

    const user = await User.findById(DecodedToken?.userId).select("-password")

    if (!user || IncomingRefreshToken !== user?.refreshToken || user?.bannedStatus) {
        let error = user?.bannedStatus ? "You are banned by the admin." : "Unauthorized request."
        throw new ApiError(400, error, true)
    }

    const { AccessToken, RefreshToken } = await generate_Access_Refresh_Token(user._id)

    return res
        .status(200)
        .cookie("accessToken", AccessToken, CookiesOptions)
        .cookie("refreshToken", RefreshToken, CookiesOptions)
        .json(
            new ApiResponse(200, "", "Renew access token successfully")
        )

})

const fetchBorrowHistory = asyncHandler(async (req, res) => {
    const { page } = req?.query || req?.body
    const user = req?.user

    if (!page) {
        throw new ApiError(400, "page number must required.", true)
    }

    const PaginateOptions = {
        page: parseInt(page),
        limit: 20,
        select: "-userId"
    }

    const BorrowHistory = await Borrow.paginate({
        userId: user._id
    }, PaginateOptions)

    if (!BorrowHistory) {
        throw new ApiError(500, "Failed to fetch borrowed history , please try again.", true)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { BorrowHistory }, "Your are not borrowed any book yet"))


})

export { registerUser, loginUser, RenewAccessToken, fetchBorrowHistory }
