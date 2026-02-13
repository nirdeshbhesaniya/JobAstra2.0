import mongoose from "mongoose";

const additionalInfoSchema = new mongoose.Schema(
  {
    coverLetter: { type: String, trim: true, maxlength: 4000 },
    expectedSalary: { type: String, trim: true, maxlength: 100 },
    noticePeriod: { type: String, trim: true, maxlength: 100 },
    yearsExperience: { type: Number, min: 0, max: 60 },
    currentLocation: { type: String, trim: true, maxlength: 200 },
    portfolioUrl: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const jobApplicationSchema = mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  companyId: { type: mongoose.Types.ObjectId, required: true, ref: "Company" },
  jobId: { type: mongoose.Types.ObjectId, required: true, ref: "Job" },
  status: { type: String, default: "Pending" },
  date: { type: Number, required: true },
  additionalInfo: { type: additionalInfoSchema, default: {} },
  // Test completion tracking
  testStatus: {
    type: String,
    enum: ['not-required', 'pending', 'in-progress', 'completed', 'failed'],
    default: 'not-required'
  },
  testAttempts: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestAttempt",
    },
    score: { type: Number },
    isPassed: { type: Boolean },
    completedAt: { type: Date },
    required: { type: Boolean, default: true }
  }],
  testCompletedAt: { type: Date },
  testResult: {
    allTestsPassed: { type: Boolean },
    totalScore: { type: Number },
    averageScore: { type: Number }
  }
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
