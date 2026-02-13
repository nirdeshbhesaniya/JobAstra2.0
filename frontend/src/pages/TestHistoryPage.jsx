import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Calendar, FileText, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TestHistoryPage = () => {
    const navigate = useNavigate();
    const { backendUrl, userToken } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, attemptId: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/test/history`,
                { headers: { token: userToken } }
            );
            if (data.success) {
                setHistory(data.attempts || []);
            }
        } catch (error) {
            console.error('Error loading test history:', error);
            toast.error('Failed to load test history');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAttempt = async () => {
        try {
            setDeleting(true);
            const { data } = await axios.delete(
                `${backendUrl}/test/attempts/${deleteModal.attemptId}`,
                { headers: { token: userToken } }
            );
            if (data.success) {
                toast.success('Test attempt deleted successfully');
                await loadHistory();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting attempt:', error);
            toast.error(error.response?.data?.message || 'Failed to delete test attempt');
        } finally {
            setDeleting(false);
            setDeleteModal({ show: false, attemptId: null });
        }
    };

    const getStatusBadge = (attempt) => {
        if (attempt.status === 'completed' || attempt.status === 'evaluated') {
            const passed = attempt.percentage >= (attempt.testId?.passingMarks || 40);
            return passed ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Passed {attempt.status === 'evaluated' && '✓'}
                </span>
            ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" />
                    Failed {attempt.status === 'evaluated' && '✓'}
                </span>
            );
        } else if (attempt.status === 'in-progress') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Clock className="w-4 h-4 mr-1" />
                    In Progress
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {attempt.status}
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your test history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Test History</h1>
                    <p className="text-gray-600">View all your completed and in-progress tests</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Tests</div>
                        <div className="text-2xl font-bold text-gray-900">{history.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-sm text-gray-600 mb-1">Passed</div>
                        <div className="text-2xl font-bold text-green-600">
                            {history.filter(h => (h.status === 'completed' || h.status === 'evaluated') && h.percentage >= (h.testId?.passingMarks || 40)).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-sm text-gray-600 mb-1">Failed</div>
                        <div className="text-2xl font-bold text-red-600">
                            {history.filter(h => (h.status === 'completed' || h.status === 'evaluated') && h.percentage < (h.testId?.passingMarks || 40)).length}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-sm text-gray-600 mb-1">In Progress</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {history.filter(h => h.status === 'in-progress').length}
                        </div>
                    </div>
                </div>

                {/* Test History List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No test history</h3>
                            <p className="text-gray-600 mb-4">You haven't taken any tests yet</p>
                            <button
                                onClick={() => navigate('/candidate-dashboard/tests')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Tests
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Test Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.map((attempt) => (
                                        <tr key={attempt._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <FileText className="w-5 h-5 text-blue-600 mr-3" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {attempt.testId?.title || 'Unknown Test'}
                                                        </div>
                                                        {attempt.jobId && (
                                                            <div className="text-sm text-gray-500">
                                                                For: {attempt.jobId.title}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {new Date(attempt.startTime).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(attempt.startTime).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(attempt.status === 'completed' || attempt.status === 'evaluated') ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {attempt.totalScore || 0} / {attempt.testId?.totalMarks || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {attempt.percentage || 0}%
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(attempt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    {(attempt.status === 'completed' || attempt.status === 'evaluated') ? (
                                                        <button
                                                            onClick={() => navigate(`/candidate-dashboard/test-results/${attempt._id}`)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View Results
                                                        </button>
                                                    ) : attempt.status === 'in-progress' ? (
                                                        <button
                                                            onClick={() => navigate(`/take-test/${attempt.testId._id}`)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Continue Test
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, attemptId: attempt._id })}
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        title="Delete attempt"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteModal.show && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Test Attempt</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this test attempt? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteModal({ show: false, attemptId: null })}
                                    disabled={deleting}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAttempt}
                                    disabled={deleting}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestHistoryPage;
