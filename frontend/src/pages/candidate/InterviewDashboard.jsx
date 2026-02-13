import { useState, useEffect, useContext, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, User, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const localizer = momentLocalizer(moment);

const InterviewDashboard = () => {
    const { backendUrl, userToken } = useContext(AppContext);
    const [interviews, setInterviews] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());

    // Fetch interviews
    const fetchInterviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${backendUrl}/interview/candidate`,
                { headers: { token: userToken } }
            );

            if (response.data.success) {
                const formattedInterviews = response.data.interviews
                    .filter(interview => interview.status !== 'cancelled') // Hide cancelled interviews globally
                    .map(interview => ({
                        id: interview._id,
                        title: `Interview with ${interview.jobId?.companyId?.name || 'Company'}`,
                        start: new Date(interview.scheduledDate),
                        end: new Date(new Date(interview.scheduledDate).getTime() + interview.duration * 60000),
                        resource: {
                            ...interview,
                            company: interview.jobId?.companyId,
                            jobPosition: interview.jobId?.title
                        },
                        status: interview.status
                    }));
                setInterviews(formattedInterviews);
            }
        } catch (error) {
            console.error('Error fetching interviews:', error);
            toast.error('Failed to fetch interviews');
        } finally {
            setLoading(false);
        }
    }, [backendUrl, userToken]);

    useEffect(() => {
        if (userToken) {
            fetchInterviews();
        }
    }, [userToken, backendUrl, fetchInterviews]);

    // Event style getter
    const eventStyleGetter = (event) => {
        let backgroundColor = '#3b82f6';

        switch (event.status) {
            case 'scheduled':
                backgroundColor = '#3b82f6';
                break;
            case 'completed':
                backgroundColor = '#10b981';
                break;
            case 'cancelled':
                backgroundColor = '#ef4444';
                break;
            case 'rescheduled':
                backgroundColor = '#f59e0b';
                break;
            default:
                backgroundColor = '#6b7280';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    // Handle event selection
    const handleSelectEvent = (event) => {
        setSelectedInterview(event.resource);
        setIsModalOpen(true);
    };

    // Join meeting
    const joinMeeting = () => {
        if (selectedInterview?.zoomJoinUrl) {
            window.open(selectedInterview.zoomJoinUrl, '_blank');
            toast.success('Opening Zoom meeting...');
        } else {
            toast.error('Meeting link not available');
        }
    };

    // Cancel interview
    const cancelInterview = async (interviewId, reason) => {
        try {
            console.log('Cancelling interview:', { interviewId, reason });

            const response = await axios.delete(
                `${backendUrl}/interview/candidate/${interviewId}/cancel`,
                {
                    data: { reason },
                    headers: { token: userToken }
                }
            );

            console.log('Cancel response:', response.data);

            if (response.data.success) {
                toast.success('Interview cancelled successfully');
                setIsModalOpen(false);
                fetchInterviews(); // Refresh interviews
            } else {
                toast.error(response.data.message || 'Failed to cancel interview');
            }
        } catch (error) {
            console.error('Error cancelling interview:', error);
            console.error('Error response:', error.response?.data);
            toast.error('Failed to cancel interview');
        }
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        const getStatusColor = (status) => {
            switch (status) {
                case 'scheduled': return 'bg-blue-100 text-blue-800';
                case 'completed': return 'bg-green-100 text-green-800';
                case 'cancelled': return 'bg-red-100 text-red-800';
                case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Interview Calendar</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage your interview schedule and join meetings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">{interviews.length}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Scheduled</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                    {interviews.filter(i => i.status === 'scheduled').length}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <User className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                    {interviews.filter(i => i.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center">
                            <Video className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                            <div className="ml-3 sm:ml-4">
                                <p className="text-xs sm:text-sm font-medium text-gray-600">This Week</p>
                                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                    {interviews.filter(i =>
                                        moment(i.start).isBetween(moment().startOf('week'), moment().endOf('week'))
                                    ).length}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Calendar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
                >
                    <div className="h-[400px] sm:h-[500px] md:h-[600px]">
                        <Calendar
                            localizer={localizer}
                            events={interviews}
                            startAccessor="start"
                            endAccessor="end"
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventStyleGetter}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            popup
                            className="h-full"
                            components={{
                                toolbar: ({ label, onNavigate, onView }) => (
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b">
                                        <div className="flex items-center space-x-2 sm:space-x-4 order-2 sm:order-1">
                                            <button
                                                onClick={() => onNavigate('PREV')}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{label}</h2>
                                            <button
                                                onClick={() => onNavigate('NEXT')}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                        <div className="flex space-x-1 sm:space-x-2 order-1 sm:order-2">
                                            {['month', 'week', 'day'].map((viewName) => (
                                                <button
                                                    key={viewName}
                                                    onClick={() => onView(viewName)}
                                                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${view === viewName
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }}
                        />
                    </div>
                </motion.div>

                {/* Interview Details Modal */}
                {isModalOpen && selectedInterview && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg shadow-xl max-w-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Interview Details</h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 text-xl p-1"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 truncate">{selectedInterview.company?.name || 'Company'}</p>
                                            <p className="text-sm text-gray-600 truncate">{selectedInterview.jobPosition}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900">
                                                {moment(selectedInterview.scheduledDate).format('MMMM DD, YYYY')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {moment(selectedInterview.scheduledDate).format('hh:mm A')}
                                                <span className="text-xs ml-1">({selectedInterview.duration} mins)</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900">
                                                {selectedInterview.interviewType === 'video' ? 'Video Call' :
                                                    selectedInterview.interviewType === 'phone' ? 'Phone Call' : 'Video Call'}
                                            </p>
                                            {selectedInterview.location && (
                                                <p className="text-sm text-gray-600 truncate">{selectedInterview.location}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Status:</span>
                                        <StatusBadge status={selectedInterview.status} />
                                    </div>

                                    {selectedInterview.notes && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-2">Notes:</p>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                {selectedInterview.notes}
                                            </p>
                                        </div>
                                    )}

                                    {selectedInterview.interviewers && selectedInterview.interviewers.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 mb-2">Interviewers:</p>
                                            <div className="space-y-1">
                                                {selectedInterview.interviewers.map((interviewer, index) => (
                                                    <p key={index} className="text-sm text-gray-900">
                                                        {interviewer.name} - {interviewer.position}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                    {selectedInterview.status === 'scheduled' && selectedInterview.zoomJoinUrl && (
                                        <button
                                            onClick={joinMeeting}
                                            className="w-full sm:flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                                        >
                                            Join Meeting
                                        </button>
                                    )}
                                    {selectedInterview.status === 'scheduled' && (
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Please provide a reason for cancellation:');
                                                if (reason) {
                                                    cancelInterview(selectedInterview._id, reason);
                                                }
                                            }}
                                            className="w-full sm:flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
                                        >
                                            Cancel Interview
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default InterviewDashboard;
