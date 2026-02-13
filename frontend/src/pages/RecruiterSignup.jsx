import axios from "axios";
import { Lock, Mail, Upload, UserRound, LoaderCircle, Eye, EyeOff } from "lucide-react";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RecruiterSignup = () => {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { backendUrl, setCompanyData, setCompanyToken } =
    useContext(AppContext);
  const navigate = useNavigate();

  const recruiterSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("image", companyLogo);

      const { data } = await axios.post(
        `${backendUrl}/company/register-company`,
        formData
      );

      if (data.success) {
        setCompanyToken(data.token);
        setCompanyData(data.companyData);
        localStorage.setItem("companyToken", data.token);
        toast.success(data.message);
        navigate("/dashboard");
      } else {
        toast.error(data.message);
      }

      console.log("Signup successful:", data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-700 mb-1.5">
                Recruiter Sign Up
              </h1>
              <p className="text-sm text-gray-600">
                Welcome! Please create an account to continue
              </p>
            </div>

            <form className="space-y-4" onSubmit={recruiterSignup}>
              {/* Logo Upload */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-200 group-hover:bg-blue-50">
                    {companyLogo ? (
                      <>
                        <img
                          src={URL.createObjectURL(companyLogo)}
                          alt="Company logo preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-200">
                          <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Upload className="h-6 w-6 mb-1" />
                        <span className="text-xs">Logo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                          const maxSize = 5 * 1024 * 1024; // 5MB

                          if (!allowedTypes.includes(file.type)) {
                            alert('Please select a JPG, JPEG, or PNG file only.');
                            e.target.value = '';
                            return;
                          }

                          if (file.size > maxSize) {
                            alert('File size must be less than 5MB.');
                            e.target.value = '';
                            return;
                          }

                          setCompanyLogo(file);
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="block text-sm font-medium text-gray-700">
                      {companyLogo ? "Change Logo" : "Company Logo"}
                    </span>
                    <span className="block text-xs text-gray-500">
                      JPG, JPEG, PNG • Max 5MB
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div className="border border-gray-300 rounded flex items-center p-2.5 bg-white">
                  <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Company name"
                    className="w-full outline-none text-sm bg-transparent text-gray-900 placeholder-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5 bg-white">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="email"
                    placeholder="Email id"
                    className="w-full outline-none text-sm bg-transparent text-gray-900 placeholder-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    className="w-full outline-none text-sm bg-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label
                htmlFor="terms-checkbox"
                className="text-sm text-gray-600 flex items-center gap-2 cursor-pointer"
              >
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  required
                />
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </Link>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex justify-center items-center cursor-pointer ${loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5" />
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{" "}
                <Link
                  to="/recruiter-login"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Log In
                </Link>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RecruiterSignup;
