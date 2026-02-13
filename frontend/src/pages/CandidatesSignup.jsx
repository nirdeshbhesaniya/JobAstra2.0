import axios from "axios";
import { LoaderCircle, Lock, Mail, Upload, UserRound, Eye, EyeOff } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

const CandidatesSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, setUserData, setUserToken, setIsLogin } =
    useContext(AppContext);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const userSignupHanlder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("image", image);

      const { data } = await axios.post(
        `${backendUrl}/user/register-user`,
        formData
      );

      if (data.success) {
        setUserToken(data.token);
        setUserData(data.userData);
        setIsLogin(true);
        toast.success(data.message);
        navigate("/");
        localStorage.setItem("userToken", data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div>
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-700 mb-1">
                Candidate Signup
              </h1>
              <p className="text-sm text-gray-600">
                Welcome! Please sign up to continue
              </p>
            </div>

            <form className="space-y-4" onSubmit={userSignupHanlder}>
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-200 group-hover:bg-blue-50">
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-200">
                          <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Upload className="h-6 w-6 mb-1" />
                        <span className="text-xs">Photo</span>
                      </div>
                    )}
                  </div>
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

                        setImage(file);
                      }
                    }}
                  />
                  <div className="text-center mt-2">
                    <span className="block text-sm font-medium text-gray-700">
                      {image ? "Change Photo" : "Upload Photo"}
                    </span>
                    <span className="block text-xs text-gray-500">
                      JPG, JPEG, PNG • Max 5MB
                    </span>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <div className="border border-gray-300 rounded flex items-center p-2.5 bg-white">
                  <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full outline-none text-sm bg-transparent placeholder-gray-400 text-gray-900"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5 bg-white">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full outline-none text-sm bg-transparent placeholder-gray-400 text-gray-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full outline-none text-sm bg-transparent placeholder-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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

              <label
                htmlFor="terms-checkbox"
                className="flex items-center gap-1 cursor-pointer text-sm text-gray-600"
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
                  to="/candidate-login"
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

export default CandidatesSignup;
