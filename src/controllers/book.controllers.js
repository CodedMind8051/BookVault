import { Book } from "../models/book.model.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import mongoose from "mongoose"
import {Borrow} from "../models/borrow.model.js"


const searchBooks = asyncHandler(async (req, res) => {
    const { BookInfo, page } = req?.query || req?.body

    if (!BookInfo || BookInfo?.toString()?.trim() === "" || !page) {
        let error = typeof page === "number" ? "page must be in type number" : "BookInfo and page are required."
        throw new ApiError(400, error, true)
    }

    const options = {
        page: parseInt(page),
        limit: 20
    }

    const Books = await Book.paginate({
        $or: [
            { BookName: { $regex: BookInfo, $options: i } },
            { Author: { $regex: BookInfo, $options: i } },
            { Category: { $regex: BookInfo, $options: i } }]
    },
        options)

    if (!Books) {
        throw new ApiError(500, "Failed to fetch books , please try again.", true)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { Books }, "Fetch books successfully."))
})

const borrowBooks = asyncHandler(async (req, res) => {
    const { bookId } = req?.params
    const { user } = req?.user

    if (!bookId || bookId.toString().trim() === "" || !mongoose.Types.ObjectId.isValid(bookId)) {
        throw new ApiError(400, "Invalid book id.", true)
    }

    if (user.numberOfBooksBorrowed >= 7) {
        throw new ApiError(400, "Borrow limit exceeded, max 7 books at a time.", true)
    }

    const existedBook = await Book.findById(bookId)

    if (!existedBook) {
        throw new ApiError(400, "Book not found.", true)
    }

    const borrowBook = await Borrow.findOne(
        {
            $and: [
                { userId: user._id },
                { bookId: bookId }
            ]
        }
    )

    if (!borrowBook) {
        const createdBorrowEntry = await Borrow.Create({
            userId:user._id,
            bookId:bookId,
            dueDate:
        })
    }



})

export { searchBooks, borrowBooks }