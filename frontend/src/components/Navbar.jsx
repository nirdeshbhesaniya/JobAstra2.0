import {
  Briefcase,
  ChevronDown,
  LoaderCircle,
  LogOut,
  Menu,
  Star,
  UserRound,
  X,
  Calendar,
} from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { isLogin, userData, userDataLoading, setIsLogin } =
    useContext(AppContext);
  const location = useLocation();

  const navigate = useNavigate();

  const menu = [
    { name: "Home", path: "/" },
    { name: "All Jobs", path: "/all-jobs/all" },
    { name: "Tests", path: "/candidate-dashboard/tests" },
    { name: "About", path: "/about" },
    { name: "Terms", path: "/terms" },
  ];

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle menu"]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    toast.success("Logout successfully");
    navigate("/candidate-login");
    setIsLogin(false);
  };
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50 mb-9 px-4 sm:px-6 lg:px-8">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:shadow-lg transition-all duration-300">
              <Star className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobAstra
              </span>
              <span className="text-xs text-gray-500 -mt-1">Find Your Star</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {menu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                      ? "text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop Buttons */}
          {userDataLoading ? (
            <LoaderCircle className="animate-spin text-gray-600 hidden lg:block" />
          ) : isLogin ? (
            <div
              className="hidden lg:flex items-center gap-4 relative"
              ref={profileMenuRef}
            >
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 focus:outline-none"
                aria-expanded={isProfileMenuOpen}
              >
                <span className="text-sm font-medium text-gray-700">
                  Hi, {userData?.name || "User"}
                </span>
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={userData?.image || assets.avatarPlaceholder}
                  alt="User profile"
                  onError={(e) => {
                    e.currentTarget.src = assets.avatarPlaceholder;
                  }}
                />
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 mt-2 w-56 origin-top-right rounded-md border border-gray-200 bg-white z-50 overflow-hidden shadow-lg">
                  <div className="py-1">
                    <Link
                      to="/candidate-dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserRound size={16} />
                      Dashboard
                    </Link>

                    <Link
                      to="/candidate-dashboard/interviews"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Calendar size={16} />
                      Interviews
                    </Link>

                    <Link
                      to="/applications"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 gap-2 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Briefcase size={16} />
                      Applied Jobs
                    </Link>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              {/* Candidate Buttons */}
              <div className="flex items-center gap-2 bg-blue-50 p-1 rounded-lg border border-blue-100">
                <span className="text-xs text-blue-600 font-semibold px-2">Job Seekers</span>
                <Link
                  to="/candidate-login"
                  className="text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white transition-all duration-300 border border-transparent hover:border-blue-200"
                >
                  Login
                </Link>
                <Link
                  to="/candidate-signup"
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>

              {/* Recruiter Buttons */}
              <div className="flex items-center gap-2 bg-green-50 p-1 rounded-lg border border-green-100">
                <span className="text-xs text-green-600 font-semibold px-2">Recruiters</span>
                <Link
                  to="/recruiter-login"
                  className="text-green-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white transition-all duration-300 border border-transparent hover:border-green-200"
                >
                  Login
                </Link>
                <Link
                  to="/recruiter-signup"
                  className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        ref={mobileMenuRef}
      >
        <div className="fixed inset-0 backdrop-blur-sm" onClick={toggleMenu} />
        <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <Link to="/" onClick={toggleMenu} className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Star className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  JobAstra
                </span>
                <span className="text-xs text-gray-500 -mt-1">Find Your Star</span>
              </div>
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menu.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={toggleMenu}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm font-medium ${isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {userDataLoading ? (
              <LoaderCircle className="animate-spin text-gray-600 hidden lg:block" />
            ) : isLogin ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={userData?.image || assets.avatarPlaceholder}
                    alt="User profile"
                    onError={(e) => {
                      e.currentTarget.src = assets.avatarPlaceholder;
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{userData?.email}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/candidate-dashboard"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserRound size={16} />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/candidate-dashboard/interviews"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Calendar size={16} />
                      Interviews
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/applications"
                      onClick={toggleMenu}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Briefcase size={16} />
                      Applied Jobs
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                {/* Candidate Section */}
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <p className="text-sm text-blue-700 font-semibold">Job Seekers</p>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/candidate-login"
                      onClick={toggleMenu}
                      className="block w-full text-blue-600 bg-white border border-blue-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:shadow-sm transition-all duration-300 text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/candidate-signup"
                      onClick={toggleMenu}
                      className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-300 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>

                {/* Recruiter Section */}
                <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <p className="text-sm text-green-700 font-semibold">Recruiters</p>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/recruiter-login"
                      onClick={toggleMenu}
                      className="block w-full text-green-600 bg-white border border-green-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:shadow-sm transition-all duration-300 text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/recruiter-signup"
                      onClick={toggleMenu}
                      className="block w-full bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-300 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
