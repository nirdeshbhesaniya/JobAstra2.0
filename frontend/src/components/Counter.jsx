import React, { useState, useEffect, useRef } from "react";
import { CheckCheck, Users, Briefcase, Trophy } from "lucide-react";

const Counter = () => {
  const [counts, setCounts] = useState({
    users: 898,
    jobs: 298,
    stories: 20000
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Simple intersection observer - trigger only once
  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Simple one-time animation
          const animateCounters = () => {
            let userCount = 0;
            let jobCount = 0;
            let storyCount = 0;

            const userTarget = 898;
            const jobTarget = 298;
            const storyTarget = 20000;

            const userStep = userTarget / 30;
            const jobStep = jobTarget / 30;
            const storyStep = storyTarget / 30;

            let frame = 0;
            const animate = () => {
              frame++;

              if (frame <= 30) {
                userCount = Math.min(Math.floor(userStep * frame), userTarget);
                jobCount = Math.min(Math.floor(jobStep * frame), jobTarget);
                storyCount = Math.min(Math.floor(storyStep * frame), storyTarget);

                setCounts({
                  users: userCount,
                  jobs: jobCount,
                  stories: storyCount
                });

                requestAnimationFrame(animate);
              }
            };

            requestAnimationFrame(animate);
          };

          setTimeout(animateCounters, 500);
        }
      },
      { threshold: 0.3, rootMargin: '0px' }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated]);

  return (
    <section className="mt-24 mb-16" ref={sectionRef}>
      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-8 mb-12">
        {/* Image Container */}
        <div className="lg:w-[50%] lg:h-[400px] w-full flex">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&auto=format"
            alt="Professional team collaboration"
            className="w-full h-full object-cover rounded-2xl shadow-lg"
            loading="lazy"
          />
        </div>

        {/* Content Container */}
        <div className="w-full lg:w-[50%] flex flex-col justify-center">
          <div className="py-6 lg:py-0 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Millions of Jobs. Find the one that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                suits you.
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Search all the open positions on the web. Get your own
              personalized salary estimate. Read reviews on over 600,000
              companies worldwide.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCheck className="text-green-500 flex-shrink-0 mt-1 w-5 h-5" />
                <span className="text-gray-700 font-medium">
                  Access to premium job opportunities across industries
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCheck className="text-green-500 flex-shrink-0 mt-1 w-5 h-5" />
                <span className="text-gray-700 font-medium">
                  Personalized job recommendations based on your skills
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCheck className="text-green-500 flex-shrink-0 mt-1 w-5 h-5" />
                <span className="text-gray-700 font-medium">
                  Direct connection with top recruiters and companies
                </span>
              </li>
            </ul>

            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Get Started Today
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-3xl p-8 lg:p-12 border border-blue-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-gray-600">
            Join thousands of successful job seekers and recruiters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Daily Active Users */}
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
              {counts.users.toLocaleString()}
              <span className="text-3xl">K</span>
            </div>
            <span className="text-gray-600 font-semibold">Daily Active Users</span>
          </div>

          {/* Job Positions */}
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
              {counts.jobs.toLocaleString()}
              <span className="text-3xl">+</span>
            </div>
            <span className="text-gray-600 font-semibold">Open Job Positions</span>
          </div>

          {/* Success Stories */}
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
              {counts.stories.toLocaleString()}
              <span className="text-3xl">+</span>
            </div>
            <span className="text-gray-600 font-semibold">Success Stories</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Counter;