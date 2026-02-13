import bcrypt from "bcrypt";
import OTP from "../models/OTP.js";
import Company from "../models/Company.js";
import { generateOTP, isOTPValid } from "../utils/otpUtils.js";
import { sendPasswordResetOTP } from "../utils/emailNotifications.js";

/**
 * Request password reset - sends OTP to email (for recruiters/companies)
 */
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if company exists
        const company = await Company.findOne({ email: email.toLowerCase().trim() });
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address",
            });
        }

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase().trim(), userType: 'recruiter' });

        // Generate new OTP
        const otp = generateOTP();

        // Save OTP to database
        const otpRecord = new OTP({
            email: email.toLowerCase().trim(),
            otp,
            userType: 'recruiter',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
        await otpRecord.save();

        // Send OTP email
        await sendPasswordResetOTP(email, company.name, otp, 'recruiter');

        return res.status(200).json({
            success: true,
            message: "Password reset OTP has been sent to your email",
        });
    } catch (error) {
        console.error("Request password reset error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process password reset request",
        });
    }
};

/**
 * Verify OTP code (for recruiters/companies)
 */
export const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase().trim(),
            otp: otp.trim(),
            userType: 'recruiter',
            verified: false,
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP code",
            });
        }

        // Check if OTP is valid and not expired
        if (!isOTPValid(otpRecord)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one",
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};

/**
 * Reset password with verified OTP (for recruiters/companies)
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        // Find verified OTP record
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase().trim(),
            otp: otp.trim(),
            userType: 'recruiter',
            verified: true,
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or unverified OTP",
            });
        }

        // Check if OTP is still valid (not expired)
        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one",
            });
        }

        // Find company
        const company = await Company.findOne({ email: email.toLowerCase().trim() });
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update company password
        company.password = hashedPassword;
        await company.save();

        // Delete all OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase().trim(), userType: 'recruiter' });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login with your new password",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password",
        });
    }
};

export default {
    requestPasswordReset,
    verifyResetOTP,
    resetPassword
};
