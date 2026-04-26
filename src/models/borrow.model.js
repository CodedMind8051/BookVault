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
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    returnDate: {
        type: Date
    },

    dueDateExtensionCount: {
        type: Number,
        min: 0,
        max: 1
    },

    status: {
        type: String,
        enum: ["borrowed", "returned", "overdue"],
        default: "borrowed"
    }

}, { timestamps: true });



mongoose.plugin(mongoosePaginate)
export const Borrow = mongoose.model("Borrow", borrowSchema);