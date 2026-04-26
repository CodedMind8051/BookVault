import { Book } from "../models/book.model.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { ApiError } from "../utils/ApiError.utils.js"
import { ApiResponse } from "../utils/ApiResponse.utils.js"
import mongoose from "mongoose"
import { Borrow } from "../models/borrow.model.js"




const searchBooks = asyncHandler(async (req, res) => {
    const { BookInfo, page } = req?.query || req?.body

    if (!BookInfo || BookInfo?.toString()?.trim() === "" || !page ) {
        throw new ApiError(400, "BookInfo and page are required.", true)
    }

    const PaginateOptions = {
        page: parseInt(page),
        limit: 20
    }

    const Books = await Book.paginate({
        $or: [
            { BookName: { $regex: BookInfo, $options: "i" } },
            { Author: { $regex: BookInfo, $options: "i" } },
            { Category: { $regex: BookInfo, $options: "i" } }]
    },
        PaginateOptions)

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

    const dueDate = new Date()
    dueDate.set(dueDate.getDate() + 7)

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

    if (!borrowBook || borrowBook.status === "returned") {
        const createdBorrowEntry = await Borrow.create({
            userId: user._id,
            bookId: bookId,
            borrowDate: new Date(),
            dueDate: dueDate,
            dueDateExtensionCount: 0
        })



        if (!createdBorrowEntry) {
            throw new ApiError(500, "Book not borrowed due to some internal error , please try again.", true)
        }

        user.numberOfBooksBorrowed += 1
        await user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(new ApiResponse(200, { createdBorrowEntry }, "Book Borrowed Successfully."))
    }


    if (borrowBook?.dueDateExtensionCount === 1) {
        throw new ApiError(400, "You can not extend DueDate more than 1 time for a  single borrowed book.", true)
    }

    borrowBook.dueDateExtensionCount = 1
    borrowBook.status = "borrowed"
    borrowBook.dueDate.setDate(borrowBook.dueDate.getDate() + 7)

    await borrowBook.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, { dueDate: borrowBook.dueDate }, "Book Due date extended successfully."))


})

const ReturnBook = asyncHandler(async (req, res) => {
    const { bookId } = req?.params
    const { user } = req?.user

    if (!bookId || bookId.toString().trim() === "" || !mongoose.Types.ObjectId.isValid(bookId)) {
        throw new ApiError(400, "Invalid book id.", true)
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

    if (!borrowBook || borrowBook.status === "returned") {
        throw new ApiError(400, "No active borrow found for this book.", true)
    }

    borrowBook.returnDate = new Date()
    borrowBook.status = "returned"

    user.numberOfBooksBorrowed = user.numberOfBooksBorrowed > 0 ? user.numberOfBooksBorrowed - 1 : 0

    await borrowBook.save({ validateBeforeSave: false })

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, { returnDate: borrowBook.returnDate, BookStatus: borrowBook.status }, "Book return successfully."))



})


export { searchBooks, borrowBooks, ReturnBook }