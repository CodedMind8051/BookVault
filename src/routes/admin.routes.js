import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { AdminAddBooks, AdminDeleteBooks, updateUserBanStatus, GetBorrowersList } from "../controllers/admin.controllers.js"
import { AuthenticateJwtToken } from "../middlewares/jwtAuth.middleware.js";
import { isAdmin } from "../middlewares/isAdminCheck.middleware.js";


const router = Router()

router.route("/addBook").post(
    AuthenticateJwtToken,
    isAdmin,
    upload.single("Book"),
    AdminAddBooks
)

router.route("/deleteBook/:BookId").delete(
    AuthenticateJwtToken,
    isAdmin,
    AdminDeleteBooks
)

router.route("/updateUserBanStatus/:userId").patch(
    AuthenticateJwtToken,
    isAdmin,
    updateUserBanStatus
)

router.route("/borrowers/:BookId").get(
    AuthenticateJwtToken,
    isAdmin,
    GetBorrowersList
)



export default router