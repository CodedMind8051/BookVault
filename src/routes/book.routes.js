import { Router } from "express";
import { searchBooks, borrowBooks, ReturnBook } from "../controllers/book.controllers.js";
import { AuthenticateJwtToken } from "../middlewares/jwtAuth.middleware.js";

const router = Router()


router.route("/searchBooks").get(searchBooks)
router.route("/borrow-book/:bookId").post(AuthenticateJwtToken, borrowBooks)
router.route("/return-book/:bookId").post(AuthenticateJwtToken, ReturnBook)



export default router