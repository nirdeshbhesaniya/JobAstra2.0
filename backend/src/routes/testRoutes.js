import express from 'express';
import {
    // Test Management
    createTest,
    createTestWithQuestions,
    getCompanyTests,
    getTestDetails,
    updateTest,
    deleteTest,

    // Section Management
    createTestSection,
    updateTestSection,
    deleteTestSection,

    // Question Management
    createQuestion,
    updateQuestion,
    deleteQuestion,

    // Test Taking
    getAvailableTests,
    startTestAttempt,
    startMCQTest,
    getTestForTaking,
    submitAnswer,
    submitTest,

    // Results & Evaluation
    getTestAttempts,
    getTestAttemptDetails,
    evaluateResponse,
    addTestEvaluation,
    getCandidateTestHistory,
    deleteTestAttempt,

    // Code Execution
    executeCode,

    // Access Control
    manageTestAccess,
    grantReattemptPermission,
    revokeReattemptPermission,
    getTestAccessDetails
} from '../controllers/testController.js';
import companyAuthMiddleware from '../middlewares/companyAuthMiddleware.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';
import flexibleAuthMiddleware from '../middlewares/flexibleAuthMiddleware.js';

const router = express.Router();

// ============ COMPANY/RECRUITER ROUTES (Test Management) ============

// Test CRUD operations
router.post('/create', companyAuthMiddleware, createTest);
router.post('/create-test-with-questions', companyAuthMiddleware, createTestWithQuestions);
router.get('/company-tests', companyAuthMiddleware, getCompanyTests);

// Test evaluation and results - MUST come before /:testId/details to avoid route conflict
router.get('/attempts', companyAuthMiddleware, getTestAttempts);
router.get('/attempts/:testId', companyAuthMiddleware, getTestAttempts);
router.get('/attempts/:attemptId/details', flexibleAuthMiddleware, getTestAttemptDetails);
router.delete('/attempts/:attemptId', flexibleAuthMiddleware, deleteTestAttempt);
router.put('/responses/:responseId/evaluate', companyAuthMiddleware, evaluateResponse);
router.put('/attempts/:attemptId/evaluate', companyAuthMiddleware, addTestEvaluation);

router.get('/:testId/details', companyAuthMiddleware, getTestDetails);
router.put('/:testId', companyAuthMiddleware, updateTest);
router.delete('/delete-test/:testId', companyAuthMiddleware, deleteTest);
router.patch('/toggle-status/:testId', companyAuthMiddleware, updateTest);

// Section management
router.post('/:testId/sections', companyAuthMiddleware, createTestSection);
router.put('/sections/:sectionId', companyAuthMiddleware, updateTestSection);
router.delete('/sections/:sectionId', companyAuthMiddleware, deleteTestSection);

// Question management
router.post('/sections/:sectionId/questions', companyAuthMiddleware, createQuestion);
router.put('/questions/:questionId', companyAuthMiddleware, updateQuestion);
router.delete('/questions/:questionId', companyAuthMiddleware, deleteQuestion);

// ============ TEST ACCESS CONTROL ROUTES ============

// Manage allowed candidates for a test
router.put('/:testId/access-control', companyAuthMiddleware, manageTestAccess);
router.get('/:testId/access-control', companyAuthMiddleware, getTestAccessDetails);

// Manage reattempt permissions
router.post('/:testId/reattempt-permission', companyAuthMiddleware, grantReattemptPermission);
router.delete('/:testId/reattempt-permission/:candidateId', companyAuthMiddleware, revokeReattemptPermission);

// ============ CANDIDATE/USER ROUTES (Test Taking) ============

// Available tests and taking tests
router.get('/available', userAuthMiddleware, getAvailableTests);
router.post('/:testId/start', userAuthMiddleware, startTestAttempt);
router.get('/start-test/:testId', userAuthMiddleware, startMCQTest);
router.get('/attempts/:attemptId/take', userAuthMiddleware, getTestForTaking);
router.put('/attempts/:attemptId/questions/:questionId/answer', userAuthMiddleware, submitAnswer);
router.post('/submit-test', userAuthMiddleware, submitTest);

// Candidate test history
router.get('/history', userAuthMiddleware, getCandidateTestHistory);

// ============ CODE EXECUTION ============
router.post('/execute-code', userAuthMiddleware, executeCode);

export default router;
