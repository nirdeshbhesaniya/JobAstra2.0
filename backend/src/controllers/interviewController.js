import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment-timezone';
import nodemailer from 'nodemailer';
import ical from 'ical-generator';

// Configure nodemailer
let transporter = null;

// Initialize transporter only if email credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this to your email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
} else {
    console.warn('⚠️  Email credentials not configured. Interview notifications will be disabled.');
}

// Generate Zoom meeting details (simulated)
const generateZoomMeeting = async (title, startTime, duration) => {
    // In a real implementation, you would use Zoom API to create meetings
    // Generate a realistic 10-11 digit meeting ID format like Zoom uses
    const meetingId = Math.floor(Math.random() * 900000000) + 100000000; // 9-digit number
    const formattedMeetingId = meetingId.toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

    // Generate a 6-character alphanumeric password
    const password = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Encode password for URL (basic simulation)
    const encodedPassword = Buffer.from(password).toString('base64').substring(0, 8);

    return {
        meetingId: formattedMeetingId,
        password,
        joinUrl: `https://zoom.us/j/${meetingId}?pwd=${encodedPassword}`,
        startUrl: `https://zoom.us/s/${meetingId}?role=1&pwd=${encodedPassword}`
    };
};

// Send email notification
const sendInterviewEmail = async (interview, type = 'scheduled') => {
    try {
        // Check if transporter is available
        if (!transporter) {
            console.warn('Email transporter not configured. Skipping email notification.');
            return false;
        }

        await interview.populate([
            { path: 'candidateId', select: 'name email' },
            { path: 'recruiterId', select: 'name email' },
            {
                path: 'jobId',
                select: 'title companyId',
                populate: {
                    path: 'companyId',
                    select: 'name'
                }
            }
        ]);

        const candidate = interview.candidateId;
        const recruiter = interview.recruiterId;
        const job = interview.jobId;

        // Create calendar event
        const cal = ical({
            domain: 'yourcompany.com',
            name: 'Interview Calendar',
            timezone: interview.timeZone
        });

        cal.createEvent({
            start: interview.scheduledDate,
            end: interview.endDate,
            summary: `${type === 'scheduled' ? 'Interview' : 'Updated Interview'}: ${job.title}`,
            description: `Interview for ${job.title} position at ${job.companyId?.name || 'Company'}\n\nZoom Meeting Details:\nMeeting ID: ${interview.zoomMeetingId}\nPassword: ${interview.zoomPassword}\nJoin URL: ${interview.zoomJoinUrl}\n\nNotes: ${interview.notes}`,
            location: 'Zoom Meeting',
            organizer: {
                name: recruiter.name,
                email: recruiter.email
            },
            attendees: [
                {
                    name: candidate.name,
                    email: candidate.email,
                    rsvp: true
                }
            ]
        });

        const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Interview ${type === 'scheduled' ? 'Scheduled' : 'Updated'}</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Interview Details</h3>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Company:</strong> ${job.companyId?.name || 'Company'}</p>
          <p><strong>Date & Time:</strong> ${moment(interview.scheduledDate).tz(interview.timeZone).format('MMMM Do, YYYY [at] h:mm A z')}</p>
          <p><strong>Duration:</strong> ${interview.duration} minutes</p>
          <p><strong>Interview Type:</strong> ${interview.interviewType}</p>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">🎥 Zoom Meeting Details</h3>
          <p><strong>Meeting ID:</strong> ${interview.zoomMeetingId}</p>
          <p><strong>Password:</strong> ${interview.zoomPassword}</p>
          <p><strong>Join URL:</strong> <a href="${interview.zoomJoinUrl}" style="color: #1976d2;">${interview.zoomJoinUrl}</a></p>
        </div>

        ${interview.notes ? `
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #f57c00; margin-top: 0;">📝 Additional Notes</h3>
            <p>${interview.notes}</p>
          </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${interview.zoomJoinUrl}" 
             style="background: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Join Interview
          </a>
        </div>

        <div style="background: #f1f3f4; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #666;">
          <p><strong>Tips for your interview:</strong></p>
          <ul>
            <li>Test your audio and video before the meeting</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Join a few minutes early</li>
            <li>Prepare your questions and have your resume ready</li>
          </ul>
        </div>

        <p style="text-align: center; color: #666; font-size: 14px;">
          If you need to reschedule, please contact us as soon as possible.
        </p>
      </div>
    `;

        // Send email to candidate
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: candidate.email,
            cc: recruiter.email,
            subject: `Interview ${type === 'scheduled' ? 'Scheduled' : 'Updated'}: ${job.title}`,
            html: emailContent,
            attachments: [
                {
                    filename: 'interview.ics',
                    content: cal.toString(),
                    contentType: 'text/calendar'
                }
            ]
        });

        return true;
    } catch (error) {
        console.error('Error sending interview email:', error);
        return false;
    }
};

