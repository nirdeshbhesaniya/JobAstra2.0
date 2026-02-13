import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Award,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  Shield,
  Zap
} from "lucide-react";
import Counter from "../components/Counter";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import { assets } from "../assets/assets";

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with opportunities worldwide and expand your career horizons"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security measures"
    },
    {
      icon: Zap,
      title: "Fast Matching",
      description: "AI-powered job matching that finds the perfect fit in seconds"
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Get guidance from career experts and industry professionals"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Jobs", icon: Target },
    { number: "25K+", label: "Companies", icon: Award },
    { number: "100K+", label: "Job Seekers", icon: Users },
    { number: "95%", label: "Success Rate", icon: TrendingUp }
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, #9CA3AF 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobAstra
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing the way people find their dream careers through innovative technology and personalized experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main About Content */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Empowering Careers, Connecting Dreams
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  At JobAstra, we believe that everyone deserves to find their perfect career match. Our platform combines cutting-edge AI technology with human expertise to create meaningful connections between talented individuals and forward-thinking companies.
                </p>
                <p>
                  Founded by a team of career experts and tech innovators, we've helped thousands of professionals take the next step in their careers while enabling companies to discover exceptional talent that drives their success.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  {["AI-Powered Matching", "Expert Career Guidance", "Verified Companies", "24/7 Support"].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={assets.app_main_img}
                  alt="About JobAstra"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20"></div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold">4.9/5 Rating</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold">98% Success Rate</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose JobAstra?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We go beyond traditional job boards to create meaningful career connections
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Counter Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto">
          <Counter />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works?
            </h2>
            <p className="text-lg text-gray-600">Job for anyone, anywhere</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Work Step 1 */}
            <motion.div
              variants={fadeInUp}
              className="relative group"
            >
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={assets.work_1}
                      alt="Resume Assessment"
                      className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Free Resume Assessments
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Employers on average spend 31 seconds scanning resumes to identify potential matches.
                </p>

                <div className="flex items-center justify-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm">Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>

            {/* Work Step 2 */}
            <motion.div
              variants={fadeInUp}
              className="relative group"
            >
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>

                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={assets.work_2}
                      alt="Job Fit Scoring"
                      className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Job Fit Scoring
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our advanced algorithm scores your resume against job criteria for perfect matches.
                </p>

                <div className="flex items-center justify-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm">Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>

            {/* Work Step 3 */}
            <motion.div
              variants={fadeInUp}
              className="relative group"
            >
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>

                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      src={assets.work_3}
                      alt="Help Every Step"
                      className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Help Every Step of the Way
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Receive expert guidance throughout your job search journey with personalized support.
                </p>

                <div className="flex items-center justify-center text-green-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm">Learn More</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <Testimonials />
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
