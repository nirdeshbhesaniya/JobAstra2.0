import Job from "../models/Job.js";
import { Test } from "../models/Test.js";

const getAllJobs = async (req, res) => {
  try {
    console.log('📋 GET /job/all-jobs called - fetching public jobs');
    const jobs = await Job.find({ visible: true })
      .populate("companyId", "-password")
      .populate("requiredTests.testId", "title description duration totalMarks passingMarks");

    console.log(`✅ Found ${jobs.length} public jobs`);
    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      jobData: jobs,
    });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    return res.status(500).json({
      success: false,
      message: "Job fetched failed",
    });
  }
};

// Add test requirements to a job
const addTestRequirement = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { testId, isRequired = true, minimumScore, order = 0 } = req.body;

    // Verify the job belongs to the company
    const job = await Job.findOne({ _id: jobId, companyId: req.companyData._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Verify the test exists and belongs to the company
    const test = await Test.findOne({ _id: testId, companyId: req.companyData._id });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found"
      });
    }

    // Check if test is already added
    const existingTest = job.requiredTests.find(t => t.testId.toString() === testId);
    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: "Test already added to this job"
      });
    }

    // Add test requirement
    job.requiredTests.push({
      testId,
      isRequired,
      minimumScore: minimumScore || test.passingMarks,
      order
    });

    job.requiresTest = true;
    await job.save();

    const updatedJob = await Job.findById(jobId)
      .populate("companyId", "-password")
      .populate("requiredTests.testId", "title description duration totalMarks passingMarks");

    return res.status(200).json({
      success: true,
      message: "Test requirement added successfully",
      job: updatedJob
    });
  } catch (error) {
    console.error('Error adding test requirement:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to add test requirement"
    });
  }
};

// Remove test requirement from a job
const removeTestRequirement = async (req, res) => {
  try {
    const { jobId, testId } = req.params;

    const job = await Job.findOne({ _id: jobId, companyId: req.companyData._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    job.requiredTests = job.requiredTests.filter(t => t.testId.toString() !== testId);

    // If no tests remain, set requiresTest to false
    if (job.requiredTests.length === 0) {
      job.requiresTest = false;
    }

    await job.save();

    const updatedJob = await Job.findById(jobId)
      .populate("companyId", "-password")
      .populate("requiredTests.testId", "title description duration totalMarks passingMarks");

    return res.status(200).json({
      success: true,
      message: "Test requirement removed successfully",
      job: updatedJob
    });
  } catch (error) {
    console.error('Error removing test requirement:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove test requirement"
    });
  }
};

// Get job test requirements for candidates
const getJobTestRequirements = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate("requiredTests.testId", "title description duration totalMarks passingMarks");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    return res.status(200).json({
      success: true,
      requiresTest: job.requiresTest,
      requiredTests: job.requiredTests,
      testInstructions: job.testInstructions
    });
  } catch (error) {
    console.error('Error getting job test requirements:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to get job test requirements"
    });
  }
};

// Get company's jobs for test management
const getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const jobs = await Job.find({ companyId })
      .populate("requiredTests.testId", "title description duration totalMarks passingMarks")
      .select('_id title location category level salary description requiresTest requiredTests');

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobs: jobs,
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs"
    });
  }
};

export {
  getAllJobs,
  getCompanyJobs,
  addTestRequirement,
  removeTestRequirement,
  getJobTestRequirements
};

export default getAllJobs;
