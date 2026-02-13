import { useContext, useEffect, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
    useLocation,
} from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { LoaderCircle, LogOut, User, FileText, Briefcase, Search, Home, Star, ArrowLeft, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { userData, userDataLoading } = useContext(AppContext);

    const sidebarLinks = [
        {
            id: "overview",
            name: "Dashboard",
            path: "/candidate-dashboard/overview",
            icon: Home,
            description: "Your overview and statistics"
        },
        {
            id: "tests",
            name: "Available Tests",
            path: "/candidate-dashboard/tests",
            icon: FileText,
            description: "Take tests for job applications"
        },
        {
            id: "test-results",
            name: "Test Results",
            path: "/candidate-dashboard/test-results",
            icon: Briefcase,
            description: "View your test performance"
        },
        {
            id: "interviews",
            name: "Interviews",
            path: "/candidate-dashboard/interviews",
            icon: Calendar,
            description: "Manage your interview schedule"
        },
        {
            id: "profile",
            name: "My Profile",
            path: "/candidate-dashboard/profile",
            icon: User,
            description: "Manage your personal information"
        },
        {
            id: "applications",
            name: "My Applications",
            path: "/applications",
            icon: FileText,
            description: "Track your job applications"
        },
        {
            id: "jobs",
            name: "Browse Jobs",
            path: "/all-jobs/all",
            icon: Search,
            description: "Find your next opportunity"
        },
        {
            id: "saved-jobs",
            name: "Saved Jobs",
            path: "/candidate-dashboard/saved-jobs",
            icon: Briefcase,
            description: "Jobs you've bookmarked"
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        toast.success("Logout successfully");
        navigate("/candidate-login");
    };

    useEffect(() => {
        if (
            location.pathname === "/candidate-dashboard" ||
            location.pathname === "/candidate-dashboard/"
        ) {
            document.title = "JobAstra - Job Portal | Candidate Dashboard";
            navigate("/candidate-dashboard/overview");
        }
    }, [location.pathname, navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 w-full">
            {/* Enhanced Header */}
            <header className="flex items-center justify-between border-b border-gray-200 py-3 bg-white sticky top-0 z-20  px-4 sm:px-6 lg:px-8 shadow-sm w-full">
                {/* Logo */}
                <Link to="/candidate-dashboard" className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                JobAstra
                            </span>
                            <p className="text-xs text-gray-500 -mt-1">Candidate Portal</p>
                        </div>
                    </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Back to Home Button */}
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 text-xs sm:text-sm font-medium"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Home</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 flex flex-col justify-between">
                            <span className={`bg-gray-600 block transition-all duration-300 h-0.5 w-4 sm:w-5 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5 sm:translate-y-2' : ''}`} />
                            <span className={`bg-gray-600 block transition-all duration-300 h-0.5 w-4 sm:w-5 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`bg-gray-600 block transition-all duration-300 h-0.5 w-4 sm:w-5 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5 sm:-translate-y-2' : ''}`} />
                        </div>
                    </button>

                    {userDataLoading ? (
                        <div className="hidden md:flex items-center gap-2">
                            <LoaderCircle className="animate-spin text-gray-500 w-5 h-5" />
                            <span className="text-sm text-gray-500">Loading...</span>
                        </div>
                    ) : userData ? (
                        <div className="hidden md:flex items-center gap-2 sm:gap-4">
                            {/* User Info */}
                            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                                <img
                                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-300"
                                    src={userData?.image || assets.default_profile}
                                    alt={`${userData?.name}'s profile`}
                                    onError={(e) => (e.target.src = assets.default_profile)}
                                />
                                <div className="hidden lg:block">
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                        {userData?.name}
                                    </p>
                                    <p className="text-xs text-blue-600">Candidate</p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200 group"
                                onClick={handleLogout}
                                aria-label="Logout"
                            >
                                <LogOut size={18} className="text-red-600 group-hover:text-red-700" />
                            </button>
                        </div>
                    ) : null}
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200">
                            {userData && (
                                <div className="flex items-center gap-3">
                                    <img
                                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                                        src={userData?.image || assets.default_profile}
                                        alt={`${userData?.name}'s profile`}
                                        onError={(e) => (e.target.src = assets.default_profile)}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{userData?.name}</p>
                                        <p className="text-xs text-blue-600">Candidate</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <nav className="p-4 space-y-2">
                            {/* Back to Home Button in Mobile Menu */}
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center py-3 px-3 gap-3 transition-all duration-200 rounded-lg text-gray-600 hover:bg-gray-50 border border-gray-200"
                            >
                                <ArrowLeft size={20} />
                                <div>
                                    <span className="font-medium text-sm">Back to Home</span>
                                    <p className="text-xs text-gray-500">Return to main website</p>
                                </div>
                            </Link>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-2"></div>

                            {sidebarLinks.map((item) => (
                                <NavLink
                                    to={item.path}
                                    key={item.id}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center py-3 px-3 gap-3 transition-all duration-200 rounded-lg ${isActive
                                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    <item.icon size={20} />
                                    <div>
                                        <span className="font-medium text-sm">{item.name}</span>
                                        <p className="text-xs text-gray-500">{item.description}</p>
                                    </div>
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center py-3 px-3 gap-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 mt-4"
                            >
                                <LogOut size={20} />
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* Enhanced Main Layout */}
            <div className="flex flex-1 overflow-hidden w-full">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex w-16 lg:w-64 border-r border-gray-200 bg-white flex-col shrink-0 transition-all duration-300">
                    <nav className="pt-6 px-2 lg:px-4 space-y-2">
                        {sidebarLinks.map((item) => (
                            <NavLink
                                to={item.path}
                                key={item.id}
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-3 gap-3 transition-all duration-200 rounded-lg group relative ${isActive
                                        ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                {/* Icon */}
                                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                    <item.icon size={20} />
                                </div>

                                {/* Text - Hidden on lg breakpoint, shown on xl */}
                                <div className="hidden lg:block">
                                    <span className="font-medium text-sm truncate block">
                                        {item.name}
                                    </span>
                                    <p className="text-xs text-gray-500 truncate">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Tooltip for medium screens */}
                                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none lg:hidden whitespace-nowrap z-50">
                                    <div>
                                        <span className="font-medium">{item.name}</span>
                                        <p className="text-gray-300">{item.description}</p>
                                    </div>
                                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-2 border-b-2 border-r-2 border-transparent border-r-gray-900"></div>
                                </div>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="mt-auto p-4 border-t border-gray-200">
                        <div className="hidden lg:block">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Star className="w-6 h-6 text-white" fill="currentColor" />
                                </div>
                                <p className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">JobAstra</p>
                                <p className="text-xs text-gray-400">Candidate v2.1.0</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-gray-50 w-full">
                    <div className="w-full h-full p-3 sm:p-4 lg:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CandidateDashboard;
