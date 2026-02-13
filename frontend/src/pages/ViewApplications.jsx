import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { LoaderCircle, Trash2, FileText, Mail, MapPin as MapPinIcon, Calendar as CalendarIcon, X } from "lucide-react";

const ViewApplications = () => {
  const [viewApplicationsPageData, setViewApplicationsPageData] =
    useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { backendUrl, companyToken } = useContext(AppContext);

  const fetchViewApplicationsPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/view-applications`,
        {},
        {
          headers: { token: companyToken },
        }
      );
      if (data?.success) {
        setViewApplicationsPageData(data.viewApplicationData || []);
      } else {
        toast.error(data?.message || "Failed to load applications.");
      }
    } catch (error) {
      console.error(error?.response?.data || "Error fetching applications");
      toast.error(
        error?.response?.data?.message || "Failed to fetch applications"
      );
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, companyToken]);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingStatus(id);
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/change-status`,
        { id, status },
        {
          headers: { token: companyToken },
        }
      );

      if (data?.success) {
        toast.success(data?.message || "Status updated successfully.");
        await fetchViewApplicationsPageData(); // Reload applications to reflect the update
      } else {
        toast.error(data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Error updating status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    document.title = "JobAstra - Job Portal | Dashboard";
  }, []);

  useEffect(() => {
    fetchViewApplicationsPageData();
  }, [fetchViewApplicationsPageData]);

  const handleDeleteApplication = async (id) => {
    if (!id) return;
    const proceed = window.confirm("Delete this rejected application? The candidate will be able to apply again.");
    if (!proceed) return;
    try {
      setDeletingId(id);
      const { data } = await axios.post(
        `${backendUrl}/company/delete-application`,
        { id },
        { headers: { token: companyToken } }
      );
      if (data?.success) {
        toast.success(data?.message || "Application deleted");
        setSelectedApp(null);
        await fetchViewApplicationsPageData();
      } else {
        toast.error(data?.message || "Failed to delete application");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <Loader />
        </div>
      ) : !viewApplicationsPageData || viewApplicationsPageData.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <img className="w-8 h-8 opacity-50" src={assets.resume_not_selected} alt="No applications" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-sm">Applications for your jobs will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Applied Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume/Photo
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewApplicationsPageData.slice().reverse().map((job, index) => (
                  <tr
                    key={job._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={job?.userId?.image || assets.default_profile}
                            alt={job?.userId?.name || "Applicant"}
                            className="h-12 w-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                            onError={(e) =>
                              (e.target.src = assets.default_profile)
                            }
                          />
                          {job?.userId?.image && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {job?.userId?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {job?.userId?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-[180px] truncate font-medium">
                      {job?.jobId?.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <img className="w-3 h-3" src={assets.location_icon} alt="" />
                        {job?.jobId?.location}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {job?.date ? moment(job.date).format("MMM DD, YYYY") : "N/A"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {job?.userId?.resume ? (
                        <div className="flex flex-col items-center gap-2">
                          <a
                            href={job.userId.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-200"
                            aria-label="View resume"
                          >
                            <img
                              src={assets.resume_download_icon}
                              alt=""
                              className="h-3 w-3"
                            />
                            View Resume
                          </a>
                          <button
                            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                            onClick={() => setSelectedApp(job)}
                          >
                            Details
                          </button>
                          {job?.userId?.image && (
                            <button
                              onClick={() => {
                                // Create modal or lightbox for photo viewing
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50';
                                modal.innerHTML = `
                                  <div class="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
                                    <button class="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-all" onclick="this.closest('.fixed').remove()">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                    <img src="${job.userId.image}" alt="${job.userId.name}" class="w-full h-auto" />
                                    <div class="p-4 bg-white">
                                      <h3 class="font-medium text-gray-900">${job.userId.name}</h3>
                                      <p class="text-sm text-gray-500">${job.userId.email}</p>
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(modal);
                                modal.addEventListener('click', (e) => {
                                  if (e.target === modal) modal.remove();
                                });
                              }}
                              className="inline-flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-600 px-2 py-1 rounded transition-all duration-200 border border-green-200"
                            >
                              <img className="w-3 h-3" src={assets.person_icon} alt="" />
                              Photo
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">No resume</span>
                          {job?.userId?.image && (
                            <button
                              onClick={() => {
                                // Same photo viewing functionality
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50';
                                modal.innerHTML = `
                                  <div class="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
                                    <button class="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-all" onclick="this.closest('.fixed').remove()">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                    <img src="${job.userId.image}" alt="${job.userId.name}" class="w-full h-auto" />
                                    <div class="p-4 bg-white">
                                      <h3 class="font-medium text-gray-900">${job.userId.name}</h3>
                                      <p class="text-sm text-gray-500">${job.userId.email}</p>
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(modal);
                                modal.addEventListener('click', (e) => {
                                  if (e.target === modal) modal.remove();
                                });
                              }}
                              className="inline-flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded transition-all duration-200 border border-blue-200"
                            >
                              <img className="w-3 h-3" src={assets.person_icon} alt="" />
                              Photo
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {updatingStatus === job._id ? (
                        <div className="flex justify-center">
                          <LoaderCircle className="animate-spin h-5 w-5 text-gray-500" />
                        </div>
                      ) : job.status === "Pending" ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(job._id, "Accepted")
                            }
                            className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded cursor-pointer"
                            disabled={updatingStatus === job._id}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(job._id, "Rejected")
                            }
                            className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded cursor-pointer"
                            disabled={updatingStatus === job._id}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${job.status === "Accepted"
                            ? "text-green-800"
                            : "text-red-800"
                            }`}
                        >
                          {job.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/50 via-purple-900/20 to-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <img
                      src={selectedApp?.userId?.image || assets.default_profile}
                      onError={(e) => (e.target.src = assets.default_profile)}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-white/30 object-cover shadow-xl"
                      alt={selectedApp?.userId?.name}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      {selectedApp?.userId?.name}
                    </h3>
                    <p className="text-base sm:text-lg text-blue-100 font-medium mb-2 sm:mb-3">
                      {selectedApp?.jobId?.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/90">
                      <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-1">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{selectedApp?.userId?.email}</span>
                        <span className="xs:hidden">Email</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-1">
                        <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        {selectedApp?.jobId?.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-1">
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        {selectedApp?.date ? moment(selectedApp.date).fromNow() : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm ${selectedApp?.status === 'Accepted'
                      ? 'bg-emerald-500/90 text-white border border-emerald-400/50'
                      : selectedApp?.status === 'Rejected'
                        ? 'bg-red-500/90 text-white border border-red-400/50'
                        : 'bg-amber-500/90 text-white border border-amber-400/50'
                      }`}>
                      {selectedApp?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 lg:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 mb-6 sm:mb-8">
                {selectedApp?.userId?.resume && (
                  <a
                    href={selectedApp.userId.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative inline-flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <FileText className="relative w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="relative">View Resume</span>
                  </a>
                )}

                {selectedApp?.status === 'Rejected' && (
                  <button
                    className="group relative inline-flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    onClick={() => handleDeleteApplication(selectedApp._id)}
                    disabled={deletingId === selectedApp._id}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    {deletingId === selectedApp._id ? (
                      <>
                        <LoaderCircle className="relative w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="relative">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="relative w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="relative">Delete Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Information Cards */}
              <div className="space-y-6 sm:space-y-8">
                {/* Personal Info */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-slate-200/50">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Professional Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Expected Salary</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {selectedApp?.additionalInfo?.expectedSalary || "—"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Notice Period</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {selectedApp?.additionalInfo?.noticePeriod || "—"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Years of Experience</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {selectedApp?.additionalInfo?.yearsExperience ?? "—"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Current Location</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        {selectedApp?.additionalInfo?.currentLocation || "—"}
                      </div>
                    </div>
                  </div>

                  {selectedApp?.additionalInfo?.portfolioUrl && (
                    <div className="mt-4 sm:mt-6 space-y-1">
                      <div className="text-xs sm:text-sm text-gray-500 font-medium">Portfolio</div>
                      <a
                        className="inline-flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium bg-white px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200 break-all"
                        href={selectedApp.additionalInfo.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="truncate max-w-xs sm:max-w-md">{selectedApp.additionalInfo.portfolioUrl}</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                {selectedApp?.additionalInfo?.coverLetter && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-amber-200/50">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Cover Letter
                    </h4>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50">
                      <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedApp.additionalInfo.coverLetter}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="relative bg-gradient-to-r from-gray-50 to-slate-100 border-t border-gray-200/50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Application Details Last Updated
                </div>
                <button
                  className="group relative inline-flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  onClick={() => setSelectedApp(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <X className="relative w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="relative">Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ViewApplications;
