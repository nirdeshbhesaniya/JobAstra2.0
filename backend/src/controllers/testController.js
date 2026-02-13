import { Test, TestSection, Question, TestAttempt, TestResponse } from '../models/Test.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Helper function to calculate test score
const calculateTestScore = async (attemptId) => {
    const responses = await TestResponse.find({ attemptId }).populate('questionId');

    let totalMarks = 0;
    let obtainedMarks = 0;

    responses.forEach(response => {
        totalMarks += response.questionId.marks;
        obtainedMarks += response.marksObtained;
    });

    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

    return {
        totalScore: obtainedMarks,
        percentage,
        totalMarks
    };
};

// ============ TEST MANAGEMENT CONTROLLERS ============

// Create a new test
export const createTest = async (req, res) => {
    try {
        const { title, description, duration, passingMarks, instructions, jobId, allowRetake, maxAttempts, endDate } = req.body;
        const companyId = req.companyData._id;

        // Validate job if provided
        if (jobId) {
            const job = await Job.findOne({ _id: jobId, companyId });
            if (!job) {
                return res.status(404).json({ success: false, message: 'Job not found' });
            }
        }

        const test = new Test({
            title,
            description,
            companyId,
            jobId: jobId || null,
            duration,
            passingMarks,
            instructions,
            allowRetake,
            maxAttempts,
            endDate: endDate ? new Date(endDate) : null
        });

        await test.save();

        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            test
        });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create MCQ test with questions in one go
