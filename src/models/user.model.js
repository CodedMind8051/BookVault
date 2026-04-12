import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        mobileNumber: {
            type: Number,
            required: true,
            trim: true,
            unique: true
        }
        ,
        address: {
            type: String,
            required: true,
        },
        avtarImage: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
        bannedStatus: {
            type: Boolean,
            default: false
        },
        numberOfBooksBorrowed: {
            type: Number,
            max:7,
        },
        category:{
            type:String,
            enum:["student","employee","general"],
            default:"general"
        }
    },
    {
        timestamps: true
    }
)



export const User = mongoose.model("User",userSchema)