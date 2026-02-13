import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Clock,
    Video,
    MapPin,
    User,
    Building,
    Phone,
    Mail,
    ExternalLink,
    Edit,
    Trash2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './InterviewCalendar.css';

const localizer = momentLocalizer(moment);

const InterviewCalendar = () => {
    const { backendUrl, userToken } = useContext(AppContext);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [calendarView, setCalendarView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle window resize for responsive calendar
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            // Auto switch to agenda view on very small screens
            if (window.innerWidth < 480 && calendarView === 'month') {
                setCalendarView('agenda');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calendarView]);

    // Fetch interviews
    const fetchInterviews = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/interview/candidate`, {
                headers: { Authorization: `Bearer ${userToken}` }
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
    }, [backendUrl, userToken]);

    useEffect(() => {
        if (userToken) {
            fetchInterviews();
        }
    }, [userToken, fetchInterviews]);

    // Transform interviews for calendar
    const calendarEvents = interviews.map(interview => ({
        id: interview._id,
        title: interview.title,
        start: new Date(interview.scheduledDate),
        end: new Date(new Date(interview.scheduledDate).getTime() + (interview.duration * 60000)),
        resource: interview,
        allDay: false
    }));

    // Handle event selection
    const handleSelectEvent = (event) => {
        setSelectedInterview(event.resource);
        setShowDetailModal(true);
    };

    // Join Zoom meeting
    const joinMeeting = (interview) => {
        const zoomUrl = interview.zoomJoinUrl;
        window.open(zoomUrl, '_blank');
        toast.success('Opening Zoom meeting...');
    };

    // Event style based on status
    const eventStyleGetter = (event) => {
        const interview = event.resource;
        let backgroundColor = '#3174ad';

        switch (interview.status) {
            case 'scheduled':
                backgroundColor = '#10b981';
                break;
            case 'completed':
                backgroundColor = '#6b7280';
                break;
            case 'cancelled':
                backgroundColor = '#ef4444';
                break;
            case 'rescheduled':
                backgroundColor = '#f59e0b';
                break;
            default:
                backgroundColor = '#3174ad';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                padding: '4px 8px'
            }
        };
    };

    // Reschedule interview
    const handleReschedule = async (interviewId, newDate, reason) => {
        try {
            const { data } = await axios.put(
                `${backendUrl}/interview/reschedule/${interviewId}`,
                { newDate, reason },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (data.success) {
                toast.success('Interview rescheduled successfully');
                fetchInterviews();
                setShowDetailModal(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error rescheduling interview:', error);
            toast.error('Failed to reschedule interview');
        }
    };

    // Cancel interview
    const handleCancel = async (interviewId, reason) => {
        try {
            const { data } = await axios.delete(
                `${backendUrl}/interview/cancel/${interviewId}`,
                {
                    data: { reason },
                    headers: { Authorization: `Bearer ${userToken}` }
                }
            );

            if (data.success) {
                toast.success('Interview cancelled successfully');
                fetchInterviews();
                setShowDetailModal(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error cancelling interview:', error);
            toast.error('Failed to cancel interview');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-3 sm:p-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                            Interview Calendar
                        </h1>
                        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your scheduled interviews</p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <select
                            value={calendarView}
                            onChange={(e) => setCalendarView(e.target.value)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="month">Month</option>
                            <option value="week">Week</option>
                            <option value="day">Day</option>
                            <option value="agenda">Agenda</option>
                        </select>

                        {/* Mobile friendly view button */}
                        {isMobile && (
                            <button
                                onClick={() => setCalendarView(calendarView === 'agenda' ? 'month' : 'agenda')}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                {calendarView === 'agenda' ? 'Grid' : 'List'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                {[
                    { label: 'Total Interviews', value: interviews.length, color: 'blue' },
                    { label: 'Scheduled', value: interviews.filter(i => i.status === 'scheduled').length, color: 'green' },
                    { label: 'Completed', value: interviews.filter(i => i.status === 'completed').length, color: 'gray' },
                    { label: 'Upcoming', value: interviews.filter(i => new Date(i.scheduledDate) > new Date() && i.status === 'scheduled').length, color: 'purple' }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-${stat.color}-500`}
                    >
                        <div className={`text-xl sm:text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                        <div className="text-gray-600 text-xs sm:text-sm">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 overflow-hidden">
                {/* Mobile tip */}
                {isMobile && calendarView === 'month' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                            💡 <strong>Tip:</strong> Switch to "Agenda" view for better mobile experience
                        </p>
                    </div>
                )}

                <div className="h-[400px] sm:h-[500px] lg:h-[600px]">
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        onSelectEvent={handleSelectEvent}
                        view={calendarView}
                        onView={setCalendarView}
                        date={currentDate}
                        onNavigate={setCurrentDate}
                        eventPropGetter={eventStyleGetter}
                        popup
                        step={30}
                        timeslots={2}
                        formats={{
                            timeGutterFormat: 'HH:mm',
                            eventTimeRangeFormat: ({ start, end }) =>
                                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                            dayFormat: (date, culture, localizer) =>
                                isMobile ? localizer.format(date, 'dd', culture) : localizer.format(date, 'dddd', culture),
                            dayHeaderFormat: (date, culture, localizer) =>
                                isMobile ? localizer.format(date, 'dd', culture) : localizer.format(date, 'dddd MMM DD', culture),
                            weekdayFormat: (date, culture, localizer) =>
                                isMobile ? localizer.format(date, 'dd', culture) : localizer.format(date, 'dddd', culture)
                        }}
                        messages={{
                            allDay: 'All Day',
                            previous: '<',
                            next: '>',
                            today: 'Today',
                            month: 'Month',
                            week: 'Week',
                            day: 'Day',
                            agenda: 'Agenda',
                            date: 'Date',
                            time: 'Time',
                            event: 'Event',
                            noEventsInRange: 'No interviews scheduled for this period.',
                            showMore: total => `+${total} more`
                        }}
                    />
                </div>
            </div>

            {/* Interview Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedInterview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate pr-2">{selectedInterview.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${selectedInterview.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                                                selectedInterview.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                    selectedInterview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {selectedInterview.status.charAt(0).toUpperCase() + selectedInterview.status.slice(1)}
                                            </span>
                                            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {selectedInterview.interviewType}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 flex-shrink-0"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                {/* Date & Time */}
                                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                    <CalendarIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                                            {moment(selectedInterview.scheduledDate).format('MMMM Do, YYYY')}
                                        </div>
                                        <div className="text-gray-600 flex flex-wrap items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">
                                                {moment(selectedInterview.scheduledDate).format('h:mm A')} - {moment(selectedInterview.scheduledDate).add(selectedInterview.duration, 'minutes').format('h:mm A')}
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-500">({selectedInterview.duration} minutes)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Details */}
                                {selectedInterview.jobId && (
                                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                                        <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedInterview.jobId.title}</div>
                                            <div className="text-gray-600 text-sm truncate">{selectedInterview.jobId.company}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Recruiter Details */}
                                {selectedInterview.recruiterId && (
                                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg">
                                        <User className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedInterview.recruiterId.name}</div>
                                            <div className="text-gray-600 space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{selectedInterview.recruiterId.email}</span>
                                                </div>
                                                {selectedInterview.recruiterId.phone && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                                        <span>{selectedInterview.recruiterId.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Zoom Meeting Details */}
                                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Video className="w-5 h-5 text-blue-600" />
                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Zoom Meeting Details</h4>
                                    </div>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="break-all"><strong>Meeting ID:</strong> {selectedInterview.zoomMeetingId}</div>
                                        <div className="break-all"><strong>Password:</strong> {selectedInterview.zoomPassword}</div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <strong className="flex-shrink-0">Join URL:</strong>
                                            <a
                                                href={selectedInterview.zoomJoinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 break-all"
                                            >
                                                Click to join <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Description/Notes */}
                                {(selectedInterview.description || selectedInterview.notes) && (
                                    <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Notes</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap text-sm">
                                            {selectedInterview.description || selectedInterview.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                                    <button
                                        onClick={() => joinMeeting(selectedInterview)}
                                        className="flex-1 bg-blue-600 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Join Meeting
                                    </button>

                                    {selectedInterview.status === 'scheduled' && new Date(selectedInterview.scheduledDate) > new Date() && (
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <button
                                                onClick={() => {
                                                    const newDate = prompt('Enter new date and time (YYYY-MM-DD HH:MM):');
                                                    const reason = prompt('Reason for rescheduling:');
                                                    if (newDate && reason) {
                                                        handleReschedule(selectedInterview._id, newDate, reason);
                                                    }
                                                }}
                                                className="px-4 sm:px-6 py-3 border border-yellow-600 text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Reschedule
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Reason for cancellation:');
                                                    if (reason && confirm('Are you sure you want to cancel this interview?')) {
                                                        handleCancel(selectedInterview._id, reason);
                                                    }
                                                }}
                                                className="px-4 sm:px-6 py-3 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Warning for past interviews */}
                                {new Date(selectedInterview.scheduledDate) < new Date() && selectedInterview.status === 'scheduled' && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-sm">This interview time has passed. Please contact the recruiter if needed.</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InterviewCalendar;
