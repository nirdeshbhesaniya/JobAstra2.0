import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res.json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res.json({ success: false, message: "Enter your password" });
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Upload your image" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUploadUrl = await cloudinary.uploader.upload(imageFile.path);

    const user = await User({
      name,
      email,
      password: hashedPassword,
      image: imageUploadUrl.secure_url,
    });

    await user.save();

    const token = await generateToken(user._id);

    return res.json({
      success: true,
      message: "Registration successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Registration failed",
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const fetchUserData = async (req, res) => {
  try {
    const userData = req.userData;

    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
      userData,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "user data fetched failed",
      userData,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId, additionalInfo } = req.body;
    const userId = req.userData._id;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Job ID are required",
      });
    }

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobApplication = new JobApplication({
      jobId,
      userId,
      companyId: jobData.companyId,
      date: new Date(),
      additionalInfo: {
        coverLetter: additionalInfo?.coverLetter || undefined,
        expectedSalary: additionalInfo?.expectedSalary || undefined,
        noticePeriod: additionalInfo?.noticePeriod || undefined,
        yearsExperience: typeof additionalInfo?.yearsExperience === 'number' ? additionalInfo.yearsExperience : undefined,
        currentLocation: additionalInfo?.currentLocation || undefined,
        portfolioUrl: additionalInfo?.portfolioUrl || undefined,
      },
    });

    await jobApplication.save();

    return res.status(201).json({
      success: true,
      message: "Job applied successfully",
      jobApplication,
    });
  } catch (error) {
    console.error("Job application error:", error);

    return res.status(500).json({
      success: false,
      message: "Job application failed",
    });
  }
};

export const getUserAppliedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const application = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Jobs application fetched successfully",
      jobApplications: application,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs application",
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload resume to Cloudinary
    const uploadedResumeUrl = await cloudinary.uploader.upload(resumeFile.path);
    userData.resume = uploadedResumeUrl.secure_url;

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: userData.resume,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};

// Get all users for company (for interview scheduling)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('_id name email image');

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Update user profile (phone, location, bio, and optional image)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { name, phone, location, bio } = req.body;
    const imageFile = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof location === 'string') user.location = location.trim();
    if (typeof bio === 'string') user.bio = bio;

    if (imageFile) {
      try {
        const uploaded = await cloudinary.uploader.upload(imageFile.path);
        user.image = uploaded.secure_url;
      } catch (err) {
        console.error('Image upload failed:', err);
        return res.status(400).json({ success: false, message: 'Image upload failed' });
      }
    }

    await user.save();

    const freshUser = await User.findById(user._id).select('-password');
    return res.status(200).json({ success: true, message: 'Profile updated', userData: freshUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Save a job (bookmark)
export const saveJob = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Check if already saved
    if (user.savedJobs.includes(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Job already saved",
      });
    }

    user.savedJobs.push(jobId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Job saved successfully",
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error("Save job error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save job",
    });
  }
};

// Unsave a job (remove bookmark)
export const unsaveJob = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove job from savedJobs array
    user.savedJobs = user.savedJobs.filter(
      (savedJobId) => savedJobId.toString() !== jobId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Job removed from saved jobs",
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error("Unsave job error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unsave job",
    });
  }
};

// Get all saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const user = await User.findById(userId).populate({
      path: "savedJobs",
      populate: {
        path: "companyId",
        select: "name email image",
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Saved jobs fetched successfully",
      savedJobs: user.savedJobs,
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs",
    });
  }
};

