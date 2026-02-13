import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Video,
    Building,
    User,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import moment from 'moment';

const UpcomingInterviews = ({ userType = 'candidate', limit = 5 }) => {
    const { backendUrl, userToken, companyToken } = useContext(AppContext);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = userType === 'candidate' ? userToken : companyToken;

    const fetchUpcomingInterviews = async () => {
        try {
            setLoading(true);
            const endpoint = userType === 'candidate'
                ? `${backendUrl}/interview/candidate?limit=${limit}`
                : `${backendUrl}/interview/recruiter?limit=${limit}`;

            const { data } = await axios.get(endpoint, {
                headers: { token }
            });

            if (data.success) {
                const filteredInterviews = data.interviews.filter(interview => interview.status !== 'cancelled');
                setInterviews(filteredInterviews);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error fetching upcoming interviews:', error);
            // Don't show error toast for empty state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUpcomingInterviews();
        }
    }, [token, limit]);

    const joinMeeting = (interview) => {
        window.open(interview.zoomJoinUrl, '_blank');
        toast.success('Opening Zoom meeting...');
    };

    const getTimeUntilInterview = (scheduledDate) => {
        const now = moment();
        const interviewTime = moment(scheduledDate);
        const duration = moment.duration(interviewTime.diff(now));

        if (duration.asMinutes() < 0) {
            return { text: 'Started', color: 'text-red-600', bgColor: 'bg-red-50' };
        } else if (duration.asMinutes() < 60) {
            return {
                text: `In ${Math.floor(duration.asMinutes())} mins`,
                color: 'text-orange-600',
                bgColor: 'bg-orange-50'
            };
        } else if (duration.asHours() < 24) {
            return {
                text: `In ${Math.floor(duration.asHours())} hours`,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50'
            };
        } else {
            return {
                text: `In ${Math.floor(duration.asDays())} days`,
                color: 'text-green-600',
                bgColor: 'bg-green-50'
            };
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (interviews.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Upcoming Interviews
                </h3>
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming interviews scheduled</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Upcoming Interviews
                </h3>
                <span className="text-sm text-gray-500">{interviews.length} scheduled</span>
            </div>

            <div className="space-y-4">
                {interviews.map((interview, index) => {
                    const timeInfo = getTimeUntilInterview(interview.scheduledDate);
                    const isToday = moment(interview.scheduledDate).isSame(moment(), 'day');
                    const canJoinSoon = moment(interview.scheduledDate).diff(moment(), 'minutes') <= 15 && moment(interview.scheduledDate).diff(moment(), 'minutes') >= -30;

                    return (
                        <motion.div
                            key={interview._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">{interview.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {userType === 'candidate' ? (
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Building className="w-3 h-3" />
                                                {interview.jobId?.companyId?.name || 'Company'}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <User className="w-3 h-3" />
                                                {interview.candidateId?.name || 'Candidate'}
                                            </div>
                                        )}
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                            {interview.interviewType}
                                        </span>
                                    </div>
                                </div>

                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${timeInfo.bgColor} ${timeInfo.color}`}>
                                    {timeInfo.text}
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {moment(interview.scheduledDate).format('MMM DD, YYYY')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {moment(interview.scheduledDate).format('h:mm A')}
                                </div>
                                <div className="text-xs">
                                    ({interview.duration} mins)
                                </div>
                            </div>

                            {/* Zoom Meeting Info */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Video className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-medium text-gray-700">Zoom Meeting</span>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div><strong>ID:</strong> {interview.zoomMeetingId}</div>
                                    <div><strong>Password:</strong> {interview.zoomPassword}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isToday && (
                                        <div className="flex items-center gap-1 text-xs text-orange-600">
                                            <AlertCircle className="w-3 h-3" />
                                            Today
                                        </div>
                                    )}
                                    {interview.status === 'scheduled' && (
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                            <CheckCircle className="w-3 h-3" />
                                            Confirmed
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {canJoinSoon && (
                                        <button
                                            onClick={() => joinMeeting(interview)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <Video className="w-3 h-3" />
                                            Join Now
                                        </button>
                                    )}

                                    <button
                                        onClick={() => window.open(interview.zoomJoinUrl, '_blank')}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>

                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Quick Join Alert for Soon-to-start Interviews */}
                            {canJoinSoon && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 text-xs text-yellow-800">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Interview starting soon! You can join the meeting now.</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* View All Button */}
            {interviews.length >= limit && (
                <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto">
                        View All Interviews
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UpcomingInterviews;
