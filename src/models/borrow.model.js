import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate";


const borrowSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },

    borrowDate: {
        type: Date,
        default: Date.now,
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    returnDate: {
        type: Date
    },

    copiesBorrowed: {
        type: Number,
        default: 1,
        min: 1,
        max: 2
    },

    status: {
        type: String,
        enum: ["borrowed", "returned", "overdue"],
        default: "borrowed"
    }

}, { timestamps: true });



mongoose.plugin(mongoosePaginate)
export const Borrow = mongoose.model("Borrow", borrowSchema);