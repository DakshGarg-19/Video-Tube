import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  updateUserSchema
} from "../validations/userSchema.validate.js";

const router = Router();

router.route("/register").post(
  validate(signupSchema),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(validate(loginSchema), loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").patch(verifyJWT, validate(changePasswordSchema), changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-user").patch(verifyJWT, validate(updateUserSchema), updateAccountDetails);
router.route("/update-user-avatar").patch(
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);
router.route("/update-user-cover-image").patch(
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

export default router;
