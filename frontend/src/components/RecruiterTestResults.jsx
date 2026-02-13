import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Calendar, User, Award, FileText, ChevronDown, ChevronUp, Mail, Phone, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RecruiterTestResults = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, companyToken } = useContext(AppContext);
    const [result, setResult] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());
    const [evaluating, setEvaluating] = useState(null);
    const [evaluationData, setEvaluationData] = useState({});

    useEffect(() => {
        loadResults();
    }, [attemptId]);

    const loadResults = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/test/attempts/${attemptId}/details`,
                { headers: { Authorization: `Bearer ${companyToken}` } }
            );
            if (data.success) {
                setResult(data.attempt);
                setResponses(data.responses || []);
            }
        } catch (error) {
            console.error('Error loading results:', error);
            toast.error('Failed to load test results');
        } finally {
            setLoading(false);
        }
    };

    const toggleQuestion = (questionId) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId);
        } else {
            newExpanded.add(questionId);
        }
        setExpandedQuestions(newExpanded);
    };

    const handleEvaluate = (responseId, marks, comment) => {
        setEvaluationData({
            ...evaluationData,
            [responseId]: { marks, comment }
        });
    };

    const saveEvaluation = async (responseId) => {
        try {
            const data = evaluationData[responseId];
            await axios.put(
                `${backendUrl}/test/responses/${responseId}/evaluate`,
                {
                    marksObtained: data.marks,
                    reviewComment: data.comment,
                    isCorrect: data.marks > 0
                },
                { headers: { Authorization: `Bearer ${companyToken}` } }
            );
            toast.success('Evaluation saved successfully');
            setEvaluating(null);
            // Reload to get updated scores and status
            await loadResults();
        } catch (error) {
            console.error('Error saving evaluation:', error);
            toast.error('Failed to save evaluation');
        }
    };

    const getAnswerStatus = (response) => {
        if (response.isCorrect) {
            return <span className="text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle size={16} /> Correct
            </span>;
        } else {
            return <span className="text-red-600 font-semibold flex items-center gap-1">
                <XCircle size={16} /> Incorrect
            </span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading test results...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Results not found</h2>
                    <button
                        onClick={() => navigate('/dashboard/test-attempts')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Test Attempts
                    </button>
                </div>
            </div>
        );
    }

    const isPassed = result.percentage >= (result.testId?.passingMarks || 40);
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const incorrectAnswers = responses.filter(r => !r.isCorrect).length;

    // Calculate time taken
    const timeTakenMinutes = result.timeSpent || 0;
    const hours = Math.floor(timeTakenMinutes / 60);
    const minutes = timeTakenMinutes % 60;
    const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard/test-attempts')}
                        className="text-blue-600 hover:text-blue-700 font-medium mb-4"
                    >
                        ← Back to Test Attempts
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Test Evaluation</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Candidate Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Candidate Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User size={32} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {result.candidateId?.name || 'Unknown Candidate'}
                                    </h3>
                                    <p className="text-sm text-gray-600">Candidate</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail size={16} />
                                    <span>{result.candidateId?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={16} />
                                    <span>Submitted: {new Date(result.endTime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock size={16} />
                                    <span>Time Taken: {timeDisplay}</span>
                                </div>
                            </div>
                        </div>

                        {/* Test Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h4 className="font-bold text-gray-900 mb-3">Test Information</h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Test:</span>
                                    <p className="font-medium text-gray-900">{result.testId?.title}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span>
                                    <p className={`font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPassed ? 'Passed' : 'Failed'}
                                    </p>
                                </div>
                                {result.jobId && (
                                    <div>
                                        <span className="text-gray-600">Job:</span>
                                        <p className="font-medium text-gray-900">{result.jobId.title}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Score Summary */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h4 className="font-bold text-gray-900 mb-4">Score Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Score:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {result.totalScore || 0}/{result.testId?.totalMarks || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Percentage:</span>
                                    <span className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
                                        {result.percentage || 0}%
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-green-600">Correct: {correctAnswers}</span>
                                        <span className="text-red-600">Incorrect: {incorrectAnswers}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${(correctAnswers / responses.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Answers */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText size={24} />
                                Detailed Answer Review
                            </h3>

                            <div className="space-y-4">
                                {responses.map((response, index) => (
                                    <div key={response._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div
                                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => toggleQuestion(response.questionId?._id)}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <span className="text-lg font-semibold text-gray-700">Q{index + 1}.</span>
                                                <span className="text-gray-800 flex-1 line-clamp-1">
                                                    {response.questionId?.questionText}
                                                </span>
                                                {getAnswerStatus(response)}
                                                <span className="text-sm font-medium text-gray-600">
                                                    {response.marksObtained || 0}/{response.questionId?.marks || 0}
                                                </span>
                                            </div>
                                            {expandedQuestions.has(response.questionId?._id) ? (
                                                <ChevronUp size={20} className="text-gray-600" />
                                            ) : (
                                                <ChevronDown size={20} className="text-gray-600" />
                                            )}
                                        </div>

                                        {expandedQuestions.has(response.questionId?._id) && (
                                            <div className="p-6 bg-white border-t border-gray-200">
                                                <div className="mb-4">
                                                    <p className="text-gray-800 font-medium mb-2">Question:</p>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{response.questionId?.questionText}</p>

                                                    {response.questionId?.questionImage && (
                                                        <img
                                                            src={response.questionId.questionImage}
                                                            alt="Question"
                                                            className="mt-3 max-w-md rounded-lg border border-gray-300"
                                                        />
                                                    )}

                                                    {response.questionId?.questionCode && (
                                                        <pre className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                                                            <code className="text-sm font-mono">{response.questionId.questionCode}</code>
                                                        </pre>
                                                    )}
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                    <div className={`p-4 rounded-lg border-2 ${response.isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                                                        <p className="text-sm font-semibold text-gray-700 mb-2">Candidate's Answer:</p>
                                                        {response.questionId?.options?.[response.selectedOption] ? (
                                                            response.questionId.options[response.selectedOption].type === 'code' ? (
                                                                <pre className="bg-gray-900 text-gray-100 p-2 rounded text-sm overflow-x-auto">
                                                                    <code className="font-mono">{response.questionId.options[response.selectedOption].code}</code>
                                                                </pre>
                                                            ) : (
                                                                <p className="text-gray-800">{response.questionId.options[response.selectedOption].text}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-gray-500 italic">Not answered</p>
                                                        )}
                                                    </div>

                                                    <div className="p-4 rounded-lg border-2 bg-green-50 border-green-300">
                                                        <p className="text-sm font-semibold text-gray-700 mb-2">Correct Answer:</p>
                                                        {response.questionId?.options?.map((opt, idx) =>
                                                            opt.isCorrect && (
                                                                opt.type === 'code' ? (
                                                                    <pre key={idx} className="bg-gray-900 text-gray-100 p-2 rounded text-sm overflow-x-auto">
                                                                        <code className="font-mono">{opt.code}</code>
                                                                    </pre>
                                                                ) : (
                                                                    <p key={idx} className="text-gray-800">{opt.text}</p>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Evaluation Section */}
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    {evaluating === response._id ? (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Marks Obtained (Max: {response.questionId?.marks})
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    max={response.questionId?.marks}
                                                                    min="0"
                                                                    step="0.5"
                                                                    defaultValue={response.marksObtained}
                                                                    onChange={(e) => handleEvaluate(response._id, parseFloat(e.target.value), evaluationData[response._id]?.comment || '')}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Feedback/Comments
                                                                </label>
                                                                <textarea
                                                                    rows="3"
                                                                    defaultValue={response.reviewComment}
                                                                    onChange={(e) => handleEvaluate(response._id, evaluationData[response._id]?.marks || 0, e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Add feedback for the candidate..."
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => saveEvaluation(response._id)}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    Save Evaluation
                                                                </button>
                                                                <button
                                                                    onClick={() => setEvaluating(null)}
                                                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {response.reviewComment ? (
                                                                <div>
                                                                    <p className="text-sm font-semibold text-blue-900 mb-1">Feedback:</p>
                                                                    <p className="text-blue-800 mb-2">{response.reviewComment}</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-gray-600 mb-2">No feedback provided</p>
                                                            )}
                                                            <button
                                                                onClick={() => setEvaluating(response._id)}
                                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                            >
                                                                <Edit size={14} />
                                                                Edit Evaluation
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterTestResults;
