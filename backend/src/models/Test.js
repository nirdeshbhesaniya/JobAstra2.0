import mongoose from 'mongoose';

// Test Schema - Main test structure
const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false // Can be null for general tests
    },
    duration: {
        type: Number,
        required: true, // in minutes
        min: 1
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    passingMarks: {
        type: Number,
        required: true
    },
    instructions: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    allowRetake: {
        type: Boolean,
        default: false
    },
    maxAttempts: {
        type: Number,
        default: 1,
        min: 1
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: false // Can be null for no expiry
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestSection'
    }],
    accessControl: {
        restrictAccess: {
            type: Boolean,
            default: false // If true, only allowedCandidates can attempt
        },
        allowedCandidates: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    reattemptPermissions: [{
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        allowedAttempts: {
            type: Number,
            default: 1
        },
        grantedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        grantedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Test Section Schema - Different sections within a test
const testSectionSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    sectionType: {
        type: String,
        enum: ['technical', 'aptitude', 'logical', 'personality', 'coding', 'essay', 'general'],
        required: true
    },
    timeLimit: {
        type: Number, // in minutes, per section
        required: false
    },
    marks: {
        type: Number,
        default: 0
    },
    order: {
        type: Number,
        required: true,
        min: 1
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
}, {
    timestamps: true
});

// Question Schema - Individual questions
const questionSchema = new mongoose.Schema({
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestSection',
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    questionImage: {
        type: String, // Base64 or URL
        default: ''
    },
    questionCode: {
        type: String, // Code snippet for the question
        default: ''
    },
    questionType: {
        type: String,
        enum: ['mcq', 'multiple-select', 'true-false', 'short-answer', 'essay', 'coding', 'fill-blank'],
        required: true
    },
    options: [{
        text: { type: String, default: '' },
        code: { type: String, default: '' },
        type: { type: String, enum: ['text', 'code'], default: 'text' },
        isCorrect: { type: Boolean, default: false }
    }],
    correctAnswer: {
        type: String, // For non-MCQ questions
        required: false
    },
    marks: {
        type: Number,
        required: true,
        min: 0
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    explanation: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        required: true,
        min: 1
    },
    isRequired: {
        type: Boolean,
        default: true
    },
    codeTemplate: {
        type: String, // For coding questions
        default: ''
    },
    expectedOutput: {
        type: String, // For coding questions
        default: ''
    },
    testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

// Test Attempt Schema - When a candidate takes a test
const testAttemptSchema = new mongoose.Schema({
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned', 'expired', 'evaluated'],
        default: 'in-progress'
    },
    totalScore: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    isPassed: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number, // in minutes
        default: 0
    },
    attemptNumber: {
        type: Number,
        default: 1,
        min: 1
    },
    responses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestResponse'
    }],
    evaluation: {
        evaluatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: false
        },
        evaluatedAt: {
            type: Date,
            required: false
        },
        comments: {
            type: String,
            default: ''
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: false
        }
    }
}, {
    timestamps: true
});

// Test Response Schema - Individual question responses
const testResponseSchema = new mongoose.Schema({
    attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestAttempt',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    candidateAnswer: {
        type: mongoose.Schema.Types.Mixed, // Can be string, array, or object
        required: false
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    marksObtained: {
        type: Number,
        default: 0
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    },
    flagged: {
        type: Boolean,
        default: false
    },
    reviewComment: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for better performance
testSchema.index({ companyId: 1, isActive: 1 });
testSchema.index({ jobId: 1 });
testAttemptSchema.index({ candidateId: 1, testId: 1 });
testAttemptSchema.index({ status: 1 });
testResponseSchema.index({ attemptId: 1 });

const Test = mongoose.model('Test', testSchema);
const TestSection = mongoose.model('TestSection', testSectionSchema);
const Question = mongoose.model('Question', questionSchema);
const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
const TestResponse = mongoose.model('TestResponse', testResponseSchema);

export { Test, TestSection, Question, TestAttempt, TestResponse };