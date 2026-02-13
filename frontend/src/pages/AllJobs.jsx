import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobCategories, JobLocations } from "../assets/assets";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { slideRigth, SlideUp } from "../utils/Animation";

function AllJobs() {
  const [jobData, setJobData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    jobs,
    searchFilter,
    setSearchFilter,
    setIsSearched,
    isSearched,
    jobLoading,
  } = useContext(AppContext);

  const { category } = useParams();
  const navigate = useNavigate();

  const jobsPerPage = 6;

  const [searchInput, setSearchInput] = useState({
    title: "",
    location: "",
    selectedCategories: [],
    selectedLocations: [],
  });

  useEffect(() => {
    // Jobs are already fetched in AppContext, just wait for them
    if (!jobLoading && jobs?.length >= 0) {
      setLoading(false);
    }
  }, [jobs, jobLoading]);

  useEffect(() => {
    if (!jobs?.length) return;

    let filtered = [...jobs];

    if (category !== "all") {
      filtered = filtered.filter(
        (job) => job.category.toLowerCase() === category.toLowerCase()
      );
    }

    setJobData(filtered);
    setSearchInput({
      title: isSearched ? searchFilter.title : "",
      location: isSearched ? searchFilter.location : "",
      selectedCategories: [],
      selectedLocations: [],
    });

    setCurrentPage(1);
  }, [category, jobs, isSearched, searchFilter]);

  useEffect(() => {
    let results = [...jobData];

    if (searchInput.title.trim()) {
      results = results.filter((job) =>
        job.title.toLowerCase().includes(searchInput.title.trim().toLowerCase())
      );
    }

    if (searchInput.location.trim()) {
      results = results.filter((job) =>
        job.location
          .toLowerCase()
          .includes(searchInput.location.trim().toLowerCase())
      );
    }

    if (searchInput.selectedCategories.length > 0) {
      results = results.filter((job) =>
        searchInput.selectedCategories.includes(job.category)
      );
    }

    if (searchInput.selectedLocations.length > 0) {
      results = results.filter((job) =>
        searchInput.selectedLocations.includes(job.location)
      );
    }

    setFilteredJobs(results);
    setCurrentPage(1);
  }, [jobData, searchInput]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (cat) => {
    setSearchInput((prev) => {
      const updated = prev.selectedCategories.includes(cat)
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];
      return { ...prev, selectedCategories: updated };
    });
  };

  const handleLocationToggle = (loc) => {
    setSearchInput((prev) => {
      const updated = prev.selectedLocations.includes(loc)
        ? prev.selectedLocations.filter((l) => l !== loc)
        : [...prev.selectedLocations, loc];
      return { ...prev, selectedLocations: updated };
    });
  };

  const clearAllFilters = () => {
    setSearchInput({
      title: "",
      location: "",
      selectedCategories: [],
      selectedLocations: [],
    });
    setSearchFilter({ title: "", location: "" });
    setIsSearched(false);
    navigate("/all-jobs/all");
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginatedJobs = useMemo(() => {
    return [...filteredJobs]
      .reverse()
      .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  }, [filteredJobs, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-end mb-4 sm:mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg text-sm sm:text-base"
            >
              <Filter size={18} className="sm:w-5 sm:h-5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:gap-6 xl:gap-8">
            {/* Filters Sidebar */}
            <div
              className={`lg:w-1/4 xl:w-1/5 mb-6 lg:mb-0 ${showFilters ? "block" : "hidden lg:block"
                }`}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-lg sticky top-4 sm:top-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                  <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  Filters
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  {/* Job Title Filter */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      Job Title
                    </h3>
                    <input
                      type="text"
                      name="title"
                      value={searchInput.title}
                      onChange={handleSearchChange}
                      placeholder="Search by title..."
                      className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-sm sm:text-base"
                    />
                  </div>

                  {/* Location Filter */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      Location
                    </h3>
                    <input
                      type="text"
                      name="location"
                      value={searchInput.location}
                      onChange={handleSearchChange}
                      placeholder="Search by location..."
                      className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none text-sm sm:text-base"
                    />
                  </div>

                  {/* Categories Filter */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      Categories
                    </h3>
                    <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                      {JobCategories.map((cat, i) => (
                        <label key={i} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={searchInput.selectedCategories.includes(cat)}
                            onChange={() => handleCategoryToggle(cat)}
                            className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 sm:ml-3 text-gray-700 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                            {cat}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Locations Filter */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                      Locations
                    </h3>
                    <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                      {JobLocations.map((loc, i) => (
                        <label key={i} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={searchInput.selectedLocations.includes(loc)}
                            onChange={() => handleLocationToggle(loc)}
                            className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 sm:ml-3 text-gray-700 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                            {loc}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <button
                    onClick={clearAllFilters}
                    className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold border border-gray-300 text-sm sm:text-base"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Job Cards */}
            <div className="lg:w-3/4 xl:w-4/5">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 capitalize mb-2 sm:mb-3">
                  {category === "all"
                    ? "Latest All Jobs"
                    : `Jobs in ${category.charAt(0).toUpperCase() + category.slice(1)
                    }`}
                  {filteredJobs.length > 0 && (
                    <span className="ml-2 sm:ml-3 text-blue-600 text-lg sm:text-xl font-medium block sm:inline">
                      ({filteredJobs.length}{" "}
                      {filteredJobs.length === 1 ? "job" : "jobs"})
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Discover amazing opportunities from top companies
                </p>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
              >
                {paginatedJobs.length > 0 ? (
                  paginatedJobs.map((job, i) => <JobCard key={i} job={job} />)
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white p-8 sm:p-12 rounded-2xl border border-gray-200 shadow-sm min-h-[400px]">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-center max-w-md text-sm sm:text-base">
                      We couldn't find any jobs matching your criteria. Try adjusting your search filters or explore different categories.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 sm:gap-3 mt-8 sm:mt-12 flex-wrap px-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 sm:p-3 border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  </button>

                  <div className="flex gap-1 sm:gap-2 max-w-xs sm:max-w-none overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl border text-center cursor-pointer font-semibold transition-all duration-300 text-sm sm:text-base flex-shrink-0 ${currentPage === i + 1
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 sm:p-3 border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Add closing div for the flex container */}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default AllJobs;
