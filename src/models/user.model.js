import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { AccessTokenExpiresDate, RefreshTokenExpiresDate } from "../constants.js";

const userSchema = new Schema(
    {
        userName: {
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
        },
        mobileNumber: {
            type: Number,
            required: true,
            trim: true,
        }
        ,
        address: {
            type: String,
            required: true,
        },
        avatarImage: {
            type: String,
            required: true,
        },
        avatarImagePublicId: {
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
            default: 0,
            max: 7,
        },
        category: {
            type: String,
            enum: ["student", "employee", "general"],
            default: "general"
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    this.password = bcrypt.hashSync(this.password, 15)
})

userSchema.methods.CheckPassword = async function (password) {
    const VerifiedPassword = await bcrypt.compareSync(password, this.password)

    return VerifiedPassword
}


userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            userId: this._id,
            userName: this.userName,
            email: this.email,
        },
        process.env.JWT_AccessToken_SECRET_KEY,
        {
            expiresIn: AccessTokenExpiresDate
        }
    )
}


userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            userId: this._id,
        },
        process.env.JWT_RefreshToken_SECRET_KEY,
        {
            expiresIn: RefreshTokenExpiresDate
        }
    )
}


export const User = mongoose.model("User", userSchema)