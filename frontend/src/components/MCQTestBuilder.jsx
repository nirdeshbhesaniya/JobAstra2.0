import React, { useState, useContext, useEffect } from 'react';
import { Plus, Trash2, Save, X, Copy, Settings, Image, Code, Upload, Users } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const MCQTestBuilder = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const navigate = useNavigate();
  const { testId } = useParams(); // Get testId from URL for edit mode
  const isEditMode = !!testId;

  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 60,
    passingMarks: 40,
    instructions: 'Read all questions carefully before answering.',
    totalMarks: 0
  });

  const [accessControl, setAccessControl] = useState({
    restrictAccess: false,
    allowedCandidates: []
  });

  const [candidates, setCandidates] = useState([]);
  const [showCandidateSelector, setShowCandidateSelector] = useState(false);
  const [searchCandidate, setSearchCandidate] = useState('');

  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      questionText: '',
      questionImage: null,
      questionCode: '',
      options: [
        { text: '', code: '', type: 'text' },
        { text: '', code: '', type: 'text' },
        { text: '', code: '', type: 'text' },
        { text: '', code: '', type: 'text' }
      ],
      correctAnswer: -1,
      marks: 1
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [fetchingTest, setFetchingTest] = useState(false);

  // Fetch candidates
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Fetch existing test data in edit mode
  useEffect(() => {
    if (isEditMode && testId) {
      fetchTestData();
    }
  }, [testId, isEditMode]);

  const fetchCandidates = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/user/all-users`,
        { headers: { token: companyToken } }
      );
      if (data.success) {
        setCandidates(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchTestData = async () => {
    setFetchingTest(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/test/${testId}/details`,
        { headers: { token: companyToken } }
      );

      if (data.success) {
        const test = data.test;

        // Set test metadata
        setTestData({
          title: test.title || '',
          description: test.description || '',
          duration: test.duration || 60,
          passingMarks: test.passingMarks || 40,
          instructions: test.instructions || '',
          totalMarks: test.totalMarks || 0
        });

        // Set access control
        if (test.accessControl) {
          setAccessControl({
            restrictAccess: test.accessControl.restrictAccess || false,
            allowedCandidates: test.accessControl.allowedCandidates || []
          });
        }

        // Set questions if they exist
        if (test.sections && test.sections.length > 0) {
          const section = test.sections[0];
          if (section.questions && section.questions.length > 0) {
            const formattedQuestions = section.questions.map((q, idx) => ({
              id: q._id || Date.now() + idx,
              questionText: q.questionText || '',
              questionImage: q.questionImage || null,
              questionCode: q.questionCode || '',
              options: q.options && q.options.length > 0 ? q.options.map(opt => ({
                text: opt.text || '',
                code: opt.code || '',
                type: opt.type || 'text'
              })) : [
                { text: '', code: '', type: 'text' },
                { text: '', code: '', type: 'text' },
                { text: '', code: '', type: 'text' },
                { text: '', code: '', type: 'text' }
              ],
              correctAnswer: q.options ? q.options.findIndex(opt => opt.isCorrect) : -1,
              marks: q.marks || 1
            }));
            setQuestions(formattedQuestions);
          }
        }

        toast.success('Test data loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error('Failed to load test data');
      navigate('/dashboard/tests');
    } finally {
      setFetchingTest(false);
    }
  };

  // Add new question
  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      questionText: '',
      questionImage: null,
      questionCode: '',
      options: [
        { text: '', code: '', type: 'text' },
        { text: '', code: '', type: 'text' },
        { text: '', code: '', type: 'text' },
        { text: '', code: '', type: 'text' }
      ],
      correctAnswer: -1,
      marks: 1
    }]);
  };

  // Remove question
  const removeQuestion = (id) => {
    if (questions.length === 1) {
      toast.error('At least one question is required');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Update question text
  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // Update option text
  const updateOption = (questionId, optionIndex, field, value) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? {
          ...q, options: q.options.map((opt, idx) =>
            idx === optionIndex ? { ...opt, [field]: value } : opt
          )
        }
        : q
    ));
  };

  // Set correct answer
  const setCorrectAnswer = (questionId, optionIndex) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, correctAnswer: optionIndex } : q
    ));
  };

  // Add option to question
  const addOption = (questionId) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, options: [...q.options, { text: '', code: '', type: 'text' }] } : q
    ));
  };

  // Remove option from question
  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        return {
          ...q,
          options: q.options.filter((_, idx) => idx !== optionIndex),
          correctAnswer: q.correctAnswer === optionIndex ? null :
            q.correctAnswer > optionIndex ? q.correctAnswer - 1 : q.correctAnswer
        };
      }
      return q;
    }));
  };

  // Handle image upload for question
  const handleImageUpload = async (questionId, file) => {
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQuestions(questions.map(q =>
        q.id === questionId ? { ...q, questionImage: reader.result } : q
      ));
      toast.success('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Remove image from question
  const removeImage = (questionId) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, questionImage: null } : q
    ));
  };

  // Toggle option type between text and code
  const toggleOptionType = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          type: newOptions[optionIndex].type === 'text' ? 'code' : 'text'
        };
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // Duplicate question
  const duplicateQuestion = (id) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      setQuestions([...questions, { ...question, id: Date.now() }]);
    }
  };

  // Handle candidate selection
  const toggleCandidateSelection = (candidateId) => {
    setAccessControl(prev => ({
      ...prev,
      allowedCandidates: prev.allowedCandidates.includes(candidateId)
        ? prev.allowedCandidates.filter(id => id !== candidateId)
        : [...prev.allowedCandidates, candidateId]
    }));
  };

  const selectAllCandidates = () => {
    setAccessControl(prev => ({
      ...prev,
      allowedCandidates: candidates.map(c => c._id)
    }));
  };

  const deselectAllCandidates = () => {
    setAccessControl(prev => ({
      ...prev,
      allowedCandidates: []
    }));
  };

  // Calculate total marks
  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0);
  };

  // Validate test
  const validateTest = () => {
    if (!testData.title.trim()) {
      toast.error('Test title is required');
      return false;
    }

    if (!testData.description.trim()) {
      toast.error('Test description is required');
      return false;
    }

    if (questions.length === 0) {
      toast.error('At least one question is required');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1}: Question text is required`);
        return false;
      }

      if (q.options.some(opt => opt.type === 'text' && !opt.text.trim() || opt.type === 'code' && !opt.code.trim())) {
        toast.error(`Question ${i + 1}: All options must be filled`);
        return false;
      }

      if (q.correctAnswer === -1) {
        toast.error(`Question ${i + 1}: Please select a correct answer`);
        return false;
      }

      if (!q.marks || q.marks <= 0) {
        toast.error(`Question ${i + 1}: Marks must be greater than 0`);
        return false;
      }
    }

    return true;
  };

  // Save test
  const saveTest = async () => {
    if (!validateTest()) return;

    setLoading(true);
    try {
      const totalMarks = calculateTotalMarks();

      const formattedQuestions = questions.map((q, index) => ({
        questionText: q.questionText,
        questionImage: q.questionImage || '',
        questionCode: q.questionCode || '',
        questionType: 'mcq',
        options: q.options.map((opt, idx) => ({
          text: opt.text || '',
          code: opt.code || '',
          type: opt.type || 'text',
          isCorrect: idx === q.correctAnswer
        })),
        marks: parseFloat(q.marks),
        order: index + 1
      }));

      const payload = {
        ...testData,
        totalMarks,
        questions: formattedQuestions,
        accessControl: {
          restrictAccess: accessControl.restrictAccess,
          allowedCandidates: accessControl.restrictAccess ? accessControl.allowedCandidates : []
        }
      };

      let response;
      if (isEditMode) {
        // Update existing test
        response = await axios.put(
          `${backendUrl}/test/${testId}`,
          payload,
          { headers: { token: companyToken } }
        );
      } else {
        // Create new test
        response = await axios.post(
          `${backendUrl}/test/create-test-with-questions`,
          payload,
          { headers: { token: companyToken } }
        );
      }

      const { data } = response;

      if (data.success) {
        toast.success(isEditMode ? 'Test updated successfully!' : 'Test created successfully!');
        navigate('/dashboard/tests');
      } else {
        toast.error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} test`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} test:`, error);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} test`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {fetchingTest ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test data...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {isEditMode ? 'Edit MCQ Test' : 'Create MCQ Test'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditMode ? 'Update your test details and questions' : 'Build your multiple choice question test'}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/tests')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
            </div>

            {/* Test Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Python Programming Test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={testData.duration}
                  onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={testData.description}
                  onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows="3"
                  placeholder="Brief description of the test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Marks (%) *
                </label>
                <input
                  type="number"
                  value={testData.passingMarks}
                  onChange={(e) => setTestData({ ...testData, passingMarks: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                  {calculateTotalMarks()}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={testData.instructions}
                  onChange={(e) => setTestData({ ...testData, instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows="2"
                  placeholder="Instructions for candidates"
                />
              </div>
              {/* Access Control Section */}
              <div className="md:col-span-2">
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Access Control</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Restrict test access to specific candidates
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accessControl.restrictAccess}
                        onChange={(e) => setAccessControl({ ...accessControl, restrictAccess: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Access Restriction</span>
                    </label>
                  </div>

                  {accessControl.restrictAccess && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Selected: {accessControl.allowedCandidates.length} candidate(s)
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllCandidates}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={deselectAllCandidates}
                            className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Clear All
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCandidateSelector(!showCandidateSelector)}
                            className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            {showCandidateSelector ? 'Hide' : 'Show'} Candidates
                          </button>
                        </div>
                      </div>

                      {showCandidateSelector && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={searchCandidate}
                            onChange={(e) => setSearchCandidate(e.target.value)}
                            placeholder="Search candidates by name or email..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm"
                          />
                          <div className="max-h-64 overflow-y-auto bg-white rounded-lg border border-gray-200">
                            {candidates
                              .filter(c =>
                                c.name.toLowerCase().includes(searchCandidate.toLowerCase()) ||
                                c.email.toLowerCase().includes(searchCandidate.toLowerCase())
                              )
                              .map(candidate => (
                                <label
                                  key={candidate._id}
                                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <input
                                    type="checkbox"
                                    checked={accessControl.allowedCandidates.includes(candidate._id)}
                                    onChange={() => toggleCandidateSelection(candidate._id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                                    <p className="text-xs text-gray-600">{candidate.email}</p>
                                  </div>
                                </label>
                              ))
                            }
                            {candidates.filter(c =>
                              c.name.toLowerCase().includes(searchCandidate.toLowerCase()) ||
                              c.email.toLowerCase().includes(searchCandidate.toLowerCase())
                            ).length === 0 && (
                                <p className="text-center text-sm text-gray-500 py-4">No candidates found</p>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {qIndex + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => duplicateQuestion(question.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicate Question"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    rows="3"
                    placeholder="Enter your question here..."
                  />

                  {/* Image Upload */}
                  <div className="mt-3 flex items-start gap-3">
                    <div className="flex-1">
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-fit">
                        <Image size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Upload Image (Optional)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(question.id, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {question.questionImage && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={question.questionImage}
                            alt="Question"
                            className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                          />
                          <button
                            onClick={() => removeImage(question.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Code Block */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code Block (Optional)
                    </label>
                    <textarea
                      value={question.questionCode}
                      onChange={(e) => updateQuestion(question.id, 'questionCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm bg-gray-50"
                      rows="4"
                      placeholder="Enter code snippet here (if applicable)..."
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Options * (Select the correct answer)
                  </label>
                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => setCorrectAnswer(question.id, optIndex)}
                            className="w-5 h-5 text-green-600 focus:ring-green-500 mt-2"
                          />
                          <span className="text-sm font-medium text-gray-600 w-6 mt-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <div className="flex-1">
                            {option.type === 'text' ? (
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => updateOption(question.id, optIndex, 'text', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              />
                            ) : (
                              <textarea
                                value={option.code}
                                onChange={(e) => updateOption(question.id, optIndex, 'code', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm bg-gray-50"
                                rows="3"
                                placeholder={`Code for option ${String.fromCharCode(65 + optIndex)}`}
                              />
                            )}
                          </div>
                          <button
                            onClick={() => toggleOptionType(question.id, optIndex)}
                            className={`p-2 rounded-lg transition-colors ${option.type === 'code'
                                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            title={option.type === 'code' ? 'Switch to Text' : 'Switch to Code'}
                          >
                            <Code size={18} />
                          </button>
                          {question.options.length > 2 && (
                            <button
                              onClick={() => removeOption(question.id, optIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {question.options.length < 6 && (
                    <button
                      onClick={() => addOption(question.id)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                      Add Option
                    </button>
                  )}
                </div>

                {/* Marks */}
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks *
                  </label>
                  <input
                    type="number"
                    value={question.marks}
                    onChange={(e) => updateQuestion(question.id, 'marks', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <div className="mt-6">
            <button
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors border-2 border-dashed border-blue-300"
            >
              <Plus size={20} />
              Add New Question
            </button>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Total Questions: {questions.length}</p>
              <p className="font-semibold">Total Marks: {calculateTotalMarks()}</p>
            </div>
            <button
              onClick={saveTest}
              disabled={loading || fetchingTest}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditMode ? 'Update Test' : 'Save Test'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQTestBuilder;
