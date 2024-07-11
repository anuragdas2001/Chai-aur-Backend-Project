import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  registerUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { updateUserAvatar } from "../controllers/user.controller.js";
import { verify } from "jsonwebtoken";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(VerifyJWT, logoutUser);

router.route("/refreshtoken").post(refreshAccessToken);

router
  .route("/UpdateAvatar")
  .patch(VerifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/changepassword").post(VerifyJWT, changeCurrentPassword);

router.route("/currentUser").get(VerifyJWT, getCurrentUser);

router.route("/update-account").patch(VerifyJWT, updateAccountDetails);

// router.route("/UpdateCoverImage").patch(VerifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/Channel/:username").get(VerifyJWT, getUserChannelProfile);

router.route("history").get(VerifyJWT, getWatchHistory);



export default router;
