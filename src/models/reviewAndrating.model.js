import mongoose, { Schema } from "mongoose";


const ReviewAndRatingSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    BookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    review: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length < 5
            },
            message: "You can only give 5 reviews to a single book"
        }

    }

},
    {
        timestamps: true
    })


export const ReviewRating = mongoose.model("ReviewRating", ReviewAndRatingSchema)    