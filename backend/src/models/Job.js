import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  level: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: Number, required: true },
  category: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  date: { type: Number, required: true },
  visible: { type: Boolean, default: true },
  // Test integration fields
  requiresTest: { type: Boolean, default: false },
  requiredTests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
    isRequired: { type: Boolean, default: true },
    minimumScore: { type: Number }, // Minimum score required to pass
    order: { type: Number, default: 0 } // Order in which tests should be taken
  }],
  testInstructions: { type: String }, // Special instructions for test-taking
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
