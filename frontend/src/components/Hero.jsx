import React, { useContext, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const titleRef = useRef(null);
  const locationRef = useRef(null);

  const { setSearchFilter, setIsSearched } = useContext(AppContext);

  const searchHandler = (e) => {
    e.preventDefault();

    setSearchFilter({
      title: titleRef.current.value,
      location: locationRef.current.value,
    });

    setIsSearched(true);

    if (titleRef.current.value || locationRef.current.value) {
      navigate("/all-jobs/all");
    }
  };

  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl lg:rounded-2xl py-12 sm:py-16 lg:py-20 px-6 sm:px-8 lg:px-12">
      <div className="text-center max-w-4xl mx-auto">

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
          There Are <span className="text-blue-600">93,178</span> Postings Here
          For You!
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 mb-8 sm:mb-10 lg:mb-12 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-2">
          Your next big career move starts right here — explore the best job
          opportunities and take the first step toward your future!
        </p>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={searchHandler}
            className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200"
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch">

              {/* Job Title Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="job"
                    placeholder="e.g. Software Engineer, Marketing Manager"
                    aria-label="Job Title"
                    autoComplete="on"
                    className="w-full pl-10 pr-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500 transition-colors"
                    ref={titleRef}
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Mumbai, Delhi, Remote"
                    aria-label="Location"
                    autoComplete="on"
                    className="w-full pl-10 pr-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base bg-white text-gray-900 placeholder-gray-500 transition-colors"
                    ref={locationRef}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="lg:flex-shrink-0 lg:self-end">
                <button
                  type="submit"
                  className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 px-8 lg:px-12 rounded-lg transition-all duration-200 text-sm sm:text-base cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
                >
                  Search Jobs
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
