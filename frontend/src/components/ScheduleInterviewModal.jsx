import React, { useState, useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import {
    Calendar,
    Clock,
    Video,
    User,
    FileText,
    Send,
    X,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import "react-datepicker/dist/react-datepicker.css";

const ScheduleInterviewModal = ({ isOpen, onClose, jobId = null, candidateId = null, candidateName = '', jobTitle = '' }) => {
    const { backendUrl, companyToken } = useContext(AppContext);
    const [formData, setFormData] = useState({
        title: jobTitle ? `Interview for ${jobTitle}` : 'Interview',
        description: '',
        scheduledDate: new Date(),
        duration: 60,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        interviewType: 'screening',
        notes: '',
        zoomMeetingId: '',
        zoomPassword: '',
        zoomJoinUrl: ''
    });
    const [selectedJobId, setSelectedJobId] = useState(jobId);
    const [selectedCandidateId, setSelectedCandidateId] = useState(candidateId);
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [step, setStep] = useState(1);
    const [scheduledInterview, setScheduledInterview] = useState(null);

    const interviewTypes = [
        { value: 'screening', label: 'Initial Screening', description: 'Basic qualification assessment' },
        { value: 'technical', label: 'Technical Interview', description: 'Skills and technical knowledge' },
        { value: 'behavioral', label: 'Behavioral Interview', description: 'Cultural fit and soft skills' },
        { value: 'final', label: 'Final Interview', description: 'Decision-making round' },
        { value: 'hr', label: 'HR Interview', description: 'Policy and compensation discussion' }
    ];

    // Fetch jobs and candidates when modal opens
    const fetchJobs = useCallback(async () => {
        try {
            console.log('Fetching jobs with token:', companyToken);
            console.log('Backend URL:', backendUrl);
            const { data } = await axios.get(`${backendUrl}/company/jobs`, {
                headers: { token: companyToken }
            });
            console.log('Jobs API response:', data);
            if (data.success) {
                console.log('Setting jobs:', data.jobs);
                setJobs(data.jobs || []);
            } else {
                console.error('Jobs API returned error:', data.message);
                toast.error(data.message || 'Failed to fetch jobs');
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            console.error('Error details:', error.response?.data);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else {
                toast.error('Failed to fetch jobs. Please try again.');
            }
        }
    }, [backendUrl, companyToken]);

    const fetchCandidates = useCallback(async () => {
        try {
            console.log('Fetching candidates with token:', companyToken);
            // This would typically fetch candidates who have applied to jobs
            // For now, we'll fetch users (potential candidates)
            const { data } = await axios.get(`${backendUrl}/user/all-users`, {
                headers: { token: companyToken }
            });
            console.log('Candidates API response:', data);
            if (data.success) {
                console.log('Setting candidates:', data.users);
                setCandidates(data.users || []);
            } else {
                console.error('Candidates API returned error:', data.message);
                toast.error(data.message || 'Failed to fetch candidates');
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
            console.error('Error details:', error.response?.data);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else {
                toast.error('Failed to fetch candidates. Please try again.');
            }
        }
    }, [backendUrl, companyToken]);

    useEffect(() => {
        if (isOpen && companyToken) {
            setFetchingData(true);
            Promise.all([fetchJobs(), fetchCandidates()])
                .finally(() => setFetchingData(false));
        }
    }, [isOpen, companyToken, fetchJobs, fetchCandidates]);

    const durations = [
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' }
    ];

    // Generate Zoom Join URL from Meeting ID and Password
    const generateZoomJoinUrl = (meetingId, password) => {
        if (!meetingId || !password) return '';

        // Remove spaces and dashes from meeting ID for URL
        const cleanMeetingId = meetingId.replace(/[\s-]/g, '');

        // Basic validation for meeting ID (should be numeric and reasonable length)
        if (!/^\d{9,12}$/.test(cleanMeetingId)) {
            // If it doesn't match expected format, still try to generate but warn
            console.warn('Meeting ID might not be in correct format. Expected 9-12 digits.');
        }

        // Encode password for URL
        const encodedPassword = encodeURIComponent(password);

        return `https://zoom.us/j/${cleanMeetingId}?pwd=${encodedPassword}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };

            // Auto-generate join URL when both Meeting ID and password are provided
            if ((name === 'zoomMeetingId' || name === 'zoomPassword') &&
                ((name === 'zoomMeetingId' && value.trim()) || newData.zoomMeetingId.trim()) &&
                ((name === 'zoomPassword' && value.trim()) || newData.zoomPassword.trim())) {

                const meetingId = name === 'zoomMeetingId' ? value : newData.zoomMeetingId;
                const password = name === 'zoomPassword' ? value : newData.zoomPassword;

                // Only auto-generate if the join URL field is empty or was auto-generated
                if (!newData.zoomJoinUrl || newData.zoomJoinUrl.includes('zoom.us/j/')) {
                    newData.zoomJoinUrl = generateZoomJoinUrl(meetingId, password);
                }
            }

            return newData;
        });
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            scheduledDate: date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!selectedJobId && !jobId) {
            toast.error('Please select a job for the interview');
            return;
        }
        if (!selectedCandidateId && !candidateId) {
            toast.error('Please select a candidate for the interview');
            return;
        }
        if (!formData.zoomMeetingId.trim()) {
            toast.error('Please provide a Zoom Meeting ID');
            return;
        }
        if (!formData.zoomPassword.trim()) {
            toast.error('Please provide a Zoom Meeting Password');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                jobId: selectedJobId || jobId,
                candidateId: selectedCandidateId || candidateId
            };

            console.log('Submitting interview data:', payload);

            const { data } = await axios.post(
                `${backendUrl}/interview/schedule`,
                payload,
                {
                    headers: { token: companyToken }
                }
            );

            console.log('Interview scheduled response:', data);

            if (data.success) {
                setScheduledInterview(data.interview);
                setStep(2); // Navigate to success step
                toast.success('Interview scheduled successfully!');

                // Refresh the parent component if there's a callback
                if (typeof window !== 'undefined' && window.refreshInterviews) {
                    window.refreshInterviews();
                }
            } else {
                toast.error(data.message || 'Failed to schedule interview');
            }
        } catch (error) {
            console.error('Error scheduling interview:', error);
            console.error('Error response:', error.response?.data);

            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Please check your input data');
            } else if (error.response?.status === 401) {
                toast.error('You are not authorized to perform this action');
            } else if (error.response?.status === 404) {
                toast.error('The requested resource was not found');
            } else {
                toast.error('Failed to schedule interview. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: jobTitle ? `Interview for ${jobTitle}` : 'Interview',
            description: '',
            scheduledDate: new Date(),
            duration: 60,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            interviewType: 'screening',
            notes: '',
            zoomMeetingId: '',
            zoomPassword: '',
            zoomJoinUrl: ''
        });
        setSelectedJobId(jobId);
        setSelectedCandidateId(candidateId);
        setStep(1);
        setScheduledInterview(null);
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Filter past dates and times
    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
        return currentDate.getTime() < selectedDate.getTime();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl max-w-xs sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                                            {step === 1 ? 'Schedule Interview' : 'Interview Scheduled!'}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-600">
                                            {step === 1 ? `With ${candidateName}` : 'Details sent to candidate'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Step Indicator */}
                        <div className="px-4 sm:px-6 py-4">
                            <div className="flex items-center justify-center">
                                <div className="flex items-center">
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        1
                                    </div>
                                    <div className={`w-12 sm:w-16 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}></div>
                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {step >= 2 ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : '2'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Schedule Details</span>
                                <span>Confirmation</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6">
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Job Selection (if not pre-selected) */}
                                        {!jobId && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Select Job Position *
                                                </label>
                                                <select
                                                    value={selectedJobId || ''}
                                                    onChange={(e) => {
                                                        setSelectedJobId(e.target.value);
                                                        const selectedJob = jobs.find(job => job._id === e.target.value);
                                                        if (selectedJob) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                title: `Interview for ${selectedJob.title}`
                                                            }));
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!selectedJobId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    required
                                                    disabled={fetchingData}
                                                >
                                                    <option value="">
                                                        {fetchingData ? 'Loading jobs...' : 'Select a job position...'}
                                                    </option>
                                                    {jobs.map((job) => (
                                                        <option key={job._id} value={job._id}>
                                                            {job.title} - {job.location}
                                                        </option>
                                                    ))}
                                                </select>
                                                {!selectedJobId && !fetchingData && (
                                                    <p className="text-red-500 text-xs mt-1">Please select a job position</p>
                                                )}
                                                {fetchingData && (
                                                    <p className="text-blue-500 text-xs mt-1">Loading available positions...</p>
                                                )}
                                                {!fetchingData && jobs.length === 0 && (
                                                    <p className="text-amber-600 text-xs mt-1">No jobs found. Please create a job first.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Candidate Selection (if not pre-selected) */}
                                        {!candidateId && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Select Candidate *
                                                </label>
                                                <select
                                                    value={selectedCandidateId || ''}
                                                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!selectedCandidateId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    required
                                                    disabled={fetchingData}
                                                >
                                                    <option value="">
                                                        {fetchingData ? 'Loading candidates...' : 'Select a candidate...'}
                                                    </option>
                                                    {candidates.map((candidate) => (
                                                        <option key={candidate._id} value={candidate._id}>
                                                            {candidate.name} ({candidate.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                {!selectedCandidateId && !fetchingData && (
                                                    <p className="text-red-500 text-xs mt-1">Please select a candidate</p>
                                                )}
                                                {fetchingData && (
                                                    <p className="text-blue-500 text-xs mt-1">Loading available candidates...</p>
                                                )}
                                                {!fetchingData && candidates.length === 0 && (
                                                    <p className="text-amber-600 text-xs mt-1">No candidates found.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Interview Title */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Interview Title
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        {/* Interview Type */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Interview Type
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {interviewTypes.map((type) => (
                                                    <label
                                                        key={type.value}
                                                        className={`border rounded-lg p-3 cursor-pointer transition-all ${formData.interviewType === type.value
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="interviewType"
                                                            value={type.value}
                                                            checked={formData.interviewType === type.value}
                                                            onChange={handleInputChange}
                                                            className="sr-only"
                                                        />
                                                        <div className="font-semibold text-sm">{type.label}</div>
                                                        <div className="text-xs text-gray-600">{type.description}</div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Date and Time */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Date & Time
                                                </label>
                                                <DatePicker
                                                    selected={formData.scheduledDate}
                                                    onChange={handleDateChange}
                                                    showTimeSelect
                                                    filterTime={filterPassedTime}
                                                    dateFormat="MMMM d, yyyy h:mm aa"
                                                    minDate={new Date()}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Duration
                                                </label>
                                                <select
                                                    name="duration"
                                                    value={formData.duration}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    {durations.map((duration) => (
                                                        <option key={duration.value} value={duration.value}>
                                                            {duration.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Brief description of what will be covered in this interview..."
                                            />
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Additional Notes
                                            </label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Any additional information for the candidate..."
                                            />
                                        </div>

                                        {/* Zoom Meeting Details */}
                                        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Video className="w-4 h-4 text-blue-600" />
                                                Zoom Meeting Details
                                            </h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Meeting ID <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zoomMeetingId"
                                                        value={formData.zoomMeetingId}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="e.g., 123-456-789"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Password <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zoomPassword"
                                                        value={formData.zoomPassword}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Meeting password"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Join URL
                                                        {formData.zoomJoinUrl && formData.zoomJoinUrl.includes('zoom.us/j/') && (
                                                            <span className="text-xs text-green-600 font-normal ml-2">
                                                                (Auto-generated)
                                                            </span>
                                                        )}
                                                    </label>
                                                    {formData.zoomMeetingId && formData.zoomPassword && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newUrl = generateZoomJoinUrl(formData.zoomMeetingId, formData.zoomPassword);
                                                                    setFormData(prev => ({ ...prev, zoomJoinUrl: newUrl }));
                                                                    toast.success('Join URL regenerated');
                                                                }}
                                                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                                            >
                                                                🔄 Regenerate
                                                            </button>
                                                            {formData.zoomJoinUrl && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(formData.zoomJoinUrl);
                                                                        toast.success('Join URL copied to clipboard');
                                                                    }}
                                                                    className="text-xs text-green-600 hover:text-green-800 transition-colors"
                                                                >
                                                                    📋 Copy
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="url"
                                                    name="zoomJoinUrl"
                                                    value={formData.zoomJoinUrl}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${formData.zoomJoinUrl && formData.zoomJoinUrl.includes('zoom.us/j/')
                                                        ? 'border-green-300 bg-green-50'
                                                        : 'border-gray-300'
                                                        }`}
                                                    placeholder="https://zoom.us/j/123456789?pwd=..."
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.zoomMeetingId && formData.zoomPassword ?
                                                        '✅ Auto-generated from Meeting ID and Password. You can modify this URL if needed.' :
                                                        '💡 Will be auto-generated when you enter Meeting ID and Password'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || (!selectedJobId && !jobId) || (!selectedCandidateId && !candidateId) || !formData.zoomMeetingId.trim() || !formData.zoomPassword.trim()}
                                                className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        Scheduling...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5" />
                                                        Schedule Interview
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 2 && scheduledInterview && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-center space-y-6"
                                >
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">Interview Scheduled Successfully!</h4>
                                        <p className="text-gray-600">
                                            The candidate has been notified via email with all the meeting details.
                                        </p>
                                    </div>

                                    {/* Interview Summary */}
                                    <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4">
                                        <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Interview Summary
                                        </h5>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Candidate:</span>
                                                <div className="text-gray-900">{candidateName}</div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Position:</span>
                                                <div className="text-gray-900">{jobTitle}</div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Date & Time:</span>
                                                <div className="text-gray-900">
                                                    {new Date(scheduledInterview.scheduledDate).toLocaleDateString()} at{' '}
                                                    {new Date(scheduledInterview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Duration:</span>
                                                <div className="text-gray-900">{scheduledInterview.duration} minutes</div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Video className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium text-blue-800">Zoom Meeting Details</span>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                <div><strong>Meeting ID:</strong> {scheduledInterview.zoomMeetingId}</div>
                                                <div><strong>Password:</strong> {scheduledInterview.zoomPassword}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => {
                                                setStep(1);
                                                setScheduledInterview(null);
                                            }}
                                            className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                        >
                                            Schedule Another
                                        </button>
                                        <button
                                            onClick={handleClose}
                                            className="w-full sm:flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScheduleInterviewModal;
