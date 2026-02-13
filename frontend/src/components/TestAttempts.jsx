import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Clock, User, Calendar, CheckCircle, XCircle, Eye, Search, Filter, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TestAccessControl from './TestAccessControl';

const TestAttempts = ({ testId }) => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTestForAccess, setSelectedTestForAccess] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, attemptId: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAttempts();
  }, [testId]);

  const handleDeleteAttempt = async () => {
    try {
      setDeleting(true);
      const { data } = await axios.delete(
        `${backendUrl}/test/attempts/${deleteModal.attemptId}`,
        { headers: { Authorization: `Bearer ${companyToken}` } }
      );
      if (data.success) {
        toast.success('Test attempt deleted successfully');
        await loadAttempts();
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

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const url = testId
        ? `${backendUrl}/test/attempts/${testId}`
        : `${backendUrl}/test/attempts`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${companyToken}` }
      });

      if (response.data.success) {
        setAttempts(response.data.attempts || []);
      } else {
        toast.error(response.data.message || 'Failed to load test attempts');
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
      toast.error('Failed to load test attempts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (attempt) => {
    if (attempt.status === 'completed' || attempt.status === 'evaluated') {
      const passed = attempt.percentage >= attempt.testId?.passingMarks;
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
          Started
        </span>
      );
    }
  };

  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch =
      attempt.candidateId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.testId?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const isCompleted = attempt.status === 'completed' || attempt.status === 'evaluated';
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'passed' && isCompleted && attempt.percentage >= attempt.testId?.passingMarks) ||
      (filterStatus === 'failed' && isCompleted && attempt.percentage < attempt.testId?.passingMarks) ||
      (filterStatus === 'in-progress' && attempt.status === 'in-progress');

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by candidate name or test title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Attempts</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Total Attempts</div>
          <div className="text-2xl font-bold text-gray-900">{attempts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Passed</div>
          <div className="text-2xl font-bold text-green-600">
            {attempts.filter(a => (a.status === 'completed' || a.status === 'evaluated') && a.percentage >= (a.testId?.passingMarks || 0)).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {attempts.filter(a => (a.status === 'completed' || a.status === 'evaluated') && a.percentage < (a.testId?.passingMarks || 0)).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {attempts.filter(a => a.status === 'in-progress').length}
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredAttempts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test attempts found</h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Candidates haven\'t attempted any tests yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {attempt.candidateId?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {attempt.candidateId?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attempt.candidateId?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.testId?.title || 'Unknown Test'}
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
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {attempt.endTime
                          ? `${Math.round((new Date(attempt.endTime) - new Date(attempt.startTime)) / 60000)} min`
                          : 'In progress'
                        }
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
                        {(attempt.status === 'completed' || attempt.status === 'evaluated') && (
                          <button
                            onClick={() => navigate(`/recruiter/test-results/${attempt._id}`)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        )}
                        {attempt.testId && (
                          <button
                            onClick={() => {
                              const testId = typeof attempt.testId === 'object' ? attempt.testId._id : attempt.testId;
                              setSelectedTestForAccess(testId);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Manage test access and reattempts"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
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

      {/* Access Control Modal */}
      {selectedTestForAccess && (
        <TestAccessControl
          testId={selectedTestForAccess}
          onClose={() => setSelectedTestForAccess(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Test Attempt</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this test attempt? All responses and results will be permanently removed.
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
  );
};

export default TestAttempts;
