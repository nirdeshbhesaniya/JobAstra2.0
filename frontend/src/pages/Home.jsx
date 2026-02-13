import React, { useContext, useEffect } from "react";
// import FeaturedJob from "../components/FeaturedJob";
import Hero from "../components/Hero";
import JobCategoryt from "../components/JobCategory";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import Counter from "../components/Counter";
import Download from "../components/Download";
import Footer from "../components/Footer";
import AuthButtons from "../components/AuthButtons";
import { AppContext } from "../context/AppContext";

const Home = () => {
  const { isLogin, isCompanyLogin } = useContext(AppContext);

  return (
    <>
      <Navbar />

      {/* Main Container with responsive padding */}
      <div className="min-h-screen bg-gray-50">

        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Hero />
        </div>

        {/* Auth Buttons Section - Only show when not logged in */}
        {!isLogin && !isCompanyLogin && (
          <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
                  Join Our Community
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed px-4">
                  Whether you're looking for your next career opportunity or searching for the perfect candidate,
                  we have the tools to help you succeed.
                </p>
              </div>
              <AuthButtons className="max-w-4xl mx-auto" />
            </div>
          </div>
        )}

        {/* Job Categories Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <JobCategoryt />
          </div>
        </div>

        {/* Test Features Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
              Advanced Assessment Platform
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mb-8 sm:mb-12">
              Comprehensive online testing system for both recruiters and candidates. Create, take, and evaluate assessments with ease.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* For Recruiters */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Create Tests</h3>
                <p className="text-gray-600 mb-4">
                  Build comprehensive assessments with multiple question types, sections, and auto-evaluation.
                </p>
                {isCompanyLogin && (
                  <button
                    onClick={() => window.location.href = '/dashboard/tests'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Manage Tests
                  </button>
                )}
              </div>

              {/* For Candidates */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Take Tests</h3>
                <p className="text-gray-600 mb-4">
                  Complete assessments for job applications with intuitive interface and real-time progress tracking.
                </p>
                {isLogin && (
                  <button
                    onClick={() => window.location.href = '/candidate-dashboard/tests'}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Available Tests
                  </button>
                )}
              </div>

              {/* Features */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Evaluation</h3>
                <p className="text-gray-600 mb-4">
                  Automatic grading for objective questions and comprehensive evaluation tools for subjective assessments.
                </p>
                <div className="text-sm text-gray-500">
                  ✓ Multiple question types<br />
                  ✓ Timer & auto-submit<br />
                  ✓ Detailed reporting
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <Testimonials />
          </div>
        </div>

        {/* Counter Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <Counter />
          </div>
        </div>

        {/* Download Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <Download />
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
};

export default Home;
