import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { Clock, Award, Play, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TestsPage = () => {
    const navigate = useNavigate();
    const { backendUrl, userToken } = useContext(AppContext);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/test/available`,
                { headers: { token: userToken } }
            );
            if (data.success) {
                setTests(data.tests || []);
            }
        } catch (error) {
            console.error('Error loading tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId) => {
        navigate(`/take-test/${testId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Tests</h1>
                    <p className="text-gray-600">Take tests for job applications and skill assessment</p>
                </div>

                {tests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No tests available</h3>
                        <p className="text-gray-600">Check back later for new tests</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.map((test) => (
                            <div key={test._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-semibold text-gray-800 flex-1">{test.title}</h3>
                                    {test.hasReattemptPermission && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                            <RefreshCw size={12} />
                                            Special Access
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                                
                                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Clock size={16} />
                                        <span>{test.duration} min</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Award size={16} />
                                        <span>{test.totalMarks} marks</span>
                                    </div>
                                </div>

                                {/* Attempt Information */}
                                {test.hasAttempted && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Attempts:</span>
                                            <span className="font-semibold text-gray-800">
                                                {test.completedAttempts} / {test.maxAttempts}
                                            </span>
                                        </div>
                                        {test.attemptsRemaining > 0 && (
                                            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle size={12} />
                                                {test.attemptsRemaining} {test.attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleStartTest(test._id)}
                                    disabled={test.attemptsRemaining === 0}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                        test.attemptsRemaining === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    <Play size={18} />
                                    {test.hasAttempted && test.canRetake ? 'Retake Test' : 'Start Test'}
                                </button>

                                {test.attemptsRemaining === 0 && (
                                    <p className="mt-2 text-xs text-center text-red-600">
                                        Maximum attempts reached
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestsPage;