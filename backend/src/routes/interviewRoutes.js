import express from 'express';
import {
    scheduleInterview,
    getCandidateInterviews,
    getRecruiterInterviews,
    updateInterviewStatus,
    rescheduleInterview,
    cancelInterview,
    deleteInterview,
    getUpcomingInterviews
} from '../controllers/interviewController.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';
import companyAuthMiddleware from '../middlewares/companyAuthMiddleware.js';

const router = express.Router();

// Candidate routes (User authentication required)
router.get('/candidate', userAuthMiddleware, getCandidateInterviews);
router.delete('/candidate/:interviewId/cancel', userAuthMiddleware, cancelInterview);

// Recruiter routes (Company authentication required)
router.post('/schedule', companyAuthMiddleware, scheduleInterview);
router.get('/recruiter', companyAuthMiddleware, getRecruiterInterviews);
router.put('/status/:interviewId', companyAuthMiddleware, updateInterviewStatus);
router.delete('/recruiter/:interviewId/cancel', companyAuthMiddleware, cancelInterview);
router.delete('/delete/:interviewId', companyAuthMiddleware, deleteInterview);

// Shared routes (Both user and company can access)
router.put('/reschedule/:interviewId', (req, res, next) => {
    // Try user auth first, then company auth
    userAuthMiddleware(req, res, (err) => {
        if (err || !req.userData) {
            companyAuthMiddleware(req, res, next);
        } else {
            next();
        }
    });
}, rescheduleInterview);

router.delete('/cancel/:interviewId', (req, res, next) => {
    // Try user auth first, then company auth
    userAuthMiddleware(req, res, (err) => {
        if (err || !req.userData) {
            companyAuthMiddleware(req, res, next);
        } else {
            next();
        }
    });
}, cancelInterview);

router.get('/upcoming', (req, res, next) => {
    // Try user auth first, then company auth
    userAuthMiddleware(req, res, (err) => {
        if (err || !req.userData) {
            companyAuthMiddleware(req, res, next);
        } else {
            next();
        }
    });
}, getUpcomingInterviews);

export default router;
