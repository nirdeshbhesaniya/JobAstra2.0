import express from "express";
import {
  registerUser,
  loginUser,
  fetchUserData,
  applyJob,
  getUserAppliedJobs,
  uploadResume,
  getAllUsers,
  updateUserProfile,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../controllers/userController.js";
import {
  requestPasswordReset,
  verifyResetOTP,
  resetPassword
} from "../controllers/passwordResetController.js";
import upload from "../utils/upload.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.post("/register-user", upload.single("image"), registerUser);
router.post("/login-user", upload.single("image"), loginUser);
router.get("/user-data", userAuthMiddleware, fetchUserData);
router.post("/apply-job", userAuthMiddleware, applyJob);
router.post("/get-user-applications", userAuthMiddleware, getUserAppliedJobs);
router.post(
  "/upload-resume",
  userAuthMiddleware,
  upload.single("resume"),
  uploadResume
);
router.get("/all-users", companyAuthMiddleware, getAllUsers);

// Update profile: supports JSON body and optional image file under key 'image'
router.put(
  "/update-profile",
  userAuthMiddleware,
  upload.single("image"),
  updateUserProfile
);

// Saved jobs routes
router.post("/save-job", userAuthMiddleware, saveJob);
router.post("/unsave-job", userAuthMiddleware, unsaveJob);
router.get("/saved-jobs", userAuthMiddleware, getSavedJobs);

// Password reset routes (no authentication required)
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
