import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { Star, Mail, Phone, MapPin, Heart, ArrowRight, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white mt-12 sm:mt-16 lg:mt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 lg:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company Info */}
          <div className="space-y-6 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 group-hover:scale-105">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  JobAstra
                </span>
                <span className="text-xs text-gray-400 -mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Find Your Star
                </span>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Connecting talented professionals with their dream careers through innovative technology and personalized experiences.
              <span className="text-purple-400 font-medium">Your success story starts here.</span>
            </p>

            {/* Enhanced Social Media */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />
                Connect With Us
              </h4>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <a
                  href="https://www.linkedin.com/in/nirdesh-bhesaniya-387b67284/"
                  className="group relative bg-gradient-to-r from-blue-700 to-blue-800 p-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25"
                  aria-label="LinkedIn"
                >
                  <img
                    src={assets.linkedin_icon}
                    alt="LinkedIn"
                    className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </a>
                <a
                  href="https://x.com/Nirdesh_12"
                  className="group relative bg-gradient-to-r from-sky-500 to-sky-600 p-3 rounded-xl hover:from-sky-400 hover:to-sky-500 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/25"
                  aria-label="Twitter"
                >
                  <img
                    src={assets.twitter_icon}
                    alt="Twitter"
                    className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-sky-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </a>
                <a
                  href="https://github.com/nirdeshbhesaniya"
                  className="group relative bg-gradient-to-r from-gray-700 to-gray-800 p-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/25"
                  aria-label="GitHub"
                >
                  <img
                    src={assets.github_icon}
                    alt="GitHub"
                    className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gray-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Home</span>
                </Link>
              </li>
              <li>
                <Link to="/all-jobs/all" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">All Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Terms & Conditions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-5 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
              For Job Seekers
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/candidate-signup" className="group flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-blue-400" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Create Account</span>
                </Link>
              </li>
              <li>
                <Link to="/candidate-login" className="group flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-blue-400" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Login</span>
                </Link>
              </li>
              <li>
                <Link to="/applications" className="group flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-blue-400" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">My Applications</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div className="space-y-5 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
              For Recruiters
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/recruiter-signup" className="group flex items-center gap-2 text-gray-300 hover:text-green-400 transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-green-400" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Post Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/recruiter-login" className="group flex items-center gap-2 text-gray-300 hover:text-green-400 transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-green-400" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Recruiter Login</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="group flex items-center gap-2 text-gray-300 hover:text-green-400 transition-all duration-300 text-sm py-1">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-green-400" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gradient-to-r from-transparent via-purple-500/30 to-transparent pt-8 sm:pt-12 pb-8 sm:pb-12">
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-purple-500/20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Stay Updated
                </h3>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-gray-300 text-sm mb-6">
                Get the latest job opportunities and career insights delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                />
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-purple-500/20 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span>© 2024 JobAstra.</span>
                <span>All rights reserved.</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-pink-400" fill="currentColor" /> for your success
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300">
              <a href="#" className="hover:text-purple-400 transition-colors duration-300 py-1 relative group">
                Privacy Policy
                <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors duration-300 py-1 relative group">
                Cookie Policy
                <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></div>
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors duration-300 py-1 relative group">
                Support
                <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
