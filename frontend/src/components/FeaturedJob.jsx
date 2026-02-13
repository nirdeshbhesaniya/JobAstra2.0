import React, { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import JobCard from "./JobCard";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

const FeaturedJob = () => {
  const { jobs, jobLoading } = useContext(AppContext);
  const navigate = useNavigate();

  // Memoize the featured jobs to prevent unnecessary re-renders
  const featuredJobs = useMemo(() => {
    if (!Array.isArray(jobs) || jobs.length === 0) return [];
    return [...jobs].reverse().slice(0, 6);
  }, [jobs]);

  return (
    <section className="mt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-700 mb-2">Featured Jobs</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Know your worth and find the job that qualifies your life
        </p>
      </div>
      {jobLoading ? (
        <div className="flex items-center justify-center mt-10 min-h-[200px]">
          <Loader />
        </div>
      ) : featuredJobs.length === 0 ? (
        <div className="text-center text-gray-500 min-h-[200px] flex items-center justify-center">
          <p>No jobs found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 auto-rows-fr min-h-[200px]">
            {featuredJobs.map((job) => (
              <JobCard job={job} key={`featured-${job._id || job.id}`} />
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => {
                navigate("/all-jobs/all");
                window.scrollTo(0, 0);
              }}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
              See more
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default FeaturedJob;
