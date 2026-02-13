import express from "express";
import {
  getAllJobs,
  addTestRequirement,
  removeTestRequirement,
  getJobTestRequirements,
  getCompanyJobs
} from "../controllers/jobController.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.get("/all-jobs", getAllJobs);
router.get("/company-jobs", companyAuthMiddleware, getCompanyJobs);
router.get("/:jobId/test-requirements", getJobTestRequirements);

// Company-only routes for managing test requirements
router.post("/:jobId/test-requirements", companyAuthMiddleware, addTestRequirement);
router.delete("/:jobId/test-requirements/:testId", companyAuthMiddleware, removeTestRequirement);

export default router;
