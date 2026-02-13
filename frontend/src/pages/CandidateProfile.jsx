import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { User, Mail, Phone, MapPin, Calendar, Upload, Save, Edit3, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import axios from "axios";

const CandidateProfile = () => {
    const { userData, userDataLoading, backendUrl, userToken, fetchUserData } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [formData, setFormData] = useState({
        name: userData?.name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
        location: userData?.location || "",
        bio: userData?.bio || ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Basic phone sanitization: allow digits, plus, spaces, hyphens
        const sanitized = name === 'phone' ? value.replace(/[^0-9+\-\s]/g, '') : value;
        setFormData(prev => ({ ...prev, [name]: sanitized }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a JPG, JPEG, or PNG file only.');
                e.target.value = '';
                return;
            }

            if (file.size > maxSize) {
                toast.error('File size must be less than 5MB.');
                e.target.value = '';
                return;
            }

            setProfileImage(file);
        }
    };

    const handleSave = async () => {
        try {
            const headers = { token: userToken };

            // If image selected, send multipart
            if (profileImage) {
                const form = new FormData();
                form.append('name', formData.name || '');
                form.append('phone', formData.phone || '');
                form.append('location', formData.location || '');
                form.append('bio', formData.bio || '');
                form.append('image', profileImage);

                await axios.put(`${backendUrl}/user/update-profile`, form, { headers });
            } else {
                // JSON body
                await axios.put(
                    `${backendUrl}/user/update-profile`,
                    { name: formData.name, phone: formData.phone, location: formData.location, bio: formData.bio },
                    { headers }
                );
            }

            await fetchUserData();
            setIsEditing(false);
            setProfileImage(null);
            toast.success("Profile updated successfully!");
        } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        }
    };

    if (userDataLoading) {
        return (
            <div className="w-full max-w-none space-y-4 sm:space-y-6">
                {/* Loading Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse w-32"></div>
                        <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse w-80"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full sm:w-32"></div>
                </div>

                {/* Loading Profile Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                    {/* Loading Cover */}
                    <div className="h-24 sm:h-32 bg-gray-200 animate-pulse"></div>

                    {/* Loading Profile Content */}
                    <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
                        {/* Loading Profile Image */}
                        <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full animate-pulse border-4 border-white"></div>
                        </div>

                        {/* Loading Profile Info */}
                        <div className="pt-12 sm:pt-16 space-y-6">
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                            </div>

                            {/* Loading Form Fields */}
                            <div className="space-y-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                                        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full"></div>
                                    </div>
                                ))}

                                {/* Loading Bio Field */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                                    <div className="h-24 bg-gray-200 rounded-lg animate-pulse w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-none space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage your personal information and preferences</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto justify-center ${isEditing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                {/* Cover Image */}
                <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                {/* Profile Info */}
                <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
                    {/* Profile Image */}
                    <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6">
                        <div className="relative">
                            <img
                                src={profileImage ? URL.createObjectURL(profileImage) : userData?.image || assets.default_profile}
                                alt="Profile"
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover bg-white"
                                onError={(e) => (e.target.src = assets.default_profile)}
                            />
                            {isEditing && (
                                <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="pt-16 sm:pt-20 space-y-4 sm:space-y-6 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{userData?.name || "Not provided"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{userData?.email || "Not provided"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{userData?.phone || "Not provided"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                {isEditing ? (
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your location"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{userData?.location || "Not provided"}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio
                            </label>
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                                    <p className="text-gray-900">
                                        {userData?.bio || "No bio added yet. Add a bio to tell employers about yourself."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        {isEditing && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Member since</p>
                            <p className="text-gray-900">January 2024</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="text-gray-900">Job Seeker</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Upload Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Photo Upload Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Supported formats: JPG, JPEG, PNG</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Recommended dimensions: 400x400 pixels</li>
                    <li>• Use a professional headshot for best results</li>
                </ul>
            </div>
        </div>
    );
};

export default CandidateProfile;
