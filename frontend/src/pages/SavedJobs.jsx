    import React, { useContext } from "react";
import { Bookmark, Search } from "lucide-react";
import { AppContext } from "../context/AppContext";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";

const SavedJobs = () => {
    const { savedJobs, savedJobsLoading } = useContext(AppContext);

    if (savedJobsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-lg">
                        <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Saved Jobs
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {savedJobs.length > 0
                                ? `You have ${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`
                                : "Jobs you've bookmarked for later"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {savedJobs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bookmark className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                            No Saved Jobs Yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Start exploring jobs and bookmark the ones you're interested in.
                            They'll appear here for easy access later.
                        </p>
                        <a
                            href="/all-jobs/all"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Search className="w-5 h-5" />
                            Browse Jobs
                        </a>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {savedJobs.map((job) => (
                        <JobCard key={job._id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
