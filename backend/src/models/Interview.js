import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        default: 60, // in minutes
        required: true
    },
    timeZone: {
        type: String,
        default: 'UTC'
    },
    zoomMeetingId: {
        type: String,
        required: true
    },
    zoomPassword: {
        type: String,
        required: true
    },
    zoomJoinUrl: {
        type: String,
        required: true
    },
    zoomStartUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show'],
        default: 'scheduled'
    },
    interviewType: {
        type: String,
        enum: ['technical', 'hr', 'behavioral', 'final', 'screening'],
        default: 'screening'
    },
    notes: {
        type: String,
        default: ''
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        strengths: [String],
        improvements: [String]
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    rescheduleHistory: [{
        previousDate: Date,
        newDate: Date,
        reason: String,
        rescheduledBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'rescheduleHistory.userType'
        },
        userType: {
            type: String,
            enum: ['User', 'Company']
        },
        rescheduledAt: {
            type: Date,
            default: Date.now
        }
    }],
    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
interviewSchema.index({ candidateId: 1, scheduledDate: 1 });
interviewSchema.index({ recruiterId: 1, scheduledDate: 1 });
interviewSchema.index({ jobId: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ scheduledDate: 1 });

// Virtual for getting interview end time
interviewSchema.virtual('endDate').get(function () {
    return new Date(this.scheduledDate.getTime() + (this.duration * 60000));
});

// Method to check if interview is upcoming
interviewSchema.methods.isUpcoming = function () {
    return this.scheduledDate > new Date() && this.status === 'scheduled';
};

// Method to check if interview is today
interviewSchema.methods.isToday = function () {
    const today = new Date();
    const interviewDate = new Date(this.scheduledDate);
    return today.toDateString() === interviewDate.toDateString();
};

// Static method to get upcoming interviews for a candidate
interviewSchema.statics.getUpcomingForCandidate = function (candidateId, limit = 10) {
    return this.find({
        candidateId,
        scheduledDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'rescheduled'] }
    })
        .populate('jobId', 'title company location')
        .populate('recruiterId', 'name email')
        .sort({ scheduledDate: 1 })
        .limit(limit);
};

// Static method to get interviews for a recruiter
interviewSchema.statics.getForRecruiter = function (recruiterId, startDate, endDate) {
    const query = { recruiterId };

    if (startDate && endDate) {
        query.scheduledDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    return this.find(query)
        .populate('candidateId', 'name email phone')
        .populate('jobId', 'title')
        .sort({ scheduledDate: 1 });
};

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
