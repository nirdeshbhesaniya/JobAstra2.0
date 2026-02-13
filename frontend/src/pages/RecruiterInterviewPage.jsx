import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecruiterInterviewManager from '../components/RecruiterInterviewManager';

const RecruiterInterviewPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                    <Link to="/dashboard" className="flex items-center hover:text-gray-900 transition-colors">
                        <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-gray-900 font-medium">Interview Management</span>
                </nav>

                {/* Enhanced Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Interview Management</h1>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600">Manage and track all candidate interviews</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <div className="flex items-center">
                                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Interviews</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">24</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <div className="flex items-center">
                                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Scheduled</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">8</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <div className="flex items-center">
                                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">12</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <div className="flex items-center">
                                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">This Week</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">5</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Dashboard Grid */}
                <div className="w-full">
                    {/* Main Management Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-full"
                    >
                        <RecruiterInterviewManager />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterInterviewPage;
