import { Router } from "express";
import { registerUser, loginUser, RenewAccessToken } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(
    upload.single("avatar"),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/RenewAccessToken").post(RenewAccessToken)


export default router