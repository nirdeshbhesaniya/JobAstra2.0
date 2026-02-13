import express from "express";
import {
  fetchCompanyData,
  loginCompany,
  postJob,
  registerCompany,
  getCompanyPostedAllJobs,
  getAllJobs,
  changeJobVisibility,
  getCompanyJobApplicants,
  changeStatus,
  deleteApplication,
} from "../controllers/companyController.js";
import {
  requestPasswordReset,
  verifyResetOTP,
  resetPassword
} from "../controllers/companyPasswordResetController.js";
import upload from "../utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.post("/register-company", upload.single("image"), registerCompany);
router.post("/login-company", loginCompany);
router.get("/company-data", companyAuthMiddleware, fetchCompanyData);
router.post("/post-job", companyAuthMiddleware, postJob);
router.get("/jobs", companyAuthMiddleware, getAllJobs);
router.get(
  "/company/posted-jobs",
  companyAuthMiddleware,
  getCompanyPostedAllJobs
);
router.post("/change-visiblity", companyAuthMiddleware, changeJobVisibility);
router.post(
  "/view-applications",
  companyAuthMiddleware,
  getCompanyJobApplicants
);
router.post("/change-status", companyAuthMiddleware, changeStatus);
router.post("/delete-application", companyAuthMiddleware, deleteApplication);

// Password reset routes (no authentication required)
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

export default router;