// Schedule a new interview
export const scheduleInterview = async (req, res) => {
    try {
        const {
            jobId,
            candidateId,
            title,
            description,
            scheduledDate,
            duration = 60,
            timeZone = 'UTC',
            interviewType = 'screening',
            notes,
            zoomMeetingId,
            zoomPassword,
            zoomJoinUrl
        } = req.body;

        const recruiterId = req.companyData._id;

        // Validate required fields
        if (!jobId || !candidateId || !title || !scheduledDate || !zoomMeetingId || !zoomPassword) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields. Job, candidate, title, scheduled date, Zoom meeting ID, and password are required.'
            });
        }

        // Check if job exists and belongs to the recruiter
        const job = await Job.findOne({ _id: jobId, companyId: recruiterId });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or unauthorized'
            });
        }

        // Check if candidate exists
        const candidate = await User.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Check for scheduling conflicts
        const conflictingInterview = await Interview.findOne({
            $or: [
                { candidateId, scheduledDate: new Date(scheduledDate), status: { $in: ['scheduled', 'rescheduled'] } },
                { recruiterId, scheduledDate: new Date(scheduledDate), status: { $in: ['scheduled', 'rescheduled'] } }
            ]
        });

        if (conflictingInterview) {
            return res.status(409).json({
                success: false,
                message: 'Time slot already booked. Please choose a different time.'
            });
        }

        // Generate or use provided Zoom meeting details
        let finalZoomMeetingId, finalZoomPassword, finalZoomJoinUrl;

        if (zoomMeetingId && zoomPassword) {
            // Use manually provided Zoom details
            finalZoomMeetingId = zoomMeetingId;
            finalZoomPassword = zoomPassword;
            finalZoomJoinUrl = zoomJoinUrl || `https://zoom.us/j/${zoomMeetingId.replace(/\s/g, '')}`;
        } else {
            // Generate Zoom meeting (fallback)
            const zoomMeeting = await generateZoomMeeting(title, scheduledDate, duration);
            finalZoomMeetingId = zoomMeeting.meetingId;
            finalZoomPassword = zoomMeeting.password;
            finalZoomJoinUrl = zoomMeeting.joinUrl;
        }

        // Create interview
        const interview = new Interview({
            jobId,
            recruiterId,
            candidateId,
            title,
            description,
            scheduledDate: new Date(scheduledDate),
            duration,
            timeZone,
            interviewType,
            notes,
            zoomMeetingId: finalZoomMeetingId,
            zoomPassword: finalZoomPassword,
            zoomJoinUrl: finalZoomJoinUrl,
            zoomStartUrl: finalZoomJoinUrl // For recruiters, start URL can be same as join URL
        });

        await interview.save();

        // Send email notification
        const emailSent = await sendInterviewEmail(interview, 'scheduled');
        if (emailSent) {
            interview.emailSent = true;
            await interview.save();
        }

        // Populate for response
        await interview.populate([
            { path: 'candidateId', select: 'name email phone' },
            {
                path: 'jobId',
                select: 'title companyId',
                populate: {
                    path: 'companyId',
                    select: 'name'
                }
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Interview scheduled successfully',
            interview
        });

    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule interview'
        });
    }
};

// Get interviews for candidate
export const getCandidateInterviews = async (req, res) => {
    try {
        const candidateId = req.userData._id;
        const { startDate, endDate, status } = req.query;

        let query = { candidateId };

        // Filter by date range
        if (startDate && endDate) {
            query.scheduledDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const interviews = await Interview.find(query)
            .populate({
                path: 'jobId',
                select: 'title location companyId',
                populate: {
                    path: 'companyId',
                    select: 'name'
                }
            })
            .populate('recruiterId', 'name email phone')
            .sort({ scheduledDate: 1 });

        res.json({
            success: true,
            interviews
        });

    } catch (error) {
        console.error('Error fetching candidate interviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch interviews'
        });
    }
};

// Get interviews for recruiter
export const getRecruiterInterviews = async (req, res) => {
    try {
        const recruiterId = req.companyData._id;
        const { startDate, endDate, status, jobId } = req.query;

        let query = { recruiterId };

        // Filter by date range
        if (startDate && endDate) {
            query.scheduledDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by job
        if (jobId) {
            query.jobId = jobId;
        }

        const interviews = await Interview.find(query)
            .populate('candidateId', 'name email phone')
            .populate('jobId', 'title')
            .sort({ scheduledDate: 1 });

        res.json({
            success: true,
            interviews
        });

    } catch (error) {
        console.error('Error fetching recruiter interviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch interviews'
        });
    }
};

// Update interview status
export const updateInterviewStatus = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { status, feedback, notes } = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Update fields
        if (status) interview.status = status;
        if (feedback) interview.feedback = feedback;
        if (notes) interview.notes = notes;

        await interview.save();

        res.json({
            success: true,
            message: 'Interview updated successfully',
            interview
        });

    } catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update interview'
        });
    }
};

