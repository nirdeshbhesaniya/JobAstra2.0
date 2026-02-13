import React, { useContext } from "react";
import moment from "moment";
import formatSalaryLPA from "../utils/formatSalary";
import { assets } from "../assets/assets";
import { MapPin, Clock, User, ArrowRight, Building2, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { savedJobs, saveJob, unsaveJob } = useContext(AppContext);

  const isSaved = savedJobs.some((savedJob) => savedJob._id === job._id);

  const handleBookmark = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking bookmark
    if (isSaved) {
      await unsaveJob(job._id);
    } else {
      await saveJob(job._id);
    }
  };

  return (
    <div
      key={job._id}
      onClick={() => {
        navigate(`/apply-job/${job._id}`);
        scrollTo(0, 0);
      }}
      className="group bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer hover:border-blue-300 transform hover:-translate-y-2 relative overflow-hidden min-h-[280px] sm:min-h-[320px] lg:min-h-[300px] xl:min-h-[280px] flex flex-col"
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center group-hover:border-blue-300 transition-all duration-300 shadow-sm flex-shrink-0">
            <img
              className="w-6 h-6 sm:w-10 sm:h-10 object-contain rounded-lg"
              src={job.companyId?.image || assets.company_icon}
              alt={`${job.companyId?.name || "Company"} Logo`}
              onError={(e) => {
                e.target.src = assets.company_icon;
              }}
            />
          </div>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isSaved
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              }`}
            title={isSaved ? "Remove from saved jobs" : "Save job"}
          >
            <Bookmark
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Job Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight flex-shrink-0">
          {job.title}
        </h3>

        {/* Company Info */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-shrink-0">
          <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm sm:text-base text-gray-600 font-medium truncate">
            {job.companyId?.name || "Unknown Company"}
          </span>
        </div>

        {/* Job Details Grid */}
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-1">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{job.location}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{job.level}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{moment(job.date).fromNow()}</span>
          </div>
        </div>

        {/* Salary Section */}
        <div className="mt-auto flex-shrink-0">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-2 sm:p-3 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
            <div className="flex items-center gap-2">
              <img src={assets.money_icon} alt="Salary" className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-green-700 font-semibold text-xs sm:text-sm truncate">
                {job.salary ? formatSalaryLPA(job.salary) : "Salary not disclosed"}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Effect Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            View Details
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
