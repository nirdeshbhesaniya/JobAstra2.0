import React from "react";
import { Star, Users, Briefcase, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
const Download = () => {
  return (
    <section className="mt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl p-8 lg:p-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-blue-600" fill="currentColor" />
            <span className="text-lg font-semibold text-blue-600 uppercase tracking-wider">
              Success Stories
            </span>
            <Star className="w-6 h-6 text-blue-600" fill="currentColor" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">10,000+</span> Job Seekers
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who have found their dream careers through JobAstra.
            Your success story could be next!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">10K+</h3>
            <p className="text-gray-600 text-sm">Active Users</p>
          </div>

          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">5K+</h3>
            <p className="text-gray-600 text-sm">Jobs Posted</p>
          </div>

          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">3K+</h3>
            <p className="text-gray-600 text-sm">Successful Hires</p>
          </div>

          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">95%</h3>
            <p className="text-gray-600 text-sm">Success Rate</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "JobAstra helped me land my dream job in just 2 weeks! The platform is incredibly user-friendly."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold">SM</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sarah Miller</p>
                <p className="text-sm text-gray-500">Software Engineer</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "As a recruiter, JobAstra has been a game-changer. I found amazing candidates quickly and efficiently."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-semibold">JD</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">John Davis</p>
                <p className="text-sm text-gray-500">HR Manager</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg md:col-span-2 lg:col-span-1">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              "The best job portal I've ever used. Clean interface, relevant matches, and excellent support team."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-semibold">AL</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Alex Lee</p>
                <p className="text-sm text-gray-500">Product Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who trust JobAstra to advance their careers.
            Your next opportunity is just a click away.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/all-jobs/all">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              Get Started Today
            </button>
            </Link>
            <Link to="/about">
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              Learn More
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
