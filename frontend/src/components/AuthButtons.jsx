import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Building2 } from 'lucide-react';

const AuthButtons = ({ className = "" }) => {
    return (
        <div className={`flex flex-col sm:flex-row gap-6 items-center justify-center ${className}`}>
            {/* Candidate Section */}
            <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg w-full sm:w-auto group">
                <div className="bg-blue-600 p-4 rounded-full mb-4 transition-colors duration-300">
                    <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Job Seekers</h3>
                <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                    Discover amazing career opportunities and take the next step in your professional journey
                </p>
                <div className="flex gap-3 w-full">
                    <Link
                        to="/candidate-login"
                        className="flex-1 text-center bg-white text-blue-600 border-2 border-blue-200 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                    >
                        Login
                    </Link>
                    <Link
                        to="/candidate-signup"
                        className="flex-1 text-center bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>

            {/* Recruiter Section */}
            <div className="flex flex-col items-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg w-full sm:w-auto group">
                <div className="bg-green-600 p-4 rounded-full mb-4 transition-colors duration-300">
                    <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Recruiters</h3>
                <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                    Find the perfect candidates for your company and build your dream team
                </p>
                <div className="flex gap-3 w-full">
                    <Link
                        to="/recruiter-login"
                        className="flex-1 text-center bg-white text-green-600 border-2 border-green-200 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-green-50 hover:border-green-300 transition-all duration-300 hover:shadow-md"
                    >
                        Login
                    </Link>
                    <Link
                        to="/recruiter-signup"
                        className="flex-1 text-center bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthButtons;
