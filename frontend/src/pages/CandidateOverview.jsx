import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import {
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    User,
    FileText,
    Search,
    ArrowRight,
    Calendar,
    MapPin,
    Building,
    LoaderCircle
} from "lucide-react";
import moment from "moment";
import Loader from "../components/Loader";
import UpcomingInterviews from "../components/UpcomingInterviewsSimple";

const CandidateOverview = () => {
    const { userData, userApplication, userDataLoading, applicationsLoading } = useContext(AppContext);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    // Calculate application statistics
    useEffect(() => {
        if (userApplication && userApplication.length > 0) {
            const total = userApplication.length;
            const pending = userApplication.filter(app => app.status === "Pending").length;
            const approved = userApplication.filter(app => app.status === "Accepted" || app.status === "Approved").length;
            const rejected = userApplication.filter(app => app.status === "Rejected").length;

            setStats({ total, pending, approved, rejected });
        }
    }, [userApplication]);

    const quickActions = [
        {
            title: "Browse Jobs",
            description: "Find your next opportunity",
            icon: Search,
            color: "blue",
            path: "/all-jobs/all"
        },
        {
            title: "Update Profile",
            description: "Keep your information current",
            icon: User,
            color: "green",
            path: "/candidate-dashboard/profile"
        },
        {
            title: "My Applications",
            description: "Track your job applications",
            icon: FileText,
            color: "purple",
            path: "/applications"
        }
    ];

    const recentApplications = userApplication?.slice(0, 3) || [];

    return (
        <div className="w-full max-w-none space-y-4 sm:space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white w-full">
                <div className="flex items-center justify-between">
                    <div>
                        {userDataLoading ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <LoaderCircle className="w-5 h-5 animate-spin" />
                                    <div className="h-8 bg-blue-400/30 rounded-lg animate-pulse w-48"></div>
                                </div>
                                <div className="h-4 bg-blue-400/20 rounded animate-pulse w-64"></div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                                    Welcome back, {userData?.name || "Candidate"}! 👋
                                </h1>
                                <p className="text-blue-100 text-xs sm:text-sm">
                                    Ready to take the next step in your career journey?
                                </p>
                            </>
                        )}
                    </div>
                    <div className="hidden md:block">
                        {userDataLoading ? (
                            <div className="w-16 h-16 bg-blue-400/30 rounded-full animate-pulse"></div>
                        ) : (
                            <img
                                src={userData?.image || assets.default_profile}
                                alt="Profile"
                                className="w-16 h-16 rounded-full border-4 border-blue-400 object-cover"
                                onError={(e) => (e.target.src = assets.default_profile)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                {applicationsLoading ? (
                    // Loading skeleton for stats cards
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm w-full">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                    <div className="h-8 bg-gray-200 rounded animate-pulse w-12"></div>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm w-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600">Total Applications</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm w-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm w-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600">Approved</p>
                                    <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm w-full">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                                    <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm w-full">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.path}
                            className={`group p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-md ${action.color === 'blue'
                                ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                                : action.color === 'green'
                                    ? 'border-green-200 hover:border-green-400 hover:bg-green-50'
                                    : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color === 'blue'
                                    ? 'bg-blue-100'
                                    : action.color === 'green'
                                        ? 'bg-green-100'
                                        : 'bg-purple-100'
                                    }`}>
                                    <action.icon className={`w-5 h-5 ${action.color === 'blue'
                                        ? 'text-blue-600'
                                        : action.color === 'green'
                                            ? 'text-green-600'
                                            : 'text-purple-600'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                                        {action.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">{action.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Applications</h2>
                    <Link
                        to="/applications"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 w-fit"
                    >
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {applicationsLoading ? (
                    // Loading skeleton for recent applications
                    <div className="space-y-3 sm:space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                                        <div className="space-y-1">
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                                            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end sm:justify-center">
                                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentApplications.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {recentApplications.map((application, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <img
                                        src={application.companyId?.image || assets.default_profile}
                                        alt={application.companyId?.name}
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                        onError={(e) => (e.target.src = assets.default_profile)}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                            {application.jobId?.title}
                                        </h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Building className="w-3 h-3" />
                                                <span className="truncate">{application.companyId?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 sm:gap-4">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{application.jobId?.location}</span>
                                                </div>
                                                <div className="hidden sm:flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {moment(application.date).format("MMM DD, YYYY")}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Mobile date */}
                                        <div className="flex sm:hidden items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {moment(application.date).format("MMM DD, YYYY")}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end sm:justify-center">
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${application.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : application.status === "Accepted" || application.status === "Approved"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}>
                                        {application.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 px-4">Start applying to jobs to see them here</p>
                        <Link
                            to="/all-jobs/all"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Search className="w-4 h-4" />
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>

            {/* Upcoming Interviews Section */}
            <div>
                <UpcomingInterviews userType="candidate" limit={3} />
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
                        <p className="text-green-100 text-sm mb-4">
                            A complete profile gets 5x more responses from recruiters
                        </p>
                        <Link
                            to="/candidate-dashboard/profile"
                            className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            Update Profile
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <TrendingUp className="w-16 h-16 text-green-200" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateOverview;
