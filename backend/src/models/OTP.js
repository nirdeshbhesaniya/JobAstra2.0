import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        otp: {
            type: String,
            required: true
        },
        userType: {
            type: String,
            enum: ['candidate', 'recruiter'],
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Index for automatic deletion of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster lookups
otpSchema.index({ email: 1, userType: 1 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
