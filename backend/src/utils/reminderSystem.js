import cron from 'node-cron';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';

// Configure nodemailer
let transporter = null;

// Initialize transporter only if email credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
} else {
    console.warn('⚠️  Email credentials not configured. Interview reminders will be disabled.');
}

// Send reminder email
const sendReminderEmail = async (interview, recipientType = 'candidate') => {
    try {
        // Check if transporter is available
        if (!transporter) {
            console.warn('Email transporter not configured. Skipping reminder email.');
            return false;
        }

        await interview.populate([
            { path: 'candidateId', select: 'name email' },
            { path: 'recruiterId', select: 'name email' },
            { path: 'jobId', select: 'title company' }
        ]);

        const candidate = interview.candidateId;
        const recruiter = interview.recruiterId;
        const job = interview.jobId;

        const recipient = recipientType === 'candidate' ? candidate : recruiter;
        const timeUntilInterview = moment(interview.scheduledDate).diff(moment(), 'hours');

        let subject, content;

        if (timeUntilInterview <= 1) {
            subject = `🚨 Interview Starting Soon: ${job.title}`;
            content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⏰ Interview Starting Soon!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your interview is in less than 1 hour</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #495057; margin-top: 0;">Interview Details</h3>
              <p><strong>Position:</strong> ${job.title}</p>
              <p><strong>Company:</strong> ${job.company}</p>
              <p><strong>Time:</strong> ${moment(interview.scheduledDate).format('h:mm A')}</p>
              <p><strong>Duration:</strong> ${interview.duration} minutes</p>
            </div>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1976d2; margin-top: 0;">🎥 Join Now</h3>
              <p><strong>Meeting ID:</strong> ${interview.zoomMeetingId}</p>
              <p><strong>Password:</strong> ${interview.zoomPassword}</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${interview.zoomJoinUrl}" 
                   style="background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Join Interview Now
                </a>
              </div>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
              <p style="margin: 0;"><strong>💡 Last-minute checklist:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Test your camera and microphone</li>
                <li>Close unnecessary applications</li>
                <li>Have your documents ready</li>
                <li>Join 2-3 minutes early</li>
              </ul>
            </div>
          </div>
        </div>
      `;
        } else if (timeUntilInterview <= 24) {
            subject = `📅 Interview Reminder: ${job.title} - Tomorrow`;
            content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📅 Interview Tomorrow</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Don't forget about your upcoming interview</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #495057; margin-top: 0;">Interview Details</h3>
              <p><strong>Position:</strong> ${job.title}</p>
              <p><strong>Company:</strong> ${job.company}</p>
              <p><strong>Date:</strong> ${moment(interview.scheduledDate).format('MMMM Do, YYYY')}</p>
              <p><strong>Time:</strong> ${moment(interview.scheduledDate).format('h:mm A')}</p>
              <p><strong>Duration:</strong> ${interview.duration} minutes</p>
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2e7d32; margin-top: 0;">🎯 Preparation Tips</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Research the company and role</li>
                <li>Prepare answers for common questions</li>
                <li>Test your technology setup</li>
                <li>Plan your outfit and location</li>
                <li>Prepare thoughtful questions to ask</li>
              </ul>
            </div>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1976d2; margin-top: 0;">🎥 Meeting Details</h3>
              <p><strong>Meeting ID:</strong> ${interview.zoomMeetingId}</p>
              <p><strong>Password:</strong> ${interview.zoomPassword}</p>
              <p><strong>Join URL:</strong> <a href="${interview.zoomJoinUrl}" style="color: #1976d2;">${interview.zoomJoinUrl}</a></p>
            </div>
          </div>
        </div>
      `;
        }

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipient.email,
            subject,
            html: content
        });

        console.log(`Reminder sent to ${recipient.email} for interview ${interview._id}`);
        return true;
    } catch (error) {
        console.error('Error sending reminder email:', error);
        return false;
    }
};

// Check for interviews and send reminders
const checkAndSendReminders = async () => {
    try {
        const now = moment();
        const oneHourLater = moment().add(1, 'hour');
        const twentyFourHoursLater = moment().add(24, 'hours');

        // Find interviews in the next hour (not reminded yet)
        const upcomingInterviews = await Interview.find({
            scheduledDate: {
                $gte: now.toDate(),
                $lte: oneHourLater.toDate()
            },
            status: { $in: ['scheduled', 'rescheduled'] },
            reminderSent: false
        });

        // Find interviews in the next 24 hours (for daily reminder)
        const tomorrowInterviews = await Interview.find({
            scheduledDate: {
                $gte: twentyFourHoursLater.subtract(1, 'hour').toDate(),
                $lte: twentyFourHoursLater.toDate()
            },
            status: { $in: ['scheduled', 'rescheduled'] }
        });

        // Send 1-hour reminders
        for (const interview of upcomingInterviews) {
            // Send to candidate
            await sendReminderEmail(interview, 'candidate');
            // Send to recruiter
            await sendReminderEmail(interview, 'recruiter');

            // Mark as reminded
            interview.reminderSent = true;
            await interview.save();
        }

        // Send 24-hour reminders
        for (const interview of tomorrowInterviews) {
            await sendReminderEmail(interview, 'candidate');
            await sendReminderEmail(interview, 'recruiter');
        }

        console.log(`Processed ${upcomingInterviews.length} urgent reminders and ${tomorrowInterviews.length} daily reminders`);
    } catch (error) {
        console.error('Error in reminder system:', error);
    }
};

// Update interview statuses based on time
const updateInterviewStatuses = async () => {
    try {
        const now = moment();

        // Mark interviews as completed if they ended more than 30 minutes ago
        const overdueInterviews = await Interview.find({
            scheduledDate: {
                $lt: now.subtract(30, 'minutes').toDate()
            },
            status: 'in-progress'
        });

        for (const interview of overdueInterviews) {
            interview.status = 'completed';
            await interview.save();
        }

        console.log(`Updated ${overdueInterviews.length} overdue interviews to completed`);
    } catch (error) {
        console.error('Error updating interview statuses:', error);
    }
};

// Initialize reminder system
export const initializeReminderSystem = () => {
    // Check for reminders every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('Running interview reminder check...');
        checkAndSendReminders();
    });

    // Update interview statuses every hour
    cron.schedule('0 * * * *', () => {
        console.log('Updating interview statuses...');
        updateInterviewStatuses();
    });

    // Daily cleanup at 2 AM
    cron.schedule('0 2 * * *', () => {
        console.log('Running daily interview cleanup...');
        updateInterviewStatuses();
    });

    console.log('✅ Interview reminder system initialized');
};

export default {
    initializeReminderSystem,
    sendReminderEmail,
    checkAndSendReminders,
    updateInterviewStatuses
};
