import { Router } from "express";
import { registerUser, loginUser, RenewAccessToken, fetchBorrowHistory, WriteReview, fetchReviews, AddRating, fetchBooksForHome } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js"
import { AuthenticateJwtToken } from "../middlewares/jwtAuth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.single("avatar"),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/RenewAccessToken").patch(RenewAccessToken)
router.route("/borrow-history").get(AuthenticateJwtToken, fetchBorrowHistory)

router.route("/add-review/:bookId").post(AuthenticateJwtToken, WriteReview)
router.route("/fetch-reviews/:bookId").get(fetchReviews)
router.route("/add-rating/:bookId").post(AuthenticateJwtToken, AddRating)
router.route("/fetch-books").get(fetchBooksForHome)




export default router