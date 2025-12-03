import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { signupSchema } from "../validations/userSchema.validate.js";
import { validate } from "../middlewares/validate.middleware.js";

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

// router.route("/login").post(registerUser);

export default router;
