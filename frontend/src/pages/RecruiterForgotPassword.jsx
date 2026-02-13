import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Key, ArrowLeft, Star, Sparkles, Shield, Briefcase } from 'lucide-react';

const RecruiterForgotPassword = () => {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            return toast.error('Please enter your email');
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/company/forgot-password`, { email });
            if (data.success) {
                toast.success(data.message);
                setStep(2);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp) {
            return toast.error('Please enter the OTP');
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/company/verify-reset-otp`, { email, otp });
            if (data.success) {
                toast.success(data.message);
                setStep(3);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            return toast.error('Please fill all fields');
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/company/reset-password`, {
                email,
                otp,
                newPassword,
            });
            if (data.success) {
                toast.success(data.message);
                setTimeout(() => navigate('/recruiter-login'), 2000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link
                    to="/recruiter-login"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Login</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="bg-white p-3 rounded-xl">
                                <Briefcase className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl font-bold text-white">JobAstra</h1>
                                <p className="text-green-100 text-sm flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Recruiter Portal
                                </p>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Reset Password</h2>
                        <p className="text-green-100 text-sm mt-2">Recruiter Account</p>
                    </div>

                    <div className="px-8 pt-6">
                        <div className="flex items-center justify-between mb-8">
                            {[1, 2, 3].map((s) => (
                                <React.Fragment key={s}>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s
                                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                                    : 'bg-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {s}
                                        </div>
                                        <span className="text-xs mt-2 text-gray-600">
                                            {s === 1 ? 'Email' : s === 2 ? 'Verify' : 'Reset'}
                                        </span>
                                    </div>
                                    {s < 3 && (
                                        <div
                                            className={`flex-1 h-1 mx-2 rounded transition-all ${step > s ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gray-200'
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 pt-0">
                        {step === 1 && (
                            <form onSubmit={handleRequestOTP} className="space-y-6">
                                <div>
                                    <p className="text-gray-600 text-sm mb-6 text-center">
                                        Enter your company email address and we'll send you an OTP to reset your password.
                                    </p>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="company@example.com"
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <p className="text-gray-600 text-sm mb-6 text-center">
                                        We've sent a 6-digit OTP to <strong>{email}</strong>. Please enter it below.
                                    </p>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter OTP
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        OTP expires in 10 minutes
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRequestOTP}
                                    disabled={loading}
                                    className="w-full text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
                                >
                                    Didn't receive OTP? Resend
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <p className="text-gray-600 text-sm mb-6 text-center">
                                        Create a strong password for your recruiter account.
                                    </p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                        Password must be at least 6 characters long
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {loading ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/recruiter-login" className="text-green-600 font-medium hover:text-green-700">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-800 text-center">
                        🔒 Your security is our priority. Never share your OTP with anyone.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RecruiterForgotPassword;
