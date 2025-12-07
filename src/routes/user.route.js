import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  signupSchema,
  loginSchema,
} from "../validations/userSchema.validate.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  validate(signupSchema),
  registerUser
);

router.route("/login").post(validate(loginSchema), loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logOutUser);

export default router;