export const createTestWithQuestions = async (req, res) => {
    try {
        const { title, description, duration, passingMarks, instructions, totalMarks, questions, accessControl } = req.body;
        const companyId = req.companyData._id;

        // Create test
        const test = new Test({
            title,
            description,
            companyId,
            duration,
            passingMarks,
            totalMarks,
            instructions,
            isActive: true,
            accessControl: {
                restrictAccess: accessControl?.restrictAccess || false,
                allowedCandidates: accessControl?.allowedCandidates || []
            }
        });

        await test.save();

        // Create default section for MCQ questions
        const section = new TestSection({
            testId: test._id,
            title: 'MCQ Questions',
            description: 'Multiple Choice Questions',
            sectionType: 'technical',
            order: 1,
            marks: totalMarks
        });

        await section.save();

        // Add section to test
        test.sections.push(section._id);
        await test.save();

        // Create questions
        const createdQuestions = [];
        for (const q of questions) {
            const question = new Question({
                sectionId: section._id,
                questionText: q.questionText,
                questionImage: q.questionImage || '',
                questionCode: q.questionCode || '',
                questionType: q.questionType || 'mcq',
                options: q.options,
                marks: q.marks,
                order: q.order,
                difficulty: 'medium'
            });
            await question.save();
            createdQuestions.push(question._id);
        }

        // Add questions to section
        section.questions = createdQuestions;
        await section.save();

        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            test: {
                ...test.toObject(),
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        console.error('Error creating test with questions:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all tests for a company
export const getCompanyTests = async (req, res) => {
    try {
        const companyId = req.companyData._id;
        const { page = 1, limit = 100, status = 'all' } = req.query;

        let query = { companyId };
        if (status !== 'all') {
            query.isActive = status === 'active';
        }

        const tests = await Test.find(query)
            .populate('jobId', 'title')
            .populate({
                path: 'sections',
                populate: {
                    path: 'questions',
                    select: '_id marks'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        // Enrich tests with additional data
        const enrichedTests = await Promise.all(tests.map(async (test) => {
            // Count total questions
            let totalQuestions = 0;
            if (test.sections && test.sections.length > 0) {
                test.sections.forEach(section => {
                    if (section.questions) {
                        totalQuestions += section.questions.length;
                    }
                });
            }

            // Count total attempts
            const totalAttempts = await TestAttempt.countDocuments({ testId: test._id });

            return {
                ...test,
                totalQuestions,
                totalAttempts
            };
        }));

        const total = await Test.countDocuments(query);

        res.json({
            success: true,
            tests: enrichedTests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTests: total
            }
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get test details
export const getTestDetails = async (req, res) => {
    try {
        const { testId } = req.params;
        const companyId = req.companyData._id;

        const test = await Test.findOne({ _id: testId, companyId })
            .populate('jobId', 'title')
            .populate({
                path: 'sections',
                populate: {
                    path: 'questions'
                    // Include all question fields for editing, including questionCode
                    // correctAnswer and explanation are needed for editing
                }
            });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        res.json({ success: true, test });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update test
export const updateTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const companyId = req.companyData._id;
        const { title, description, duration, passingMarks, instructions, totalMarks, questions, isActive, accessControl } = req.body;

        // Find test
        const test = await Test.findOne({ _id: testId, companyId });
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Update test metadata
        test.title = title || test.title;
        test.description = description || test.description;
        test.duration = duration || test.duration;
        test.passingMarks = passingMarks || test.passingMarks;
        test.instructions = instructions || test.instructions;
        test.totalMarks = totalMarks || test.totalMarks;

        // Update isActive field if provided
        if (typeof isActive !== 'undefined') {
            test.isActive = isActive;
        }

        // Update access control if provided
        if (accessControl) {
            test.accessControl = {
                restrictAccess: accessControl.restrictAccess || false,
                allowedCandidates: accessControl.allowedCandidates || []
            };
        }

        await test.save();

        // Update questions if provided
        if (questions && questions.length > 0) {
            // Get the first section (MCQ questions section)
            const section = await TestSection.findOne({ testId: test._id });

            if (section) {
                // Delete old questions
                await Question.deleteMany({ sectionId: section._id });

                // Create new questions
                const createdQuestions = [];
                for (const q of questions) {
                    const question = new Question({
                        sectionId: section._id,
                        questionText: q.questionText,
                        questionImage: q.questionImage || '',
                        questionCode: q.questionCode || '',
                        questionType: q.questionType || 'mcq',
                        options: q.options,
                        marks: q.marks,
                        order: q.order,
                        difficulty: 'medium'
                    });
                    await question.save();
                    createdQuestions.push(question._id);
                }

                // Update section with new questions
                section.questions = createdQuestions;
                section.marks = totalMarks;
                await section.save();
            }
        }

        res.json({
            success: true,
            message: 'Test updated successfully',
            test
        });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete test
export const deleteTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const companyId = req.companyData._id;

        // Find the test first
        const test = await Test.findOne({ _id: testId, companyId });
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Check if test has any attempts and is active
        const attemptCount = await TestAttempt.countDocuments({ testId });
        if (attemptCount > 0 && test.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete active test with existing attempts. Deactivate first.'
            });
        }

        // Delete the test
        await Test.findByIdAndDelete(testId);

        // Delete associated sections and questions
        const sections = await TestSection.find({ testId });
        const sectionIds = sections.map(s => s._id);

        await Question.deleteMany({ sectionId: { $in: sectionIds } });
        await TestSection.deleteMany({ testId });

        // Delete all test attempts and responses if inactive
        if (!test.isActive && attemptCount > 0) {
            const attempts = await TestAttempt.find({ testId });
            const attemptIds = attempts.map(a => a._id);
            await TestResponse.deleteMany({ attemptId: { $in: attemptIds } });
            await TestAttempt.deleteMany({ testId });
        }

        res.json({
            success: true,
            message: 'Test deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ SECTION MANAGEMENT CONTROLLERS ============

// Create test section
export const createTestSection = async (req, res) => {
    try {
        const { testId } = req.params;
        const { title, description, sectionType, timeLimit, order } = req.body;
        const companyId = req.companyData._id;

        // Verify test ownership
        const test = await Test.findOne({ _id: testId, companyId });
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        const section = new TestSection({
            testId,
            title,
            description,
            sectionType,
            timeLimit,
            order
        });

        await section.save();

        // Add section to test
        test.sections.push(section._id);
        await test.save();

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            section
        });
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update test section
export const updateTestSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const updates = req.body;
        const companyId = req.companyData._id;

        // Verify section ownership through test
        const section = await TestSection.findById(sectionId).populate('testId');
        if (!section || section.testId.companyId.toString() !== companyId) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        const updatedSection = await TestSection.findByIdAndUpdate(
            sectionId,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Section updated successfully',
            section: updatedSection
        });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete test section
export const deleteTestSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const companyId = req.companyData._id;

        // Verify section ownership through test
        const section = await TestSection.findById(sectionId).populate('testId');
        if (!section || section.testId.companyId.toString() !== companyId) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        // Delete questions in this section
        await Question.deleteMany({ sectionId });

        // Remove section from test
        await Test.findByIdAndUpdate(
            section.testId._id,
            { $pull: { sections: sectionId } }
        );

        // Delete section
        await TestSection.findByIdAndDelete(sectionId);

        res.json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ QUESTION MANAGEMENT CONTROLLERS ============

// Create question
export const createQuestion = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const questionData = req.body;
        const companyId = req.companyData._id;

        // Verify section ownership
        const section = await TestSection.findById(sectionId).populate('testId');
        if (!section || section.testId.companyId.toString() !== companyId) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        const question = new Question({
            sectionId,
            ...questionData
        });

        await question.save();

        // Add question to section and update section marks
        section.questions.push(question._id);
        section.marks += question.marks;
        await section.save();

        // Update test total marks
        const test = await Test.findById(section.testId._id);
        test.totalMarks += question.marks;
        await test.save();

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            question
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update question
export const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const updates = req.body;
        const companyId = req.companyData._id;

        // Verify question ownership
        const question = await Question.findById(questionId)
            .populate({
                path: 'sectionId',
                populate: { path: 'testId' }
            });

        if (!question || question.sectionId.testId.companyId.toString() !== companyId) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const oldMarks = question.marks;
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            updates,
            { new: true, runValidators: true }
        );

        // Update marks if changed
        if (updates.marks && updates.marks !== oldMarks) {
            const marksDifference = updates.marks - oldMarks;

            // Update section marks
            await TestSection.findByIdAndUpdate(
                question.sectionId._id,
                { $inc: { marks: marksDifference } }
            );

            // Update test total marks
            await Test.findByIdAndUpdate(
                question.sectionId.testId._id,
                { $inc: { totalMarks: marksDifference } }
            );
        }

        res.json({
            success: true,
            message: 'Question updated successfully',
            question: updatedQuestion
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete question
export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const companyId = req.companyData._id;

        // Verify question ownership
        const question = await Question.findById(questionId)
            .populate({
                path: 'sectionId',
                populate: { path: 'testId' }
            });

        if (!question || question.sectionId.testId.companyId.toString() !== companyId) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Update section marks and remove question reference
        await TestSection.findByIdAndUpdate(
            question.sectionId._id,
            {
                $pull: { questions: questionId },
                $inc: { marks: -question.marks }
            }
        );

        // Update test total marks
        await Test.findByIdAndUpdate(
            question.sectionId.testId._id,
            { $inc: { totalMarks: -question.marks } }
        );

        // Delete question
        await Question.findByIdAndDelete(questionId);

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ TEST TAKING CONTROLLERS ============

// Get available tests for candidate
export const getAvailableTests = async (req, res) => {
    try {
        const candidateId = req.userData._id;
        const { jobId } = req.query;

        let query = {
            isActive: true,
            $or: [
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        };

        if (jobId) {
            query.jobId = jobId;
        }

        const tests = await Test.find(query)
            .populate('companyId', 'name image')
            .populate('jobId', 'title')
            .select('-sections'); // Don't include sections in list view

        // Check which tests the candidate has already attempted
        const testIds = tests.map(t => t._id);
        const attempts = await TestAttempt.find({
            candidateId,
            testId: { $in: testIds }
        }).select('testId status attemptNumber');

        const testsWithAttempts = tests.map(test => {
            const userAttempts = attempts.filter(a => a.testId.toString() === test._id.toString());
            const completedAttempts = userAttempts.filter(a => a.status === 'completed').length;

            // Check access control
            let hasAccess = true;
            if (test.accessControl && test.accessControl.restrictAccess) {
                hasAccess = test.accessControl.allowedCandidates.some(
                    id => id.toString() === candidateId.toString()
                );
            }

            // Check for custom reattempt permission
            const reattemptPermission = test.reattemptPermissions?.find(
                p => p.candidateId.toString() === candidateId.toString()
            );

            const maxAllowedAttempts = reattemptPermission
                ? reattemptPermission.allowedAttempts
                : test.maxAttempts;

            const attemptsRemaining = maxAllowedAttempts - completedAttempts;

            return {
                ...test.toObject(),
                hasAttempted: userAttempts.length > 0,
                completedAttempts,
                maxAttempts: maxAllowedAttempts,
                canRetake: (test.allowRetake || reattemptPermission) && completedAttempts < maxAllowedAttempts,
                attemptsRemaining,
                hasAccess,
                hasReattemptPermission: !!reattemptPermission
            };
        });

        // Filter out tests without access (unless they have reattempt permission which implies access)
        const accessibleTests = testsWithAttempts.filter(test =>
            test.hasAccess || test.hasReattemptPermission
        );

        res.json({
            success: true,
            tests: accessibleTests
        });
    } catch (error) {
        console.error('Error fetching available tests:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Start test attempt
export const startTestAttempt = async (req, res) => {
    try {
        const { testId } = req.params;
        const candidateId = req.userData._id;
        const { jobId } = req.body;

        // Verify test exists and is active
        const test = await Test.findOne({
            _id: testId,
            isActive: true,
            $or: [
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not available' });
        }

        // Check for custom reattempt permission first
        const reattemptPermission = test.reattemptPermissions.find(
            p => p.candidateId.toString() === candidateId.toString()
        );

        // Check if access is restricted and if candidate is allowed
        // Skip access check if candidate has reattempt permission (implies they should have access)
        if (test.accessControl && test.accessControl.restrictAccess && !reattemptPermission) {
            const isAllowed = test.accessControl.allowedCandidates.some(
                id => id.toString() === candidateId.toString()
            );
            if (!isAllowed) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to attempt this test'
                });
            }
        }

        // Check attempt limits
        const existingAttempts = await TestAttempt.find({
            candidateId,
            testId,
            status: 'completed'
        });

        const maxAllowedAttempts = reattemptPermission
            ? reattemptPermission.allowedAttempts
            : test.maxAttempts;

        if (existingAttempts.length >= maxAllowedAttempts) {
            return res.status(400).json({
                success: false,
                message: `Maximum attempts reached for this test (${maxAllowedAttempts} attempts allowed)`
            });
        }

        // Check for any in-progress attempt
        const inProgressAttempt = await TestAttempt.findOne({
            candidateId,
            testId,
            status: 'in-progress'
        });

        if (inProgressAttempt) {
            return res.json({
                success: true,
                message: 'Resuming existing attempt',
                attempt: inProgressAttempt
            });
        }

        // Create new attempt
        const attempt = new TestAttempt({
            testId,
            candidateId,
            jobId,
            attemptNumber: existingAttempts.length + 1
        });

        await attempt.save();

        res.status(201).json({
            success: true,
            message: 'Test attempt started',
            attempt
        });
    } catch (error) {
        console.error('Error starting test attempt:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get test for taking (with questions but without answers)
export const getTestForTaking = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const candidateId = req.userData._id;

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            candidateId,
            status: 'in-progress'
        }).populate({
            path: 'testId',
            populate: {
                path: 'sections',
                populate: {
                    path: 'questions',
                    select: '-correctAnswer -explanation -testCases' // Hide answers and test cases
                }
            }
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Test attempt not found' });
        }

        // Check if test has expired
        const timeElapsed = (new Date() - attempt.startTime) / (1000 * 60); // in minutes
        if (timeElapsed > attempt.testId.duration) {
            attempt.status = 'expired';
            await attempt.save();
            return res.status(400).json({ success: false, message: 'Test time has expired' });
        }

        // Get existing responses for this attempt
        const responses = await TestResponse.find({ attemptId }).select('questionId candidateAnswer');

        res.json({
            success: true,
            attempt,
            test: attempt.testId,
            responses,
            timeRemaining: Math.max(0, attempt.testId.duration - timeElapsed)
        });
    } catch (error) {
        console.error('Error fetching test for taking:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Start MCQ test - simplified version
export const startMCQTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const candidateId = req.userData._id;

        // Get candidate details
        const candidate = await User.findById(candidateId).select('name email');

        // Get test details with questions
        const test = await Test.findById(testId)
            .populate({
                path: 'sections',
                populate: {
                    path: 'questions',
                    select: 'questionText questionType questionImage questionCode options marks order'
                }
            });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        if (!test.isActive) {
            return res.status(400).json({ success: false, message: 'Test is not active' });
        }

        // Check if test has access restrictions
        if (test.accessControl && test.accessControl.restrictAccess) {
            const isAllowed = test.accessControl.allowedCandidates.some(
                id => id.toString() === candidateId.toString()
            );

            if (!isAllowed) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this test. Please contact the recruiter.'
                });
            }
        }

        // Check for existing attempts - only count completed/submitted attempts
        const existingAttempts = await TestAttempt.find({
            testId,
            candidateId,
            status: { $in: ['completed', 'evaluated'] }
        });

        // Check for special reattempt permission for this candidate
        const reattemptPermission = test.reattemptPermissions?.find(
            p => p.candidateId.toString() === candidateId.toString()
        );

        // Determine maximum allowed attempts (special permission overrides default)
        const maxAllowedAttempts = reattemptPermission
            ? reattemptPermission.allowedAttempts
            : test.maxAttempts;

        // Check if maximum attempts reached (only count completed attempts)
        if (existingAttempts.length >= maxAllowedAttempts) {
            return res.status(400).json({
                success: false,
                message: `Maximum attempts reached (${existingAttempts.length}/${maxAllowedAttempts})`
            });
        }

        // Delete any abandoned in-progress attempts for this test
        await TestAttempt.deleteMany({
            testId,
            candidateId,
            status: 'in-progress'
        });

        // Create new attempt
        const attempt = new TestAttempt({
            testId,
            candidateId,
            attemptNumber: existingAttempts.length + 1,
            status: 'in-progress',
            startTime: new Date()
        });

        await attempt.save();

        // Flatten questions from all sections
        const questions = [];
        test.sections.forEach(section => {
            section.questions.forEach(q => {
                questions.push({
                    _id: q._id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    questionImage: q.questionImage || '',
                    questionCode: q.questionCode || '',
                    options: q.options.map(opt => ({
                        text: opt.text || '',
                        code: opt.code || '',
                        type: opt.type || 'text'
                    })),
                    marks: q.marks,
                    order: q.order
                });
            });
        });

        res.json({
            success: true,
            attemptId: attempt._id,
            test: {
                _id: test._id,
                title: test.title,
                description: test.description,
                duration: test.duration,
                totalMarks: test.totalMarks,
                instructions: test.instructions,
                candidateName: candidate?.name || 'Candidate',
                category: test.category
            },
            questions
        });
    } catch (error) {
        console.error('Error starting MCQ test:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Submit answer for a question
export const submitAnswer = async (req, res) => {
    try {
        const { attemptId, questionId } = req.params;
        const { answer, timeSpent } = req.body;
        const candidateId = req.userData._id;

        // Verify attempt ownership
        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            candidateId,
            status: 'in-progress'
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Test attempt not found' });
        }

        // Get question details
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Check if response already exists
        let response = await TestResponse.findOne({ attemptId, questionId });

        if (response) {
            // Update existing response
            response.candidateAnswer = answer;
            response.timeSpent = timeSpent;
        } else {
            // Create new response
            response = new TestResponse({
                attemptId,
                questionId,
                candidateAnswer: answer,
                timeSpent
            });
        }

        // Auto-evaluate if possible (for MCQ, True/False, etc.)
        if (question.questionType === 'mcq' || question.questionType === 'true-false') {
            const correctOption = question.options.find(opt => opt.isCorrect);
            response.isCorrect = answer === correctOption?.text;
            response.marksObtained = response.isCorrect ? question.marks : 0;
        } else if (question.questionType === 'multiple-select') {
            const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.text);
            const candidateAnswers = Array.isArray(answer) ? answer : [answer];

            // Check if all correct options are selected and no incorrect ones
            const isExactMatch = correctOptions.length === candidateAnswers.length &&
                correctOptions.every(opt => candidateAnswers.includes(opt));

            response.isCorrect = isExactMatch;
            response.marksObtained = response.isCorrect ? question.marks : 0;
        }
        // For other types (essay, coding, short-answer), manual evaluation is needed

        await response.save();

        res.json({
            success: true,
            message: 'Answer submitted successfully',
            response: {
                questionId: response.questionId,
                candidateAnswer: response.candidateAnswer,
                timeSpent: response.timeSpent
            }
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Submit complete test
export const submitTest = async (req, res) => {
    try {
        const { attemptId, responses, timeTaken } = req.body;
        const candidateId = req.userData._id;

        const attempt = await TestAttempt.findOne({
            _id: attemptId,
            candidateId
        }).populate('testId');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Test attempt not found' });
        }

        let totalScore = 0;
        let totalMarks = 0;

        // Process each response
        for (const resp of responses) {
            const question = await Question.findById(resp.questionId);
            if (!question) continue;

            totalMarks += question.marks;

            // Check if answer is correct
            const correctOption = question.options.find(opt => opt.isCorrect);
            const isCorrect = correctOption && question.options[resp.selectedOption]?.text === correctOption.text;

            if (isCorrect) {
                totalScore += question.marks;
            }

            // Save response
            const testResponse = new TestResponse({
                attemptId,
                questionId: resp.questionId,
                candidateAnswer: question.options[resp.selectedOption]?.text || '',
                isCorrect,
                marksObtained: isCorrect ? question.marks : 0,
                isMarkedForReview: resp.isMarkedForReview || false
            });

            await testResponse.save();
        }

        // Calculate percentage
        const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

        // Update attempt
        attempt.endTime = new Date();
        attempt.status = 'completed';
        attempt.totalScore = totalScore;
        attempt.percentage = percentage;
        attempt.isPassed = percentage >= attempt.testId.passingMarks;

        // Use timeTaken from frontend if provided, otherwise calculate from timestamps
        attempt.timeSpent = timeTaken || Math.round((attempt.endTime - attempt.startTime) / (1000 * 60)); // in minutes

        await attempt.save();

        res.json({
            success: true,
            message: 'Test submitted successfully',
            result: {
                totalScore,
                totalMarks,
                percentage,
                isPassed: attempt.isPassed,
                attemptId: attempt._id
            }
        });
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ============ TEST RESULTS & EVALUATION CONTROLLERS ============

// Get test attempts for company (for evaluation)
export const getTestAttempts = async (req, res) => {
    try {
        const companyId = req.companyData._id;
        const { status = 'all', page = 1, limit = 10 } = req.query;
        // testId can come from URL params or query params
        const testId = req.params.testId || req.query.testId;

        let query = {};

        // Get tests belonging to this company
        const companyTests = await Test.find({ companyId }).select('_id');
        const testIds = companyTests.map(t => t._id);
        query.testId = { $in: testIds };

        if (testId) {
            query.testId = testId;
        }

        if (status !== 'all') {
            query.status = status;
        }

        const attempts = await TestAttempt.find(query)
            .populate('candidateId', 'name email')
            .populate('testId', 'title totalMarks passingMarks')
            .populate('jobId', 'title')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await TestAttempt.countDocuments(query);

        res.json({
            success: true,
            attempts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalAttempts: total
            }
        });
    } catch (error) {
        console.error('Error fetching test attempts:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get detailed test attempt for evaluation
export const getTestAttemptDetails = async (req, res) => {
    try {
        const { attemptId } = req.params;

        // Check if request is from company or user
        const isCompany = !!req.companyData;
        const isUser = !!req.userData;

        const attempt = await TestAttempt.findById(attemptId)
            .populate('candidateId', 'name email')
            .populate({
                path: 'testId',
                populate: {
                    path: 'sections',
                    populate: {
                        path: 'questions'
                    }
                }
            })
            .populate('jobId', 'title');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Test attempt not found' });
        }

        // Verify access rights
        if (isCompany && attempt.testId.companyId.toString() !== req.companyData._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (isUser && attempt.candidateId._id.toString() !== req.userData._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get all responses for this attempt
        const responses = await TestResponse.find({ attemptId })
            .populate('questionId');

        res.json({
            success: true,
            attempt,
            responses
        });
    } catch (error) {
        console.error('Error fetching test attempt details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Evaluate manual questions (essay, coding, short-answer)
export const evaluateResponse = async (req, res) => {
    try {
        const { responseId } = req.params;
        const { marksObtained, reviewComment, isCorrect } = req.body;
        const companyId = req.companyData._id;

        // Verify response belongs to company's test
        const response = await TestResponse.findById(responseId)
            .populate({
                path: 'attemptId',
                populate: {
                    path: 'testId'
                }
            });

        if (!response || response.attemptId.testId.companyId.toString() !== companyId) {
            return res.status(404).json({ success: false, message: 'Response not found' });
        }

        // Update response
        response.marksObtained = marksObtained;
        response.reviewComment = reviewComment;
        response.isCorrect = isCorrect;
        await response.save();

        // Recalculate attempt score
        const scoreData = await calculateTestScore(response.attemptId._id);
        const attempt = response.attemptId;
        const test = attempt.testId;

        // Calculate if passed based on percentage
        const isPassed = scoreData.percentage >= test.passingMarks;

        // Update attempt with new scores
        await TestAttempt.findByIdAndUpdate(attempt._id, {
            totalScore: scoreData.totalScore,
            percentage: scoreData.percentage,
            isPassed: isPassed,
            status: 'evaluated'
        });

        res.json({
            success: true,
            message: 'Response evaluated successfully',
            response
        });
    } catch (error) {
        console.error('Error evaluating response:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete test attempt (for candidates)
export const deleteTestAttempt = async (req, res) => {
    try {
        const { attemptId } = req.params;

        // Check if request is from company or user
        const isCompany = !!req.companyData;
        const isUser = !!req.userData;

        const attempt = await TestAttempt.findById(attemptId)
            .populate('testId');

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Test attempt not found' });
        }

        // Verify access rights
        if (isCompany && attempt.testId.companyId.toString() !== req.companyData._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (isUser && attempt.candidateId.toString() !== req.userData._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Delete all responses for this attempt
        await TestResponse.deleteMany({ attemptId });

        // Delete the attempt
        await TestAttempt.findByIdAndDelete(attemptId);

        res.json({
            success: true,
            message: 'Test attempt deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting test attempt:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add overall evaluation to test attempt
export const addTestEvaluation = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { comments, rating } = req.body;
        const companyId = req.companyData._id;

        const attempt = await TestAttempt.findById(attemptId).populate('testId');

        if (!attempt || attempt.testId.companyId.toString() !== companyId) {
            return res.status(404).json({ success: false, message: 'Test attempt not found' });
        }

        attempt.evaluation = {
            evaluatedBy: companyId,
            evaluatedAt: new Date(),
            comments,
            rating
        };

        await attempt.save();

        res.json({
            success: true,
            message: 'Evaluation added successfully',
            evaluation: attempt.evaluation
        });
    } catch (error) {
        console.error('Error adding evaluation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get candidate's test history
export const getCandidateTestHistory = async (req, res) => {
    try {
        const candidateId = req.userData._id;
        const { page = 1, limit = 10 } = req.query;

        const attempts = await TestAttempt.find({ candidateId })
            .populate('testId', 'title totalMarks passingMarks')
            .populate('jobId', 'title')
            .populate({
                path: 'testId',
                populate: {
                    path: 'companyId',
                    select: 'name image'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await TestAttempt.countDocuments({ candidateId });

        res.json({
            success: true,
            attempts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalAttempts: total
            }
        });
    } catch (error) {
        console.error('Error fetching candidate test history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ CODE EXECUTION CONTROLLER ============

/**
 * Execute code submitted by candidate
 * This is a simplified implementation - in production, use sandboxed containers
 */
export const executeCode = async (req, res) => {
    try {
        const { code, language, testCases = [] } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Code and language are required'
            });
        }

        // For security, in production you should:
        // 1. Use Docker containers or VMs for isolation
        // 2. Implement time limits
        // 3. Resource limits (CPU, memory)
        // 4. Validate code for malicious patterns

        let output = '';
        let executionSuccess = true;

        // Simple JavaScript execution (for demo purposes)
        // In production, use proper code execution services like Judge0, Sphere Engine, etc.
        if (language === 'javascript') {
            try {
                // Create a safe execution context
                const logs = [];
                const consoleLog = (...args) => {
                    logs.push(args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' '));
                };

                // Execute code with test cases
                if (testCases.length > 0) {
                    testCases.forEach((testCase, index) => {
                        try {
                            logs.push(`\n--- Test Case ${index + 1} ---`);
                            logs.push(`Input: ${JSON.stringify(testCase.input)}`);

                            // Create function from code
                            const func = new Function('input', 'console', `
                                ${code}
                                return typeof solution === 'function' ? solution(input) : null;
                            `);

                            const result = func(testCase.input, { log: consoleLog });
                            logs.push(`Output: ${JSON.stringify(result)}`);
                            logs.push(`Expected: ${JSON.stringify(testCase.expectedOutput)}`);

                            const passed = JSON.stringify(result) === JSON.stringify(testCase.expectedOutput);
                            logs.push(`Status: ${passed ? '✓ PASSED' : '✗ FAILED'}`);
                        } catch (err) {
                            logs.push(`Error: ${err.message}`);
                            executionSuccess = false;
                        }
                    });
                } else {
                    // Run code without test cases
                    const func = new Function('console', code);
                    func({ log: consoleLog });
                }

                output = logs.join('\n');
            } catch (error) {
                output = `Execution Error: ${error.message}`;
                executionSuccess = false;
            }
        } else {
            // For other languages, return a message to use external service
            output = `Code execution for ${language} requires external execution service.\n`;
            output += `In production, integrate with Judge0, Sphere Engine, or similar services.`;
            executionSuccess = false;
        }

        res.json({
            success: executionSuccess,
            output,
            message: executionSuccess ? 'Code executed successfully' : 'Code execution failed'
        });

    } catch (error) {
        console.error('Code execution error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during code execution',
            output: error.message
        });
    }
};

// ============ TEST ACCESS CONTROL CONTROLLERS ============

// Manage allowed candidates for a test
export const manageTestAccess = async (req, res) => {
    try {
        const { testId } = req.params;
        const { restrictAccess, allowedCandidates } = req.body;
        const companyId = req.companyData._id;

        const test = await Test.findOne({ _id: testId, companyId });
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Validate that all candidate IDs exist
        if (allowedCandidates && allowedCandidates.length > 0) {
            const users = await User.find({ _id: { $in: allowedCandidates } });
            if (users.length !== allowedCandidates.length) {
                return res.status(400).json({ success: false, message: 'Some candidate IDs are invalid' });
            }
        }

        test.accessControl = {
            restrictAccess: restrictAccess || false,
            allowedCandidates: allowedCandidates || []
        };

        await test.save();

        res.json({
            success: true,
            message: 'Test access control updated successfully',
            test
        });
    } catch (error) {
        console.error('Manage test access error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Grant reattempt permission to a specific candidate
export const grantReattemptPermission = async (req, res) => {
    try {
        const { testId } = req.params;
        const { candidateId, allowedAttempts } = req.body;
        const companyId = req.companyData._id;

        if (!candidateId || !allowedAttempts) {
            return res.status(400).json({ success: false, message: 'Candidate ID and allowed attempts are required' });
        }

        const test = await Test.findOne({ _id: testId, companyId });
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Verify candidate exists
        const candidate = await User.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        // Check if permission already exists
        const existingPermission = test.reattemptPermissions.find(
            p => p.candidateId.toString() === candidateId
        );

        if (existingPermission) {
            existingPermission.allowedAttempts = allowedAttempts;
            existingPermission.grantedAt = Date.now();
        } else {
            test.reattemptPermissions.push({
                candidateId,
                allowedAttempts,
                grantedBy: companyId,
                grantedAt: Date.now()
            });
        }

        await test.save();

        res.json({
            success: true,
            message: 'Reattempt permission granted successfully',
            test
        });
    } catch (error) {
        console.error('Grant reattempt permission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Revoke reattempt permission from a candidate
export const revokeReattemptPermission = async (req, res) => {
    try {
        const { testId, candidateId } = req.params;
        const companyId = req.companyData._id;

        const test = await Test.findOne({ _id: testId, companyId });
        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        test.reattemptPermissions = test.reattemptPermissions.filter(
            p => p.candidateId.toString() !== candidateId
        );

        await test.save();

        res.json({
            success: true,
            message: 'Reattempt permission revoked successfully',
            test
        });
    } catch (error) {
        console.error('Revoke reattempt permission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get test access details (for recruiters)
export const getTestAccessDetails = async (req, res) => {
    try {
        const { testId } = req.params;
        const companyId = req.companyData._id;

        const test = await Test.findOne({ _id: testId, companyId })
            .populate('accessControl.allowedCandidates', 'name email')
            .populate('reattemptPermissions.candidateId', 'name email');

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        // Get attempt counts for each candidate with reattempt permissions
        const permissionsWithAttempts = await Promise.all(
            test.reattemptPermissions.map(async (perm) => {
                const attemptCount = await TestAttempt.countDocuments({
                    testId,
                    candidateId: perm.candidateId._id
                });
                return {
                    ...perm.toObject(),
                    currentAttempts: attemptCount
                };
            })
        );

        res.json({
            success: true,
            accessControl: test.accessControl,
            reattemptPermissions: permissionsWithAttempts
        });
    } catch (error) {
        console.error('Get test access details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
