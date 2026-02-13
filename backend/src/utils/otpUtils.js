/**
 * Generate a 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Verify if OTP is valid and not expired
 */
export const isOTPValid = (otpRecord) => {
    if (!otpRecord) return false;
    if (otpRecord.verified) return false;
    if (new Date() > otpRecord.expiresAt) return false;
    return true;
};

export default {
    generateOTP,
    isOTPValid
};
