import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertCircle, Copy, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MCQTestTaking = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, userToken } = useContext(AppContext);

  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [codeTheme, setCodeTheme] = useState('dark');
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [isTestActive, setIsTestActive] = useState(true);

  // Load test data
  useEffect(() => {
    loadTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  // Timer
  useEffect(() => {
    if (!testData || timeLeft <= 0 || !testStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testData, timeLeft, testStarted]);

  const handleStartTest = () => {
    if (!agreedToGuidelines) {
      toast.error('Please agree to the guidelines to start the test');
      return;
    }
    setShowGuidelinesModal(false);
    setTestStarted(true);
    setTestStartTime(new Date());

    // Hide chat agent during test
    const chatWidget = document.querySelector('.chat-widget');
    if (chatWidget) chatWidget.style.display = 'none';

    toast.success('Test started! Good luck!');
  };

  // Add warning and check for auto-submit
  const addWarning = (reason) => {
    const newWarningCount = warningCount + 1;
    setWarningCount(newWarningCount);

    if (newWarningCount >= 3) {
      toast.error('3 warnings reached! Test will be auto-submitted.', {
        duration: 3000,
        style: {
          background: '#DC2626',
          color: '#FFFFFF',
          fontWeight: 'bold'
        }
      });
      setTimeout(() => {
        submitTest();
      }, 2000);
    } else {
      toast.error(`Warning ${newWarningCount}/3: ${reason}`, {
        duration: 2000,
        style: {
          background: '#EF4444',
          color: '#FFFFFF'
        }
      });
    }
  };

  // Comprehensive security measures
  useEffect(() => {
    if (!testStarted) return;

    // Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      addWarning('Right-click is disabled');
    };

    // Prevent copy, cut, paste
    const handleCopyCutPaste = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 'C' || e.key === 'X' || e.key === 'V')) {
        e.preventDefault();
        addWarning('Copy/Cut/Paste is disabled');
      }
    };

    // Detect tab switching and window blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning('Tab switching detected');
      }
    };

    const handleWindowBlur = () => {
      addWarning('Leaving test window detected');
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable Windows key
      if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        addWarning('Windows key press detected');
      }

      // Disable Alt+Tab, Alt+F4, Ctrl+W, F5, Ctrl+R, etc.
      if (
        (e.altKey && (e.key === 'Tab' || e.key === 'F4')) ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W' || e.key === 'r' || e.key === 'R')) ||
        e.key === 'F5' ||
        e.key === 'F11' ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        addWarning('Keyboard shortcut disabled');
      }

      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (Developer tools)
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        addWarning('Developer tools access blocked');
      }
    };

    // Add all event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleCopyCutPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleCopyCutPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [testStarted, warningCount]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/test/start-test/${testId}`,
        { headers: { token: userToken } }
      );

      if (data.success) {
        setTestData(data.test);
        setQuestions(data.questions);
        setAttemptId(data.attemptId);
        // Don't start timer yet - wait for guidelines confirmation
        setTimeLeft(data.test.duration * 60); // Convert minutes to seconds
      } else {
        toast.error(data.message);
        navigate('/candidate-dashboard/tests');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error(error.response?.data?.message || 'Failed to load test');
      navigate('/candidate-dashboard/tests');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleMarkForReview = (questionId) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleClear = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion._id];
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSaveAndNext = () => {
    handleNext();
  };

  const handleMarkForReviewAndNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    handleMarkForReview(currentQuestion._id);
    handleNext();
  };

  const handleSaveAndMarkForReview = () => {
    const currentQuestion = questions[currentQuestionIndex];
    handleMarkForReview(currentQuestion._id);
  };

  const getQuestionStatus = (questionId) => {
    const isAnswered = Object.prototype.hasOwnProperty.call(answers, questionId);
    const isMarked = markedForReview.has(questionId);

    if (isAnswered && isMarked) return 'answered-marked'; // Green with purple border
    if (isAnswered) return 'answered'; // Green
    if (isMarked) return 'marked'; // Purple
    if (questions[currentQuestionIndex]?._id === questionId) return 'current'; // Blue
    return 'not-visited'; // Gray
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'marked': return 'bg-purple-500 text-white';
      case 'answered-marked': return 'bg-green-500 text-white border-4 border-purple-500';
      case 'current': return 'bg-blue-500 text-white';
      case 'not-answered': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Copy code to clipboard
  const copyToClipboard = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      toast.success('Code copied to clipboard!', { duration: 2000 });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  // Detect programming language from code
  const detectLanguage = (code) => {
    if (!code) return 'javascript';

    if (code.includes('public class') || code.includes('System.out')) return 'java';
    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('#include') || code.includes('std::')) return 'cpp';
    if (code.includes('func ') && code.includes('package')) return 'go';
    if (code.includes('SELECT') || code.includes('FROM')) return 'sql';
    if (code.includes('const ') || code.includes('let ') || code.includes('=>')) return 'javascript';

    return 'javascript';
  };

  // Modern Code Block Component
  const CodeBlock = ({ code, language = 'auto', id, showLineNumbers = true }) => {
    // Handle null, undefined, or empty code
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return null;
    }

    const detectedLang = language === 'auto' ? detectLanguage(code) : language;
    const theme = codeTheme === 'dark' ? vscDarkPlus : oneLight;
    const isCopied = copiedCode === id;

    return (
      <div className="relative group my-4 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
        {/* Header with macOS-style buttons */}
        <div className={`flex items-center justify-between px-4 py-2.5 ${codeTheme === 'dark' ? 'bg-[#252526] border-b border-gray-700' : 'bg-gray-100 border-b border-gray-300'
          }`}>
          <div className="flex items-center gap-3">
            {/* macOS-style window buttons */}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wide ${codeTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {detectedLang}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={() => copyToClipboard(code, id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${codeTheme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                } ${isCopied ? 'ring-2 ring-green-400' : ''}`}
              title="Copy code"
            >
              {isCopied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span className="text-green-500 font-semibold">Copy</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Display */}
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={detectedLang}
            style={theme}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              fontSize: '0.875rem',
              lineHeight: '1.7',
              borderRadius: 0,
              background: codeTheme === 'dark' ? '#1e1e1e' : '#fafafa'
            }}
            lineNumberStyle={{
              minWidth: '2.5em',
              paddingRight: '1em',
              color: codeTheme === 'dark' ? '#6B7280' : '#9CA3AF',
              userSelect: 'none',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  };

  const handleAutoSubmit = async () => {
    toast.error('Time is up! Submitting test automatically.');
    await submitTest();
  };

  const submitTest = async () => {
    try {
      const endTime = new Date();
      const timeTakenInMinutes = testStartTime
        ? Math.round((endTime - testStartTime) / (1000 * 60))
        : 0;

      const responses = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
        isMarkedForReview: markedForReview.has(questionId)
      }));

      const { data } = await axios.post(
        `${backendUrl}/test/submit-test`,
        {
          attemptId,
          responses,
          timeTaken: timeTakenInMinutes
        },
        { headers: { token: userToken } }
      );

      if (data.success) {
        // Re-enable chat widget after test submission
        const chatWidget = document.querySelector('.chat-widget');
        if (chatWidget) chatWidget.style.display = 'block';

        toast.success('Test submitted successfully!');
        navigate(`/test-results/${attemptId}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error(error.response?.data?.message || 'Failed to submit test');
    }
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = questions.length - answeredCount;
  const markedCount = markedForReview.size;
  const notVisitedCount = questions.filter((q, idx) => idx > currentQuestionIndex && !Object.prototype.hasOwnProperty.call(answers, q._id)).length;

  // Show guidelines modal before starting test
  if (showGuidelinesModal && testData) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{testData.title}</h2>
            <p className="text-gray-600">{testData.description}</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="text-blue-500 mt-1 mr-3" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Information</h3>
                <div className="text-blue-800 space-y-2">
                  <p><strong>Duration:</strong> {testData.duration} minutes</p>
                  <p><strong>Total Questions:</strong> {questions.length}</p>
                  <p><strong>Total Marks:</strong> {testData.totalMarks}</p>
                  <p><strong>Passing Marks:</strong> {testData.passingMarks}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="text-orange-500" />
              Test Guidelines & Rules
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {testData.instructions ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">{testData.instructions}</div>
                </div>
              ) : (
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Once you start the test, the timer will begin and cannot be paused.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>The test will auto-submit when time runs out.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>You can navigate between questions using Next/Back buttons.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Mark questions for review if you want to revisit them later.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Strict Security Rules */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6\">
            <div className="flex items-start">
              <AlertCircle className="text-red-600 mt-1 mr-3" size={20} />
              <div className="text-red-900">
                <p className="font-bold mb-2 text-lg">🔒 STRICT SECURITY RULES</p>
                <ul className="text-sm space-y-2">
                  <li className="font-semibold">• ⚠️ 3 WARNINGS = AUTO-SUBMIT (Test ends immediately)</li>
                  <li>• ❌ Right-clicking is DISABLED</li>
                  <li>• ❌ Copy, Cut, Paste operations are BLOCKED</li>
                  <li>• ❌ Switching tabs or minimizing window triggers warning</li>
                  <li>• ❌ Keyboard shortcuts (Alt+Tab, Ctrl+W, F5, etc.) are DISABLED</li>
                  <li>• ❌ Developer tools (F12, Ctrl+Shift+I) access is BLOCKED</li>
                  <li>• ❌ Screenshot/Screen recording attempts are MONITORED</li>
                  <li>• ✅ Stay focused on the test window at all times</li>
                  <li className="font-bold text-red-700 mt-2">⚡ Any violation will add a warning to your test!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-600 mt-1 mr-3" size={20} />
              <div className="text-yellow-800">
                <p className="font-semibold mb-1">Before You Begin:</p>
                <ul className="text-sm space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Close all unnecessary applications and browser tabs</li>
                  <li>• Make sure you have {testData.duration} minutes available</li>
                  <li>• Keep your browser window maximized and focused</li>
                  <li>• Do not attempt any prohibited actions mentioned above</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={agreedToGuidelines}
                onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-gray-700 font-medium">
                I have read and understood all the guidelines and rules. I am ready to start the test.
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/candidate-dashboard/tests')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTest}
              disabled={!agreedToGuidelines}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-3 shadow-xl relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold tracking-wide">{testData?.title || 'TEST'}</h1>
            <div className="flex items-center gap-3 text-[10px] text-blue-100 mt-0.5">
              <span>Username: {testData?.candidateName || 'Candidate'}</span>
              <span>Subject: {testData?.category || testData?.description || 'Testing...'}</span>
            </div>
          </div>

          {/* Warning Counter */}
          {testStarted && warningCount > 0 && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs ${warningCount >= 3 ? 'bg-red-600 blink-red' : 'bg-red-500 blink-warning'
                }`}>
                <AlertCircle size={14} className="animate-pulse" />
                <span>⚠️ WARNINGS: {warningCount}/3</span>
                {warningCount >= 3 && <span className="ml-1.5">AUTO-SUBMITTING...</span>}
              </div>
            </div>
          )}

          <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
            <p className="text-[10px] text-blue-100">Remaining Time:</p>
            <div className="text-xl font-mono font-bold tracking-wider">
              {formatTime(timeLeft)}
            </div>
            <p className="text-[10px] text-blue-100 mt-0.5">Question {currentQuestionIndex + 1} Marks {currentQuestion?.marks || 1}</p>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto p-2 md:p-2 flex gap-2 overflow-hidden" style={{ height: 'calc(100vh - 90px)' }}>
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Question and Options Area */}
          <div className="bg-white rounded-xl shadow-lg overflow-y-auto custom-scrollbar mb-2 border border-gray-200" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            <div className="p-2">
              <div className="mb-2">
                <div className="flex items-start justify-between mb-1.5 pb-1.5 border-b border-gray-200">
                  <h2 className="text-sm font-bold text-gray-900">
                    Question: {currentQuestionIndex + 1}
                  </h2>
                  <span className="text-[10px] font-semibold text-white bg-blue-600 px-1.5 py-0.5 rounded-full">Marks {currentQuestion?.marks || 1}</span>
                </div>
                <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {currentQuestion?.questionText}
                </p>

                {/* Question Image */}
                {currentQuestion?.questionImage && (
                  <div className="mt-2">
                    <img
                      src={currentQuestion.questionImage}
                      alt="Question"
                      className="max-w-full max-h-64 rounded-lg border border-gray-300 shadow-sm"
                    />
                  </div>
                )}

                {/* Question Code */}
                {currentQuestion?.questionCode && currentQuestion.questionCode.trim() !== '' && (
                  <CodeBlock
                    code={currentQuestion.questionCode}
                    language="auto"
                    id={`question-${currentQuestion._id}`}
                    showLineNumbers={true}
                  />
                )}
              </div>

              {/* Options */}
              <div className="space-y-1.5">
                {currentQuestion?.options?.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start p-2 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion._id] === idx
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      checked={answers[currentQuestion._id] === idx}
                      onChange={() => handleAnswerSelect(currentQuestion._id, idx)}
                      className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-bold text-gray-700 mr-1.5 text-xs">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option.type === 'code' && option.code && option.code.trim() !== '' ? (
                        <div className="mt-2">
                          <CodeBlock
                            code={option.code}
                            language="auto"
                            id={`option-${currentQuestion._id}-${idx}`}
                            showLineNumbers={false}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-800 text-xs">{option.text || ''}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <button
                onClick={handleBack}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">BACK</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
              >
                <span className="hidden sm:inline">NEXT</span>
                <ChevronRight size={14} />
              </button>

              <button
                onClick={handleSaveAndNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
              >
                SAVE & NEXT
              </button>

              <button
                onClick={handleClear}
                className="px-2 py-1 border border-orange-500 text-orange-600 rounded-md hover:bg-orange-50 transition-colors text-xs"
              >
                CLEAR
              </button>

              <button
                onClick={handleSaveAndMarkForReview}
                className="px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-[10px]"
              >
                SAVE & MARK
              </button>

              <button
                onClick={handleMarkForReviewAndNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-[10px]"
              >
                MARK & NEXT
              </button>

              <button
                onClick={handleSubmit}
                className="px-3 py-1 text-xs bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors shadow-md"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Question Navigation */}
        <div className="w-64 hidden lg:block">
          <div className="bg-white rounded-xl shadow-lg p-3 sticky top-4 border border-gray-200">
            <h3 className="text-sm font-bold text-center mb-2 text-gray-900 pb-1.5 border-b border-gray-200">
              {testData?.title?.split(' ')[0]?.toUpperCase() || 'TEST'}
            </h3>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q._id);
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`aspect-square rounded-lg font-bold text-xs transition-all shadow-sm hover:shadow-md ${getStatusColor(status)}`}>

                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-gray-500 flex items-center justify-center text-white font-bold shadow-sm text-[10px]">
                  {notVisitedCount}
                </div>
                <span className="text-gray-700 font-medium">Not Visited</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold shadow-sm text-[10px]">
                  {notAnsweredCount}
                </div>
                <span className="text-gray-700 font-medium">Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold shadow-sm text-[10px]">
                  {answeredCount}
                </div>
                <span className="text-gray-700 font-medium">Answered</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold shadow-sm text-[10px]">
                  {markedCount}
                </div>
                <span className="text-gray-700 font-medium">Marked for Review</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-green-500 border-2 border-purple-500 flex items-center justify-center text-white font-bold shadow-sm text-[10px]">
                  0
                </div>
                <span className="text-gray-700 font-medium">Ans & Marked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-md w-full transform transition-all">
            <div className="text-center mb-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 shadow-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-0.5">Confirm Test Submission</h3>
              <p className="text-xs text-gray-600">Review your answers before final submission</p>
            </div>

            {/* Test Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 mb-3 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Test Summary</h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2.5 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-0.5">Total Questions</p>
                  <p className="text-xl font-bold text-gray-900">{questions.length}</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-0.5">Answered</p>
                  <p className="text-xl font-bold text-green-600">{answeredCount}</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-0.5">Not Answered</p>
                  <p className="text-xl font-bold text-red-600">{notAnsweredCount}</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600 mb-0.5">Marked</p>
                  <p className="text-xl font-bold text-purple-600">{markedCount}</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-2.5 mt-3 rounded">
                <p className="text-xs text-blue-900">
                  <strong>Time Remaining:</strong> {formatTime(timeLeft)}
                </p>
              </div>
            </div>

            {notAnsweredCount > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 mb-2 rounded">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-600 mt-0.5 mr-1.5" size={16} />
                  <div className="text-yellow-900 text-xs">
                    <p className="font-bold">Warning!</p>
                    <p>You have {notAnsweredCount} unanswered question{notAnsweredCount > 1 ? 's' : ''}. These will be marked as incorrect.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-2 mb-3">
              <p className="text-xs text-red-900 text-center">
                <strong>⚠️ Important:</strong> Once submitted, you cannot make any changes to your answers.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
              >
                Review Answers
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  submitTest();
                }}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQTestTaking;
