import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);

  const [userToken, setUserToken] = useState(localStorage.getItem("userToken"));
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(!!userToken);
  const [userApplication, setUserApplication] = useState(null);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(false);

  const [companyToken, setCompanyToken] = useState(
    localStorage.getItem("companyToken")
  );
  const [companyData, setCompanyData] = useState(null);
  const [isCompanyLogin, setIsCompanyLogin] = useState(!!companyToken);
  const [companyLoading, setIsCompanyLoading] = useState(false);

  useEffect(() => {
    if (userToken) {
      localStorage.setItem("userToken", userToken);
    } else {
      localStorage.removeItem("userToken");
    }
  }, [userToken]);

  useEffect(() => {
    if (companyToken) {
      localStorage.setItem("companyToken", companyToken);
    } else {
      localStorage.removeItem("companyToken");
    }
  }, [companyToken]);

  const fetchUserData = async () => {
    if (!userToken) return;
    setUserDataLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/user/user-data`, {
        headers: { token: userToken },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch user data."
      );
    } finally {
      setUserDataLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    if (!companyToken) return;
    setIsCompanyLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/company/company-data`, {
        headers: { token: companyToken },
      });
      if (data.success) {
        setCompanyData(data.companyData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch company data."
      );
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const fetchJobsData = useCallback(async () => {
    setJobLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/job/all-jobs`);
      if (data.success) {
        setJobs(data.jobData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch jobs.");
    } finally {
      setJobLoading(false);
    }
  }, [backendUrl]);

  const fetchUserApplication = async () => {
    try {
      setApplicationsLoading(true);

      const { data } = await axios.post(
        `${backendUrl}/user/get-user-applications`,
        {},
        {
          headers: {
            token: userToken,
          },
        }
      );

      if (data.success) {
        setUserApplication(data.jobApplications);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (!userToken) return;
    try {
      setSavedJobsLoading(true);
      const { data } = await axios.get(`${backendUrl}/user/saved-jobs`, {
        headers: { token: userToken },
      });
      if (data.success) {
        setSavedJobs(data.savedJobs || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch saved jobs."
      );
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const saveJob = async (jobId) => {
    if (!userToken) {
      toast.error("Please login to save jobs");
      return false;
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/user/save-job`,
        { jobId },
        { headers: { token: userToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchSavedJobs(); // Refresh saved jobs
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save job");
      return false;
    }
  };

  const unsaveJob = async (jobId) => {
    if (!userToken) return false;
    try {
      const { data } = await axios.post(
        `${backendUrl}/user/unsave-job`,
        { jobId },
        { headers: { token: userToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchSavedJobs(); // Refresh saved jobs
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to unsave job");
      return false;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      fetchUserApplication();
      fetchSavedJobs();
    }
  }, []);

  useEffect(() => {
    fetchJobsData();
  }, []);

  useEffect(() => {
    if (userToken) {
      setIsLogin(true);
      fetchUserData();
    } else {
      setUserData(null);
      setIsLogin(false);
    }
  }, [userToken]);

  useEffect(() => {
    if (companyToken) {
      setIsCompanyLogin(true);
      fetchCompanyData();
    } else {
      setCompanyData(null);
      setIsCompanyLogin(false);
    }
  }, [companyToken]);

  const value = {
    // Search
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,

    // Jobs
    jobs,
    setJobs,
    jobLoading,
    fetchJobsData,

    // Backend
    backendUrl,

    // User
    userToken,
    setUserToken,
    userData,
    setUserData,
    userDataLoading,
    isLogin,
    setIsLogin,
    fetchUserData,

    // Company
    companyToken,
    setCompanyToken,
    companyData,
    setCompanyData,
    isCompanyLogin,
    setIsCompanyLogin,
    fetchCompanyData,
    companyLoading,
    userApplication,
    applicationsLoading,
    fetchUserApplication,

    // Saved Jobs
    savedJobs,
    savedJobsLoading,
    fetchSavedJobs,
    saveJob,
    unsaveJob
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
