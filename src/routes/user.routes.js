import { Router } from "express";
import { registerUser, loginUser, RenewAccessToken, searchBooks, borrowBooks } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js"
// import { AuthenticateJwtToken } from "../middlewares/jwtAuth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.single("avatar"),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/RenewAccessToken").patch(RenewAccessToken)



export default router