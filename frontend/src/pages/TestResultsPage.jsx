import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { CheckCircle, XCircle, Award } from 'lucide-react';

const TestResultsPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userToken } = useContext(AppContext);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/test/attempts/${attemptId}/details`,
                { headers: { token: userToken } }
            );
            if (data.success) {
                setResult(data.attempt);
            }
        } catch (error) {
            console.error('Error loading results:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Results not found</h2>
                    <button
                        onClick={() => navigate('/candidate-dashboard/tests')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        {result.isPassed ? (
                            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        ) : (
                            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                        )}
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {result.isPassed ? 'Congratulations!' : 'Test Completed'}
                        </h1>
                        <p className="text-gray-600">
                            {result.isPassed ? 'You passed the test!' : 'Keep practicing!'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-3xl font-bold text-blue-600">{result.totalScore || 0}</p>
                            <p className="text-sm text-gray-600">Score</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-3xl font-bold text-purple-600">{result.testId?.totalMarks || 0}</p>
                            <p className="text-sm text-gray-600">Total Marks</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-3xl font-bold text-green-600">{result.percentage || 0}%</p>
                            <p className="text-sm text-gray-600">Percentage</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-3xl font-bold text-orange-600">{result.timeSpent || 0} min</p>
                            <p className="text-sm text-gray-600">Time Taken</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/candidate-dashboard/tests')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Tests
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestResultsPage;