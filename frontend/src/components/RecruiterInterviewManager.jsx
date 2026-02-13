import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Video,
    User,
    Building,
    Phone,
    Mail,
    Search,
    MoreVertical,
    Edit,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import moment from 'moment';

const RecruiterInterviewManager = () => {
    const { backendUrl, companyToken } = useContext(AppContext);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    // const [selectedCandidate, setSelectedCandidate] = useState(null);
    // const [selectedJob, setSelectedJob] = useState(null);

    // Fetch interviews
    const fetchInterviews = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (dateFilter !== 'all') {
                const now = new Date();
                let startDate, endDate;

                switch (dateFilter) {
                    case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0));
                        endDate = new Date(now.setHours(23, 59, 59, 999));
                        break;
                    case 'week':
                        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        break;
                }

                if (startDate && endDate) {
                    params.append('startDate', startDate.toISOString());
                    params.append('endDate', endDate.toISOString());
                }
            }

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const { data } = await axios.get(`${backendUrl}/interview/recruiter?${params}`, {
                headers: { token: companyToken }
            });

            if (data.success) {
                setInterviews(data.interviews);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching interviews:', error);
            toast.error('Failed to fetch interviews');
        } finally {
            setLoading(false);
        }
    }, [backendUrl, companyToken, dateFilter, statusFilter]);

    useEffect(() => {
        if (companyToken) {
            fetchInterviews();
        }
    }, [companyToken, statusFilter, dateFilter, fetchInterviews]);

    // Filter interviews based on search
    const filteredInterviews = interviews.filter(interview => {
        const candidateName = interview.candidateId?.name?.toLowerCase() || '';
        const jobTitle = interview.jobId?.title?.toLowerCase() || '';
        const interviewTitle = interview.title?.toLowerCase() || '';

        return candidateName.includes(searchTerm.toLowerCase()) ||
            jobTitle.includes(searchTerm.toLowerCase()) ||
            interviewTitle.includes(searchTerm.toLowerCase());
    });

    // Update interview status
    const updateInterviewStatus = async (interviewId, status, feedback = null) => {
        try {
            const payload = { status };
            if (feedback) payload.feedback = feedback;

            const { data } = await axios.put(
                `${backendUrl}/interview/status/${interviewId}`,
                payload,
                { headers: { token: companyToken } }
            );

            if (data.success) {
                toast.success('Interview status updated');
                fetchInterviews();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error updating interview status:', error);
            toast.error('Failed to update interview status');
        }
    };

    // Delete interview (for cancelled interviews only)
    const deleteInterview = async (interviewId) => {
        if (!confirm('Are you sure you want to permanently delete this interview? This action cannot be undone.')) {
            return;
        }

        try {
            const { data } = await axios.delete(
                `${backendUrl}/interview/delete/${interviewId}`,
                { headers: { token: companyToken } }
            );

            if (data.success) {
                toast.success('Interview deleted successfully');
                fetchInterviews();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting interview:', error);
            toast.error('Failed to delete interview');
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
            'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
            completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
            rescheduled: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Edit },
            'no-show': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
        };

        const config = statusConfig[status] || statusConfig.scheduled;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Quick actions menu
    const QuickActionsMenu = ({ interview }) => {
        const [showMenu, setShowMenu] = useState(false);

        return (
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                        {interview.status === 'scheduled' && (
                            <>
                                <button
                                    onClick={() => updateInterviewStatus(interview._id, 'in-progress')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                                    Start Interview
                                </button>
                                <button
                                    onClick={() => updateInterviewStatus(interview._id, 'completed')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    Mark Complete
                                </button>
                                <button
                                    onClick={() => updateInterviewStatus(interview._id, 'no-show')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4 text-gray-600" />
                                    Mark No-Show
                                </button>
                            </>
                        )}

                        {interview.status === 'in-progress' && (
                            <button
                                onClick={() => updateInterviewStatus(interview._id, 'completed')}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Complete Interview
                            </button>
                        )}

                        {interview.status === 'cancelled' && (
                            <button
                                onClick={() => deleteInterview(interview._id)}
                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm flex items-center gap-2 text-red-600"
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                                Delete Interview
                            </button>
                        )}

                        <button
                            onClick={() => window.open(interview.zoomJoinUrl, '_blank')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                            disabled={!interview.zoomJoinUrl}
                        >
                            <Video className="w-4 h-4 text-blue-600" />
                            {interview.zoomJoinUrl ? 'Join Meeting' : 'No Meeting Link'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 lg:gap-3">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
                        Interview Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 lg:mt-2">Manage and track all scheduled interviews</p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
                {[
                    { label: 'Total', value: interviews.length, color: 'blue', status: 'all' },
                    { label: 'Scheduled', value: interviews.filter(i => i.status === 'scheduled').length, color: 'green', status: 'scheduled' },
                    { label: 'In Progress', value: interviews.filter(i => i.status === 'in-progress').length, color: 'yellow', status: 'in-progress' },
                    { label: 'Completed', value: interviews.filter(i => i.status === 'completed').length, color: 'gray', status: 'completed' },
                    { label: 'Cancelled', value: interviews.filter(i => i.status === 'cancelled').length, color: 'red', status: 'cancelled' }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border-l-4 border-${stat.color}-500 cursor-pointer hover:shadow-xl transition-shadow`}
                        onClick={() => setStatusFilter(stat.status)}
                    >
                        <div className={`text-lg sm:text-xl lg:text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                        <div className="text-gray-600 text-xs sm:text-sm truncate">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 lg:mb-8">
                <div className="flex flex-col gap-4">
                    {/* Search and Schedule Button */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search by candidate name, job title, or interview title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            />
                        </div>
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            Schedule Interview
                        </button>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rescheduled">Rescheduled</option>
                            <option value="no-show">No Show</option>
                        </select>

                        {/* Date Filter */}
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Interviews List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {filteredInterviews.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No interviews found</h3>
                        <p className="text-sm sm:text-base text-gray-500">Try adjusting your filters or schedule a new interview</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interview Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Meeting
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredInterviews.map((interview, index) => (
                                        <motion.tr
                                            key={interview._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50"
                                        >
                                            {/* Interview Details */}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold text-gray-900">{interview.title}</div>
                                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Building className="w-4 h-4" />
                                                        {interview.jobId?.title}
                                                    </div>
                                                    <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                                        {interview.interviewType}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Candidate */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{interview.candidateId?.name}</div>
                                                        <div className="text-sm text-gray-600 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {interview.candidateId?.email}
                                                        </div>
                                                        {interview.candidateId?.phone && (
                                                            <div className="text-sm text-gray-600 flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {interview.candidateId.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date & Time */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-semibold text-gray-900">
                                                        {moment(interview.scheduledDate).format('MMM DD, YYYY')}
                                                    </div>
                                                    <div className="text-gray-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {moment(interview.scheduledDate).format('h:mm A')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {interview.duration} minutes
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {getStatusBadge(interview.status)}
                                            </td>

                                            {/* Meeting */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-mono text-gray-900">ID: {interview.zoomMeetingId}</div>
                                                    <div className="text-gray-600">Pass: {interview.zoomPassword}</div>
                                                    <button
                                                        onClick={() => window.open(interview.zoomJoinUrl, '_blank')}
                                                        className="mt-1 text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                        disabled={!interview.zoomJoinUrl}
                                                    >
                                                        <Video className="w-3 h-3" />
                                                        {interview.zoomJoinUrl ? 'Join Meeting' : 'No Link'}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <QuickActionsMenu interview={interview} />
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden">
                            <div className="divide-y divide-gray-200">
                                {filteredInterviews.map((interview, index) => (
                                    <motion.div
                                        key={interview._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 sm:p-6 hover:bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{interview.title}</h3>
                                                <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                    <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    {interview.jobId?.title}
                                                </div>
                                                <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                                    {interview.interviewType}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(interview.status)}
                                                <QuickActionsMenu interview={interview} />
                                            </div>
                                        </div>

                                        {/* Candidate Info */}
                                        <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{interview.candidateId?.name}</div>
                                                <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{interview.candidateId?.email}</span>
                                                </div>
                                                {interview.candidateId?.phone && (
                                                    <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {interview.candidateId.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Date & Meeting Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Schedule</div>
                                                <div className="text-sm sm:text-base font-semibold text-gray-900">
                                                    {moment(interview.scheduledDate).format('MMM DD, YYYY')}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {moment(interview.scheduledDate).format('h:mm A')} ({interview.duration}min)
                                                </div>
                                            </div>

                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Meeting</div>
                                                <div className="text-xs sm:text-sm font-mono text-gray-900 mb-1">ID: {interview.zoomMeetingId}</div>
                                                <div className="text-xs sm:text-sm text-gray-600 mb-2">Pass: {interview.zoomPassword}</div>
                                                <button
                                                    onClick={() => window.open(interview.zoomJoinUrl, '_blank')}
                                                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center gap-1 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    disabled={!interview.zoomJoinUrl}
                                                >
                                                    <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    {interview.zoomJoinUrl ? 'Join Meeting' : 'No Meeting Link'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Schedule Interview Modal */}
            <ScheduleInterviewModal
                isOpen={showScheduleModal}
                onClose={() => {
                    setShowScheduleModal(false);
                    fetchInterviews(); // Refresh the interviews list
                }}
            />
        </div>
    );
};

export default RecruiterInterviewManager;
