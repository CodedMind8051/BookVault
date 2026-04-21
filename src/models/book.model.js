import mongoose, { Schema } from "mongoose";

const BookSchema = new Schema({
    BookName: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    Author: {
        type: String,
        required: true,
        index: true
    },
    Category: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    Description: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 600
    },
    TotalCopies: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    RemainingCopies: {
        type: Number,
        required: true
    },
    AvgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    BookImage: {
        type: String,
        required: true
    },
    BookImagePublicId: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)

export const Book = mongoose.model("Book", BookSchema)