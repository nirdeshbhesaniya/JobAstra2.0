import axios from "axios";
import formatSalaryLPA from "../utils/formatSalary";
import { Clock, MapPin, User, Sparkles, Bookmark } from "lucide-react";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { assets } from "../assets/assets";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

const ApplyJob = () => {
  const [jobData, setJobData] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [noSimilarJobs, setNoSimilarJobs] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [applyForm, setApplyForm] = useState({
    coverLetter: "",
    expectedSalary: "",
    noticePeriod: "",
    yearsExperience: "",
    currentLocation: "",
    portfolioUrl: "",
  });
  const [confirming, setConfirming] = useState(false);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();
  const {
    jobs,
    jobLoading,
    backendUrl,
    userToken,
    userData,
    userApplication = [],
    savedJobs,
    saveJob,
    unsaveJob,
  } = useContext(AppContext);

  const isSaved = savedJobs.some((savedJob) => savedJob._id === jobData?._id);

  const handleBookmark = async () => {
    if (!userData) {
      navigate("/candidate-login");
      return toast.error("Please login to save jobs");
    }
    if (isSaved) {
      await unsaveJob(jobData._id);
    } else {
      await saveJob(jobData._id);
    }
  };

  const applyJob = async () => {
    try {
      if (!userData) {
        navigate("/candidate-login");
        return toast.error("Please login to apply");
      }
      if (!userData?.resume) {
        navigate("/applications");
        return toast.error("Please upload your resume");
      }

      // Check if tests are required and completed
      if (jobData?.requiresTest && !allTestsPassed) {
        return toast.error("Please complete all required tests before applying");
      }

      // Open modal to collect additional information before submitting
      setShowApplyModal(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleTestComplete = (testsPassed) => {
    setAllTestsPassed(testsPassed);
  };

  const submitApplication = async () => {
    if (!jobData?._id) return;
    try {
      setConfirming(true);
      const payload = {
        jobId: jobData._id,
        additionalInfo: {
          coverLetter: applyForm.coverLetter?.trim() || undefined,
          expectedSalary: applyForm.expectedSalary?.trim() || undefined,
          noticePeriod: applyForm.noticePeriod?.trim() || undefined,
          yearsExperience: applyForm.yearsExperience !== "" ? Number(applyForm.yearsExperience) : undefined,
          currentLocation: applyForm.currentLocation?.trim() || undefined,
          portfolioUrl: applyForm.portfolioUrl?.trim() || undefined,
        },
      };
      const { data } = await axios.post(
        `${backendUrl}/user/apply-job`,
        payload,
        { headers: { token: userToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setAlreadyApplied(true);
        setShowApplyModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to apply");
    } finally {
      setConfirming(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!jobData?._id || !userData) return;

    try {
      setGeneratingCoverLetter(true);
      const payload = {
        jobId: jobData._id,
        candidateName: userData.name,
        candidateProfile: `Experienced professional with ${applyForm.yearsExperience || '0'} years of experience${applyForm.currentLocation ? ` based in ${applyForm.currentLocation}` : ''}.`
      };

      const { data } = await axios.post(
        `${backendUrl}/ai/generate-cover-letter`,
        payload,
        { headers: { token: userToken } }
      );

      if (data.success) {
        setApplyForm({ ...applyForm, coverLetter: data.coverLetter });
        toast.success("Cover letter generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate cover letter");
      }
    } catch (error) {
      console.error("Cover letter generation error:", error);
      toast.error(error?.response?.data?.message || "Failed to generate cover letter");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  useEffect(() => {
    if (jobs && id) {
      const data = jobs.find((job) => job._id === id);
      setJobData(data);
    }
  }, [id, jobs]);

  useEffect(() => {
    if (userApplication?.length > 0 && jobData) {
      const hasApplied = userApplication.some(
        (item) => item?.jobId?._id === jobData?._id
      );
      setAlreadyApplied(hasApplied);
    }
  }, [jobData, userApplication]);

  useEffect(() => {
    if (jobs && jobData) {
      const similarJobs = jobs.filter(
        (job) =>
          job._id !== jobData?._id &&
          job.companyId?.name === jobData?.companyId?.name
      );
      setNoSimilarJobs(similarJobs.length === 0);
    }
  }, [jobData, jobs]);

  if (jobLoading || !jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {/* Main Container with proper padding and max-width */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Hero Section - Job Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 sm:p-8 lg:p-10 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

              {/* Left Section - Job Info */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1">
                {/* Company Logo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                  <img
                    src={jobData?.companyId?.image || assets.company_icon}
                    alt={jobData?.companyId?.name || "Company logo"}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                    onError={(e) => {
                      e.target.src = assets.company_icon;
                    }}
                  />
                </div>

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 leading-tight">
                    {jobData?.title}
                  </h1>

                  {/* Job Meta Info - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm sm:text-base text-gray-600">
                    <div className="flex items-center gap-2">
                      <img src={assets.suitcase_icon} alt="Company" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="truncate">{jobData?.companyId?.name || "Unknown Company"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={18} className="sm:w-5 sm:h-5" />
                      <span>{jobData?.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="sm:w-5 sm:h-5" />
                      <span className="truncate">{jobData?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={assets.money_icon} alt="Salary" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="truncate">
                        CTC: {jobData?.salary ? formatSalaryLPA(jobData.salary) : "Not disclosed"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Apply Button and Posted Time */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 lg:gap-4">
                <div className="flex gap-2 w-full sm:w-auto lg:w-full">
                  <button
                    className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 shadow-sm ${alreadyApplied
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer text-white hover:shadow-md transform hover:scale-105"
                      }`}
                    onClick={applyJob}
                    disabled={alreadyApplied}
                  >
                    {alreadyApplied ? "Already Applied" : "Apply Now"}
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`px-4 py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 shadow-sm ${isSaved
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    title={isSaved ? "Remove from saved jobs" : "Save job"}
                  >
                    <Bookmark
                      className="w-5 h-5"
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  <Clock size={16} />
                  <span>Posted {moment(jobData?.date).fromNow()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Requirements Section */}
          {/* TODO: Implement JobTestRequirements component */}
          {/* {jobData && (
            <JobTestRequirements
              jobId={jobData._id}
              onTestComplete={handleTestComplete}
              userToken={userToken}
            />
          )} */}

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

            {/* Job Description - Left Column */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-4">
                  Job Description
                </h2>
                <div
                  className="job-description text-gray-700 leading-relaxed prose prose-sm sm:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: jobData?.description }}
                />
              </div>
            </div>

            {/* Similar Jobs - Right Column */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-3">
                  Other Jobs at{" "}
                  <span className="text-blue-600">
                    {jobData?.companyId?.name || "Company"}
                  </span>
                </h3>

                <div className="space-y-4">
                  {noSimilarJobs ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        No other jobs available at the moment.
                      </p>
                    </div>
                  ) : (
                    jobs
                      .filter(
                        (job) =>
                          job._id !== jobData?._id &&
                          job.companyId?.name === jobData?.companyId?.name
                      )
                      .filter((job) => {
                        const appliedJobsId = new Set(
                          userApplication?.map((app) => app.jobId?._id)
                        );
                        return !appliedJobsId.has(job._id);
                      })
                      .reverse()
                      .slice(0, 3)
                      .map((job) => (
                        <div key={job._id} className="transform transition-transform hover:scale-105">
                          <JobCard job={job} />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <h3 className="text-lg font-semibold">Confirm Your Application</h3>
              <p className="text-xs opacity-90">Add a short note and details to help recruiters</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Cover Letter (optional)</label>
                  <button
                    type="button"
                    onClick={generateCoverLetter}
                    disabled={generatingCoverLetter || !jobData}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generatingCoverLetter ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
                {applyForm.coverLetter && applyForm.coverLetter.includes('#') ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <ReactMarkdown
                        className="prose prose-sm max-w-none"
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>
                        }}
                      >
                        {applyForm.coverLetter}
                      </ReactMarkdown>
                    </div>
                    <button
                      type="button"
                      onClick={() => setApplyForm({ ...applyForm, coverLetter: "" })}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Edit manually
                    </button>
                  </div>
                ) : (
                  <textarea
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm"
                    rows={4}
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    placeholder="Briefly explain why you're a great fit... or use AI to generate one!"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Salary (CTC)</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
                    placeholder="e.g., 12 LPA"
                    value={applyForm.expectedSalary}
                    onChange={(e) => setApplyForm({ ...applyForm, expectedSalary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notice Period</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
                    placeholder="e.g., Immediate / 30 days"
                    value={applyForm.noticePeriod}
                    onChange={(e) => setApplyForm({ ...applyForm, noticePeriod: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
                    placeholder="e.g., 3"
                    value={applyForm.yearsExperience}
                    onChange={(e) => setApplyForm({ ...applyForm, yearsExperience: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Location</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
                    placeholder="City, Country"
                    value={applyForm.currentLocation}
                    onChange={(e) => setApplyForm({ ...applyForm, currentLocation: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Portfolio URL (optional)</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"
                    placeholder="https://..."
                    value={applyForm.portfolioUrl}
                    onChange={(e) => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg text-sm bg-gray-200 text-gray-800"
                onClick={() => setShowApplyModal(false)}
                disabled={confirming}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                onClick={submitApplication}
                disabled={confirming}
              >
                {confirming ? "Submitting..." : "Confirm & Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyJob;
