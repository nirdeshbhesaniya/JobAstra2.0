import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
    Briefcase,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    PlusCircle,
    Eye,
    Edit3,
    TrendingUp,
    Calendar,
    FileText
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const RecruiterOverview = () => {
    const { companyData, backendUrl, companyToken } = useContext(AppContext);
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch jobs
            const jobsResponse = await axios.get(
                `${backendUrl}/company/company/posted-jobs`,
                {
                    headers: { token: companyToken },
                }
            );

            // Fetch applications
            const applicationsResponse = await axios.post(
                `${backendUrl}/company/view-applications`,
                {},
                {
                    headers: { token: companyToken },
                }
            );

            if (jobsResponse.data.success) {
                const jobs = jobsResponse.data.jobData || [];
                setRecentJobs(jobs.slice(0, 5)); // Get 5 most recent jobs

                let totalApplications = 0;
                jobs.forEach(job => {
                    totalApplications += job.applicants || 0;
                });

                setStats(prev => ({
                    ...prev,
                    totalJobs: jobs.length,
                    totalApplications,
                }));
            }

            if (applicationsResponse.data.success) {
                const applications = applicationsResponse.data.viewApplicationData || [];
                setRecentApplications(applications.slice(0, 5)); // Get 5 most recent applications

                const pending = applications.filter(app => app.status === "Pending").length;
                const accepted = applications.filter(app => app.status === "Accepted").length;
                const rejected = applications.filter(app => app.status === "Rejected").length;

                setStats(prev => ({
                    ...prev,
                    pendingApplications: pending,
                    acceptedApplications: accepted,
                    rejectedApplications: rejected,
                }));
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [backendUrl, companyToken]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        document.title = "JobAstra - Recruiter Dashboard";
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {companyData?.name}!
                        </h1>
                        <p className="text-green-100">
                            Manage your job postings and review applications from talented candidates
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <img
                            src={companyData?.image}
                            alt="Company logo"
                            className="w-16 h-16 rounded-full border-4 border-green-400 object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Accepted</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.acceptedApplications}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Rejected</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.rejectedApplications}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/dashboard/add-job"
                    className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <PlusCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Post New Job</h3>
                            <p className="text-sm text-gray-500">Create a new job posting</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/dashboard/manage-jobs"
                    className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Edit3 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Manage Jobs</h3>
                            <p className="text-sm text-gray-500">Edit and manage your jobs</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/dashboard/view-applications"
                    className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <Eye className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">View Applications</h3>
                            <p className="text-sm text-gray-500">Review candidate applications</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Jobs and Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Jobs */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
                            <Link
                                to="/dashboard/manage-jobs"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {recentJobs.length > 0 ? (
                            <div className="space-y-4">
                                {recentJobs.map((job) => (
                                    <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{job.title}</h3>
                                            <p className="text-sm text-gray-500">{job.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{job.applicants || 0} applicants</p>
                                            <p className="text-xs text-gray-500">
                                                {job.visible ? "Active" : "Hidden"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No jobs posted yet</p>
                                <Link
                                    to="/dashboard/add-job"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Post your first job
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                            <Link
                                to="/dashboard/view-applications"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {recentApplications.length > 0 ? (
                            <div className="space-y-4">
                                {recentApplications.map((app) => (
                                    <div key={app._id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={app.userId?.image}
                                            alt={app.userId?.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{app.userId?.name}</h3>
                                            <p className="text-sm text-gray-500">{app.jobId?.title}</p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${app.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : app.status === "Accepted"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {app.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No applications yet</p>
                                <p className="text-sm text-gray-400">Applications will appear here once candidates apply</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterOverview;
