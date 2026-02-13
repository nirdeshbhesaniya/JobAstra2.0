import React from 'react';
import { motion } from 'framer-motion';
import InterviewCalendar from '../components/InterviewCalendar';
import UpcomingInterviews from '../components/UpcomingInterviews';

const InterviewDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Interview Dashboard</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Manage your interview schedule and upcoming meetings</p>
                </motion.div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Main Calendar Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <InterviewCalendar />
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        {/* Upcoming Interviews */}
                        <UpcomingInterviews userType="candidate" limit={5} />

                        {/* Quick Tips */}
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Interview Tips</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-xs sm:text-sm text-gray-600">Test your audio and video 5 minutes before the interview</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-xs sm:text-sm text-gray-600">Prepare questions about the role and company</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-xs sm:text-sm text-gray-600">Have your resume and portfolio ready</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-xs sm:text-sm text-gray-600">Join from a quiet, well-lit location</p>
                                </div>
                            </div>
                        </div>

                        {/* Technical Checklist */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Pre-Interview Checklist</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="rounded border-gray-300 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-gray-700">Camera working properly</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="rounded border-gray-300 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-gray-700">Microphone tested</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="rounded border-gray-300 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-gray-700">Stable internet connection</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="rounded border-gray-300 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-gray-700">Zoom app updated</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="rounded border-gray-300 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-gray-700">Documents ready</span>
                                </label>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default InterviewDashboard;
