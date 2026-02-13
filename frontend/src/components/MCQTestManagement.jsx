import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Clock, Award, Search, Filter } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MCQTestManagement = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, testId: null });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadTests();
  }, [filterStatus]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/test/company-tests?status=${filterStatus}`,
        { headers: { token: companyToken } }
      );

      if (data.success) {
        setTests(data.tests || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error(error.response?.data?.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    try {
      setActionLoading(testId);
      const { data } = await axios.delete(
        `${backendUrl}/test/delete-test/${testId}`,
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success('Test deleted successfully');
        await loadTests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error(error.response?.data?.message || 'Failed to delete test');
    } finally {
      setDeleteModal({ show: false, testId: null });
      setActionLoading(null);
    }
  };

  const toggleTestStatus = async (testId, currentStatus) => {
    try {
      setActionLoading(testId);
      const { data } = await axios.patch(
        `${backendUrl}/test/toggle-status/${testId}`,
        { isActive: !currentStatus },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(`Test ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await loadTests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error toggling test status:', error);
      toast.error(error.response?.data?.message || 'Failed to update test status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Test Management</h1>
              <p className="text-gray-600 mt-1">Create and manage your MCQ tests</p>
            </div>
            <button
              onClick={() => navigate('/create-mcq-test')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Create New Test
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Tests</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tests</p>
                <p className="text-3xl font-bold text-gray-800">{tests.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Award className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Tests</p>
                <p className="text-3xl font-bold text-green-600">
                  {tests.filter(t => t.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Attempts</p>
                <p className="text-3xl font-bold text-purple-600">
                  {tests.reduce((sum, t) => sum + (t.totalAttempts || 0), 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Duration</p>
                <p className="text-3xl font-bold text-orange-600">
                  {tests.length > 0
                    ? Math.round(tests.reduce((sum, t) => sum + t.duration, 0) / tests.length)
                    : 0} min
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tests List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tests found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Create your first MCQ test to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/create-mcq-test')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create New Test
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTests.map((test) => (
              <div key={test._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{test.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{test.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${test.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {test.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{test.totalQuestions || 0}</p>
                      <p className="text-xs text-gray-600">Questions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{test.totalMarks || 0}</p>
                      <p className="text-xs text-gray-600">Total Marks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{test.duration} min</p>
                      <p className="text-xs text-gray-600">Duration</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/test-attempts/${test._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 font-semibold rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Users size={18} />
                      Attempts ({test.totalAttempts || 0})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/edit-mcq-test/${test._id}`)}
                      disabled={actionLoading === test._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleTestStatus(test._id, test.isActive)}
                      disabled={actionLoading === test._id}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${test.isActive
                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                    >
                      {actionLoading === test._id ? (
                        <span className="flex items-center gap-2 justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Loading...
                        </span>
                      ) : (
                        test.isActive ? 'Deactivate' : 'Activate'
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, testId: test._id })}
                      disabled={actionLoading === test._id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Test"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Test</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this test? This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, testId: null })}
                disabled={actionLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.testId)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQTestManagement;
