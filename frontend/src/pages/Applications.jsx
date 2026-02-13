import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { assets } from "../assets/assets";
import moment from "moment";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Applications = () => {
  const {
    userApplication,
    applicationsLoading,
    backendUrl,
    userToken,
    userData,
    fetchUserData,
    fetchUserApplication,
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeSave = async () => {
    if (!resumeFile) {
      toast.error("Please select a resume file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await axios.post(
        `${backendUrl}/user/upload-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: userToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(error?.response?.data?.message || "Resume upload failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplication();
  }, []);

  return (
    <>
      <Navbar />
      <section className="w-full py-6 sm:py-8">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
          {/* Resume Section */}
          <div className="mb-8 sm:mb-10 w-full">
            <h1 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Your Resume</h1>
            {isEdit ? (
              <div className="space-y-4">
                {/* File Upload Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 transition-all duration-200 min-w-[200px]">
                    <input
                      type="file"
                      hidden
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                          if (allowedTypes.includes(file.type)) {
                            setResumeFile(file);
                          } else {
                            alert('Please select a JPG, JPEG, or PNG file only.');
                            e.target.value = '';
                          }
                        } else {
                          setResumeFile(null);
                        }
                      }}
                    />
                    <img
                      className="w-5 h-5"
                      src={assets.profile_upload_icon}
                      alt="Upload icon"
                    />
                    <span className="text-blue-600 font-medium text-sm">
                      {resumeFile ? 'Change Resume' : 'Upload Resume'}
                    </span>
                  </label>

                  {/* File Preview */}
                  {resumeFile && (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <img className="w-4 h-4" src={assets.resume_selected} alt="File selected" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Supported Formats Info */}
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-1">Supported formats:</p>
                  <p>JPG, JPEG, PNG • Maximum size: 5MB</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={!resumeFile || loading}
                    onClick={handleResumeSave}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${!resumeFile || loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg cursor-pointer"
                      }`}
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin w-4 h-4" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <img className="w-4 h-4" src={assets.resume_selected} alt="" />
                        Save Resume
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsEdit(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {userData?.resume ? (
                      <>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img className="w-6 h-6" src={assets.resume_selected} alt="Resume uploaded" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">Resume Uploaded</p>
                          <p className="text-xs text-gray-500">Click to view your resume</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img className="w-6 h-6 opacity-50" src={assets.resume_not_selected} alt="No resume" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">No Resume</p>
                          <p className="text-xs text-gray-500">Upload your resume to apply for jobs</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {userData?.resume && (
                      <a
                        href={userData.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border border-blue-200"
                      >
                        <img className="w-4 h-4" src={assets.resume_download_icon} alt="" />
                        View Resume
                      </a>
                    )}
                    <button
                      onClick={() => setIsEdit(true)}
                      className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border border-gray-200"
                    >
                      <img className="w-4 h-4" src={assets.edit_icon} alt="" />
                      {userData?.resume ? "Update" : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Applications Table */}
          <div className="w-full">
            {applicationsLoading ? (
              <div className="flex justify-center items-center mt-16 sm:mt-20">
                <Loader />
              </div>
            ) : !userApplication || userApplication.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-gray-500">
                <div className="max-w-sm mx-auto px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" src={assets.suitcase_icon} alt="No applications" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-sm">Your job applications will appear here.</p>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Jobs Applied</h1>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm w-full">
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200 w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Job Title
                          </th>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Location
                          </th>
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Applied Date
                          </th>
                          <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...userApplication].reverse().map((job) => (
                          <tr key={job._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-3 sm:px-4 py-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                  src={
                                    job?.companyId?.image || assets.default_profile
                                  }
                                  alt={job?.companyId?.name || "Company logo"}
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0 border border-gray-200"
                                  onError={(e) => {
                                    e.target.src = assets.default_profile;
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {job?.companyId?.name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-500 block sm:hidden truncate">
                                    {job?.jobId?.location}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-4">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {job?.jobId?.title}
                                </p>
                                <p className="text-xs text-gray-500 block md:hidden truncate">
                                  Applied {moment(job.date).format("MMM DD, YYYY")}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                              <div className="flex items-center gap-1">
                                <img className="w-3 h-3" src={assets.location_icon} alt="" />
                                {job?.jobId?.location}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                              {moment(job.date).format("MMM DD, YYYY")}
                            </td>
                            <td className="px-3 sm:px-4 py-4 text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${job.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : job.status === "Rejected"
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : "bg-green-100 text-green-800 border border-green-200"
                                  }`}
                              >
                                {job.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Applications;