// Reschedule interview
export const rescheduleInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { newDate, reason } = req.body;
        const userId = req.userData?._id || req.companyData?._id;
        const userType = req.userData ? 'User' : 'Company';

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Check authorization
        if (interview.candidateId.toString() !== userId && interview.recruiterId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to reschedule this interview'
            });
        }

        // Check for conflicts
        const conflictingInterview = await Interview.findOne({
            _id: { $ne: interviewId },
            $or: [
                { candidateId: interview.candidateId, scheduledDate: new Date(newDate), status: { $in: ['scheduled', 'rescheduled'] } },
                { recruiterId: interview.recruiterId, scheduledDate: new Date(newDate), status: { $in: ['scheduled', 'rescheduled'] } }
            ]
        });

        if (conflictingInterview) {
            return res.status(409).json({
                success: false,
                message: 'Time slot already booked. Please choose a different time.'
            });
        }

        // Add to reschedule history
        interview.rescheduleHistory.push({
            previousDate: interview.scheduledDate,
            newDate: new Date(newDate),
            reason,
            rescheduledBy: userId,
            userType
        });

        // Update interview
        interview.scheduledDate = new Date(newDate);
        interview.status = 'rescheduled';
        await interview.save();

        // Send email notification
        await sendInterviewEmail(interview, 'rescheduled');

        res.json({
            success: true,
            message: 'Interview rescheduled successfully',
            interview
        });

    } catch (error) {
        console.error('Error rescheduling interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reschedule interview'
        });
    }
};

// Cancel interview
export const cancelInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { reason } = req.body;

        console.log('Request auth data:', {
            hasUserData: !!req.userData,
            hasCompanyData: !!req.companyData,
            userData: req.userData?._id,
            companyData: req.companyData?._id
        });

        // Determine user type and ID
        let userId;
        let userType;

        if (req.userData) {
            userId = req.userData._id;
            userType = 'candidate';
        } else if (req.companyData) {
            userId = req.companyData._id;
            userType = 'recruiter';
        } else {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        console.log('Cancel interview request:', { interviewId, reason, userId, userType });

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            console.log('Interview not found:', interviewId);
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Check authorization based on user type
        const candidateIdStr = interview.candidateId.toString();
        const recruiterIdStr = interview.recruiterId.toString();
        const userIdStr = userId.toString();

        console.log('Authorization check:', { candidateIdStr, recruiterIdStr, userIdStr, userType });

        let isAuthorized = false;
        if (userType === 'candidate' && candidateIdStr === userIdStr) {
            isAuthorized = true;
        } else if (userType === 'recruiter' && recruiterIdStr === userIdStr) {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            console.log('Unauthorized access - user is not authorized to cancel this interview');
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to cancel this interview'
            });
        }

        interview.status = 'cancelled';
        interview.notes = `${interview.notes}\n\nCancellation reason: ${reason}`;
        await interview.save();

        res.json({
            success: true,
            message: 'Interview cancelled successfully'
        });

    } catch (error) {
        console.error('Error cancelling interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel interview'
        });
    }
};

// Get upcoming interviews (dashboard)
export const getUpcomingInterviews = async (req, res) => {
    try {
        const userId = req.userData?._id || req.companyData?._id;
        const userType = req.userData ? 'candidate' : 'recruiter';
        const limit = parseInt(req.query.limit) || 5;

        let query;
        let populateFields;

        if (userType === 'candidate') {
            query = {
                candidateId: userId,
                scheduledDate: { $gte: new Date() },
                status: { $in: ['scheduled', 'rescheduled'] }
            };
            populateFields = [
                {
                    path: 'jobId',
                    select: 'title companyId',
                    populate: {
                        path: 'companyId',
                        select: 'name'
                    }
                },
                { path: 'recruiterId', select: 'name email' }
            ];
        } else {
            query = {
                recruiterId: userId,
                scheduledDate: { $gte: new Date() },
                status: { $in: ['scheduled', 'rescheduled'] }
            };
            populateFields = [
                { path: 'candidateId', select: 'name email' },
                { path: 'jobId', select: 'title' }
            ];
        }

        const interviews = await Interview.find(query)
            .populate(populateFields)
            .sort({ scheduledDate: 1 })
            .limit(limit);

        res.json({
            success: true,
            interviews
        });

    } catch (error) {
        console.error('Error fetching upcoming interviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming interviews'
        });
    }
};

// Delete interview (only for cancelled interviews)
export const deleteInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { companyData } = req;

        console.log('Delete Interview Request:', {
            interviewId,
            companyId: companyData?._id,
            authToken: req.headers.token ? 'Present' : 'Missing'
        });

        // Find the interview
        const interview = await Interview.findById(interviewId)
            .populate('jobId')
            .populate('candidateId', 'name email');

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Check if company has permission to delete this interview
        if (interview.jobId.companyId.toString() !== companyData._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this interview'
            });
        }

        // Only allow deletion of cancelled interviews
        if (interview.status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Only cancelled interviews can be deleted'
            });
        }

        // Delete the interview
        await Interview.findByIdAndDelete(interviewId);

        console.log('Interview deleted successfully:', interviewId);

        res.json({
            success: true,
            message: 'Interview deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete interview'
        });
    }
};
