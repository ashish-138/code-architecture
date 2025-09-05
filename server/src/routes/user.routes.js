import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyToken, authorizeRole } from "../middlewares/auth.middleware.js"


const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]), registerUser
)

// router.route("/route").get(verifyToken, registerUser)
// router.route("/route").post(verifyToken, authorizeRole("admin" , "manager"), registerUser)


export default router