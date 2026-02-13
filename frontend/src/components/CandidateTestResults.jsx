import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Calendar, User, Award, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CandidateTestResults = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, userToken } = useContext(AppContext);
    const [result, setResult] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());

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
                    <p className="text-gray-600">Loading your results...</p>
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
                        onClick={() => navigate('/candidate-dashboard/tests')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Tests
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className={`${isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-600'} p-8 text-white`}>
                        <div className="text-center">
                            {isPassed ? (
                                <Award className="w-20 h-20 mx-auto mb-4 animate-bounce" />
                            ) : (
                                <FileText className="w-20 h-20 mx-auto mb-4" />
                            )}
                            <h1 className="text-4xl font-bold mb-2">
                                {isPassed ? '🎉 Congratulations!' : 'Test Completed'}
                            </h1>
                            <p className="text-lg text-white/90">
                                {isPassed ? 'You have successfully passed the test!' : 'Keep practicing and try again!'}
                            </p>
                        </div>
                    </div>

                    {/* Test Info */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">{result.testId?.title || 'Test'}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} />
                                <span>Completed: {new Date(result.endTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={16} />
                                <span>At: {new Date(result.endTime).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={16} />
                                <span>Duration: {timeDisplay}</span>
                            </div>
                        </div>
                    </div>

                    {/* Score Cards */}
                    <div className="p-6 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                                <div className="text-3xl font-bold text-blue-600">{result.totalScore || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">Your Score</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                                <div className="text-3xl font-bold text-purple-600">{result.testId?.totalMarks || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Marks</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                                <div className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
                                    {result.percentage || 0}%
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Percentage</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                                <div className="text-3xl font-bold text-indigo-600">{timeDisplay}</div>
                                <div className="text-sm text-gray-600 mt-1">Time Taken</div>
                            </div>
                        </div>

                        {/* Pass/Fail Status */}
                        <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isPassed ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle size={24} />
                                            <span className="font-semibold text-lg">Passed</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <XCircle size={24} />
                                            <span className="font-semibold text-lg">Not Passed</span>
                                        </div>
                                    )}
                                    <span className="text-gray-600">
                                        (Passing: {result.testId?.passingMarks || 40}%)
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">Correct Answers</div>
                                    <div className="text-2xl font-bold text-green-600">{correctAnswers}/{responses.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={24} />
                        Answer Sheet
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
                                        <span className="text-sm text-gray-600">
                                            {response.marksObtained || 0}/{response.questionId?.marks || 0} marks
                                        </span>
                                    </div>
                                    {expandedQuestions.has(response.questionId?._id) ? (
                                        <ChevronUp size={20} className="text-gray-600" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-600" />
                                    )}
                                </div>

                                {expandedQuestions.has(response.questionId?._id) && (
                                    <div className="p-4 bg-white border-t border-gray-200">
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

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className={`p-4 rounded-lg border-2 ${response.isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
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

                                        {response.reviewComment && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Feedback:</p>
                                                <p className="text-blue-800">{response.reviewComment}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/candidate-dashboard/tests')}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                    >
                        Back to Tests
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-md"
                    >
                        Print Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CandidateTestResults;
