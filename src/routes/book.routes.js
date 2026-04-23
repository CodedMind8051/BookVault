import { Router } from "express";
import { searchBooks, borrowBooks } from "../controllers/book.controllers.js";
import { AuthenticateJwtToken } from "../middlewares/jwtAuth.middleware.js";

const router = Router()


router.route("/searchBooks").get(searchBooks)
router.route("/borrow-books/:bookId").post(AuthenticateJwtToken, borrowBooks)



export default router