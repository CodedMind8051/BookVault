import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { DeleteLocalSaveImgFile } from "../utils/DeleteLocalSaveImageFile.utils.js";
import { File_UploadToCloudinary, File_DeleteToCloudinary } from "../utils/cloudinary.utils.js";
import { CloudinaryFolderPathForBookImages } from "../constants.js";
import mongoose from "mongoose";


const AdminAddBooks = asyncHandler(async (req, res) => {
    const { BookName, Author, Category, Description, TotalCopies } = req?.body

    const BookLocalImgPath = req?.file?.path


    if (!BookName || BookName?.toString()?.trim() === "" || !TotalCopies || typeof TotalCopies !== "number") {
        let error = typeof TotalCopies === "number" ? "TotalCopies must be in type number" : "All fields are required."
        throw new ApiError(400, error, true)
    }


    const ExistedBook = await Book.findOne({ BookName })


    if (ExistedBook) {
        DeleteLocalSaveImgFile(BookLocalImgPath)
        ExistedBook.TotalCopies = TotalCopies + ExistedBook.TotalCopies
        ExistedBook.RemainingCopies = TotalCopies + ExistedBook.RemainingCopies
        await ExistedBook.save({ validateBeforeSave: false })
        return res
            .status(200)
            .json(new ApiResponse(200, { ExistedBook }, "Book added successfully."))

    }

    if (!BookLocalImgPath) {
        throw new ApiError(400, "Book image is required.", true)
    }

    if ([BookName, Author, Category, Description, TotalCopies].some((field) => !field || field?.toString()?.trim() === "") || typeof TotalCopies !== "number") {
        DeleteLocalSaveImgFile(BookLocalImgPath)
        throw new ApiError(400, "All fields are required.", true)
    }

    const { ImageUrl, ImagePublicId } = await File_UploadToCloudinary(BookLocalImgPath, CloudinaryFolderPathForBookImages)

    if (!ImageUrl) {
        DeleteLocalSaveImgFile(BookLocalImgPath)
        throw new ApiError(500, "Book image is not uploaded successfully to cloud  server , please try again.", true)
    }



    const CreatedBook = await Book.create(
        {
            BookName,
            Author,
            Category,
            Description,
            TotalCopies,
            RemainingCopies: TotalCopies,
            BookImage: ImageUrl,
            BookImagePublicId: ImagePublicId
        }
    )

    if (!CreatedBook) {
        DeleteLocalSaveImgFile(BookLocalImgPath)
        await File_DeleteToCloudinary(ImagePublicId)
        throw new ApiError(500, "Book is not added successfully , please try again.", true)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { Book: CreatedBook }, "Book added successfully."))


}
)

const AdminDeleteBooks = asyncHandler(async (req, res) => {

    const { BookId } = req?.params

    if (!BookId) {
        throw new ApiError(400, "Please provide the book id", true)
    }


    if (!mongoose.Types.ObjectId.isValid(BookId)) {
        throw new ApiError(400, "invalid book id.", true)
    }

    const DeletedBook = await Book.findByIdAndDelete(BookId)

    if (!DeletedBook) {
        throw new ApiError(400, "This book not exists in our Db", true)
    }

    const response = await File_DeleteToCloudinary(DeletedBook.BookImagePublicId)
    console.log(response)

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Book deleted successfully."))

})

const updateUserBanStatus = asyncHandler(async (req, res) => {

    const { userId } = req?.params

    if (!userId) {
        throw new ApiError(400, "Please provide user id.", true)

    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "invalid user id.", true)
    }

    const existedUser = await User.findById(userId).select("-password -refreshToken")

    if (!existedUser) {
        throw new ApiError(400, "user not exists.", true)
    }

    existedUser.bannedStatus = !existedUser.bannedStatus

    const updatedUser = await existedUser.save({ validateBeforeSave: false })

    if (!updatedUser) {
        throw new ApiError(500, "Not able to banned user due to some internal problem.", true)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user: updatedUser }, "updated User Ban Status successfully."))
})

const GetBorrowersList = asyncHandler(async (req, res) => {

    const { BookId } = req?.params
    const { page } = req?.query

    if (!BookId) {
        throw new ApiError(400, "Please provide the book id", true)
    }

    if (!mongoose.Types.ObjectId.isValid(BookId)) {
        throw new ApiError(400, "invalid book id.", true)
    }
    if (!page) {
        throw new ApiError(400, "page number must required.", true)
    }

    const PaginateOptions = {
        page: parseInt(page),
        limit: 20,
        select: "-bookId -__v",
        sort: { createdAt: -1 },
        populate: {
            path: "userId",
            select: "userName email avatarImage numberOfBooksBorrowed bannedStatus"
        }
    }


    const borrowersList = await Borrow.paginate({
        bookId: BookId
    }, PaginateOptions,)

    if (!borrowersList) {
        throw new ApiError(500, "Failed to fetch borrowers list , please try again.", true)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { borrowers: borrowersList }, "Borrowers list fetched successfully."))
})

const searchUser = asyncHandler(async (req, res) => {
    const { page } = req?.query
    const { UserInfo } = req?.body

    if (!UserInfo || UserInfo?.toString()?.trim() === "" || !page) {
        throw new ApiError(400, "UserInfo and page are required.", true)
    }

    const PaginateOptions = {
        page: parseInt(page),
        limit: 20,
        select: "-password -refreshToken -avatarImagePublicId -isAdmin ",
    }

    const user = await User.paginate({
        $or: [
            { userName: { $regex: UserInfo, $options: "i" } },
            { email: { $regex: UserInfo, $options: "i" } }
        ]
    },
        PaginateOptions)

    if (!user) {
        throw new ApiError(500, "Failed to fetch user , please try again.", true)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "Fetch user successfully."))
})

export { AdminAddBooks, AdminDeleteBooks, updateUserBanStatus, GetBorrowersList, searchUser } 