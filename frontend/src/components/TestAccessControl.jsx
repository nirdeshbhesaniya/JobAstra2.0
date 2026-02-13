import React, { useState, useEffect } from 'react';
import { Users, Shield, RefreshCw, X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TestAccessControl = ({ testId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [accessControl, setAccessControl] = useState({
        restrictAccess: false,
        allowedCandidates: []
    });
    const [reattemptPermissions, setReattemptPermissions] = useState([]);
    const [allCandidates, setAllCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [reattemptCount, setReattemptCount] = useState(1);
    const [showAddCandidate, setShowAddCandidate] = useState(false);
    const [showAddReattempt, setShowAddReattempt] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        loadAccessControl();
        loadCandidates();
    }, [testId]);

    const loadAccessControl = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('companyToken');
            const { data } = await axios.get(
                `${backendUrl}/test/${testId}/access-control`,
                { headers: { token } }
            );

            if (data.success) {
                setAccessControl(data.accessControl);
                setReattemptPermissions(data.reattemptPermissions);
            }
        } catch (error) {
            console.error('Error loading access control:', error);
            toast.error(error.response?.data?.message || 'Failed to load access control');
        } finally {
            setLoading(false);
        }
    };

    const loadCandidates = async () => {
        try {
            const token = localStorage.getItem('companyToken');
            // Get all test attempts to find candidates
            const { data } = await axios.get(
                `${backendUrl}/test/attempts`,
                { headers: { token } }
            );

            if (data.success) {
                // Extract unique candidates from attempts
                const uniqueCandidates = [];
                const seenIds = new Set();
                data.attempts?.forEach(attempt => {
                    if (attempt.candidateId && !seenIds.has(attempt.candidateId._id)) {
                        seenIds.add(attempt.candidateId._id);
                        uniqueCandidates.push(attempt.candidateId);
                    }
                });
                setAllCandidates(uniqueCandidates);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    };

    const handleUpdateAccessControl = async () => {
        try {
            const token = localStorage.getItem('companyToken');
            const { data } = await axios.put(
                `${backendUrl}/test/${testId}/access-control`,
                accessControl,
                { headers: { token } }
            );

            if (data.success) {
                toast.success('Access control updated successfully');
                loadAccessControl();
            }
        } catch (error) {
            console.error('Error updating access control:', error);
            toast.error(error.response?.data?.message || 'Failed to update access control');
        }
    };

    const handleAddAllowedCandidate = (candidateId) => {
        if (candidateId && !accessControl.allowedCandidates.some(c => c._id === candidateId)) {
            setAccessControl({
                ...accessControl,
                allowedCandidates: [...accessControl.allowedCandidates, { _id: candidateId }]
            });
        }
        setSelectedCandidate('');
        setShowAddCandidate(false);
    };

    const handleRemoveAllowedCandidate = (candidateId) => {
        setAccessControl({
            ...accessControl,
            allowedCandidates: accessControl.allowedCandidates.filter(c => c._id !== candidateId)
        });
    };

    const handleGrantReattempt = async () => {
        if (!selectedCandidate || reattemptCount < 1) {
            toast.error('Please select a candidate and enter valid attempt count');
            return;
        }

        try {
            const token = localStorage.getItem('companyToken');
            const { data } = await axios.post(
                `${backendUrl}/test/${testId}/reattempt-permission`,
                { candidateId: selectedCandidate, allowedAttempts: reattemptCount },
                { headers: { token } }
            );

            if (data.success) {
                toast.success('Reattempt permission granted');
                loadAccessControl();
                setSelectedCandidate('');
                setReattemptCount(1);
                setShowAddReattempt(false);
            }
        } catch (error) {
            console.error('Error granting reattempt:', error);
            toast.error(error.response?.data?.message || 'Failed to grant reattempt');
        }
    };

    const handleRevokeReattempt = async (candidateId) => {
        try {
            const token = localStorage.getItem('companyToken');
            const { data } = await axios.delete(
                `${backendUrl}/test/${testId}/reattempt-permission/${candidateId}`,
                { headers: { token } }
            );

            if (data.success) {
                toast.success('Reattempt permission revoked');
                loadAccessControl();
            }
        } catch (error) {
            console.error('Error revoking reattempt:', error);
            toast.error(error.response?.data?.message || 'Failed to revoke reattempt');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading access control...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Test Access Control</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Access Restriction Section */}
                    <div className="bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-800">Candidate Access</h3>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm font-medium text-gray-700">Restrict Access</span>
                                <input
                                    type="checkbox"
                                    checked={accessControl.restrictAccess}
                                    onChange={(e) => setAccessControl({
                                        ...accessControl,
                                        restrictAccess: e.target.checked
                                    })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        </div>

                        {accessControl.restrictAccess && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-100 p-3 rounded">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Only candidates in the allowed list can attempt this test</span>
                                </div>

                                <div className="flex gap-2">
                                    {!showAddCandidate ? (
                                        <button
                                            onClick={() => setShowAddCandidate(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Candidate
                                        </button>
                                    ) : (
                                        <div className="flex gap-2 flex-1">
                                            <select
                                                value={selectedCandidate}
                                                onChange={(e) => setSelectedCandidate(e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select candidate...</option>
                                                {allCandidates.map(candidate => (
                                                    <option key={candidate._id} value={candidate._id}>
                                                        {candidate.name} ({candidate.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleAddAllowedCandidate(selectedCandidate)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setShowAddCandidate(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {accessControl.allowedCandidates.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="font-medium text-gray-700">Allowed Candidates:</h4>
                                        {accessControl.allowedCandidates.map(candidate => (
                                            <div
                                                key={candidate._id}
                                                className="flex items-center justify-between bg-white p-3 rounded-lg border"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-800">{candidate.name}</p>
                                                    <p className="text-sm text-gray-500">{candidate.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveAllowedCandidate(candidate._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={handleUpdateAccessControl}
                                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Save Access Control
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Reattempt Permissions Section */}
                    <div className="bg-green-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="w-6 h-6 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-800">Reattempt Permissions</h3>
                            </div>
                            {!showAddReattempt && (
                                <button
                                    onClick={() => setShowAddReattempt(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    Grant Permission
                                </button>
                            )}
                        </div>

                        {showAddReattempt && (
                            <div className="mb-4 p-4 bg-white rounded-lg border space-y-3">
                                <select
                                    value={selectedCandidate}
                                    onChange={(e) => setSelectedCandidate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select candidate...</option>
                                    {allCandidates.map(candidate => (
                                        <option key={candidate._id} value={candidate._id}>
                                            {candidate.name} ({candidate.email})
                                        </option>
                                    ))}
                                </select>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Allowed Attempts
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={reattemptCount}
                                        onChange={(e) => setReattemptCount(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleGrantReattempt}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Grant Permission
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddReattempt(false);
                                            setSelectedCandidate('');
                                            setReattemptCount(1);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {reattemptPermissions.length > 0 ? (
                            <div className="space-y-2">
                                {reattemptPermissions.map(permission => (
                                    <div
                                        key={permission.candidateId._id}
                                        className="flex items-center justify-between bg-white p-4 rounded-lg border"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{permission.candidateId.name}</p>
                                            <p className="text-sm text-gray-500">{permission.candidateId.email}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Attempts: <span className="font-medium">{permission.currentAttempts}</span> / <span className="font-medium">{permission.allowedAttempts}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRevokeReattempt(permission.candidateId._id)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Revoke
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No reattempt permissions granted</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestAccessControl;
