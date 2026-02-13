import nodemailer from 'nodemailer';

// Create a robust transporter function
const createTransporter = () => {
    // 1. Try Mailtrap (if configured)
    if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
        console.log('📧 Config: Using Mailtrap');
        return nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });
    }

    // 2. Try Gmail (if configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log('📧 Config: Using Gmail');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // 3. Fallback: Console Transport
    console.log('⚠️  Email Config: User/Pass missing. Using Console Transport.');
    return null;
};

// Initialize transporter
let transporter = createTransporter();
let isTransporterVerified = false;

// If we have a real transporter, verify it. If verification fails, fallback to console.
if (transporter) {
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email Verification Failed:', error.message);
            console.log('⚠️  Falling back to Console Transport for emails.');
            console.log('💡 Tip: If using Gmail, ensure you are using an App Password (not your login password).');
            transporter = null; // Force fallback
        } else {
            console.log('✅ Email Server is Ready');
            isTransporterVerified = true;
        }
    });
}

// Wrapper to send mail safely
const safeSendMail = async (mailOptions) => {
    if (transporter && isTransporterVerified) {
        return await transporter.sendMail(mailOptions);
    } else {
        // Console Transport Fallback
        console.log('\n========= 📧 EMAIL SIMULATION (Console) =========');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('--- Content Summary ---');
        // Simple regex to strip HTML tags for cleaner console output
        const textContent = mailOptions.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 100);
        console.log(`Body (preview): ${textContent}...`);

        // Extract OTP if present (simple heuristic)
        const otpMatch = mailOptions.html.match(/>(\d{6})</);
        if (otpMatch) {
            console.log(`🔑 OTP CODE FOUND: ${otpMatch[1]}`);
        }
        console.log('=================================================\n');
        return { messageId: 'console-mock-id' };
    }
};

// Email template header with JobAstra branding
const getEmailHeader = () => `
    <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
        <div style="display: inline-block;">
            <h1 style="margin: 0; color: white; font-size: 36px; font-weight: 800; letter-spacing: -1px; font-family: 'Outfit', sans-serif;">JobAstra</h1>
            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 500; letter-spacing: 0.5px;">✨ Find Your Star</p>
        </div>
    </div>
`;

// Email template footer
const getEmailFooter = () => `
    <div style="background: #f9fafb; padding: 30px 20px; margin-top: 40px; border-top: 1px solid #e5e7eb;">
        <div style="text-align: center; max-width: 600px; margin: 0 auto;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Stay Connected</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Follow us on social media for updates and opportunities</p>
            </div>
            
            <div style="margin: 20px 0;">
                <a href="#" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 50%; text-decoration: none; line-height: 36px; color: white; font-weight: bold;">in</a>
                <a href="#" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 50%; text-decoration: none; line-height: 36px; color: white; font-weight: bold;">𝕏</a>
                <a href="#" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 50%; text-decoration: none; line-height: 36px; color: white; font-weight: bold;">G</a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                    © ${new Date().getFullYear()} JobAstra. All rights reserved.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Privacy Policy</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Terms of Service</a> • 
                    <a href="#" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
                </p>
            </div>
        </div>
    </div>
`;

// Base email wrapper
const wrapEmailContent = (content) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JobAstra</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${getEmailHeader()}
            <div style="padding: 40px 30px;">
                ${content}
            </div>
            ${getEmailFooter()}
        </div>
    </body>
    </html>
`;

/**
 * Send test invitation email to candidate
 */
export const sendTestInvitation = async (candidateEmail, candidateName, testDetails) => {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #dbeafe, #e0e7ff); padding: 16px; border-radius: 50%; margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 28px; font-weight: 700;">You're Invited to Take a Test! 🎯</h2>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">We're excited to see your skills in action</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear <strong style="color: #1f2937;">${candidateName}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            Great news! You've been invited to take an assessment test as part of your application process. This is your opportunity to showcase your expertise and move forward in the hiring journey.
        </p>

        <div style="background: linear-gradient(135deg, #f0f9ff, #faf5ff); border-left: 4px solid #2563eb; padding: 24px; border-radius: 12px; margin: 30px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                📋 Test Details
            </h3>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 16px;">
                <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${testDetails.testTitle}</p>
                <div style="display: grid; gap: 12px; margin-top: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #2563eb; font-size: 20px;">⏱️</span>
                        <span style="color: #6b7280; font-size: 14px;"><strong style="color: #374151;">Duration:</strong> ${testDetails.duration} minutes</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #7c3aed; font-size: 20px;">🎯</span>
                        <span style="color: #6b7280; font-size: 14px;"><strong style="color: #374151;">Total Points:</strong> ${testDetails.totalPoints}</span>
                    </div>
                    ${testDetails.description ? `
                        <div style="margin-top: 8px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${testDetails.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                <strong>💡 Pro Tip:</strong> Make sure you have a stable internet connection and allocate enough uninterrupted time before starting the test.
            </p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <a href="${testDetails.testLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 16px 40px; 
                      text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: transform 0.2s;">
                🚀 Start Test Now
            </a>
            <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 13px;">Click the button above to begin your assessment</p>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #374151;">Need Help?</strong><br>
                If you have any questions or encounter any issues, please don't hesitate to contact our support team. We're here to help!
            </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.6;">
            Best of luck! 🍀<br>
            <strong style="color: #1f2937;">The JobAstra Team</strong>
        </p>
    `;

    const mailOptions = {
        from: `"Job Astra" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: `🎯 Test Invitation: ${testDetails.testTitle}`,
        html: wrapEmailContent(content)
    };

    try {
        await safeSendMail(mailOptions);
        console.log('Test invitation sent to:', candidateEmail);
        return { success: true };
    } catch (error) {
        console.error('Error sending test invitation:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send test completion confirmation to candidate
 */
export const sendTestCompletionEmail = async (candidateEmail, candidateName, testDetails, score) => {
    const isHighScore = score >= 70;
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, ${isHighScore ? '#d1fae5' : '#fee2e2'}, ${isHighScore ? '#dbeafe' : '#fef3c7'}); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                ${isHighScore ?
            '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' :
            '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        }
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                ${isHighScore ? 'Excellent Work! 🎉' : 'Test Completed! ✅'}
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">Your test has been successfully submitted</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear <strong style="color: #1f2937;">${candidateName}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            Thank you for completing the assessment! ${isHighScore ? 'Your performance was impressive!' : 'We appreciate the time and effort you put into this test.'}
        </p>

        <div style="background: linear-gradient(135deg, ${isHighScore ? '#ecfdf5' : '#fef3c7'}, ${isHighScore ? '#dbeafe' : '#fee2e2'}); border-radius: 16px; padding: 32px; margin: 30px 0; text-align: center;">
            <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">📊 Your Results</h3>
            
            <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Test Name</p>
                <p style="margin: 0 0 24px 0; color: #1f2937; font-size: 20px; font-weight: 700;">${testDetails.testTitle}</p>
                
                <div style="margin: 24px 0;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Your Score</p>
                    <div style="position: relative; height: 120px; display: flex; align-items: center; justify-content: center;">
                        <div style="position: relative; width: 120px; height: 120px;">
                            <svg width="120" height="120" style="transform: rotate(-90deg);">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                                <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGradient)" stroke-width="8" 
                                        stroke-dasharray="${(score / 100) * 339.292} 339.292" stroke-linecap="round"/>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:${isHighScore ? '#10b981' : '#f59e0b'};stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:${isHighScore ? '#2563eb' : '#ef4444'};stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                <span style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, ${isHighScore ? '#10b981' : '#f59e0b'}, ${isHighScore ? '#2563eb' : '#ef4444'}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${score}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <div>
                        <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 12px; font-weight: 500;">Time Taken</p>
                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${testDetails.timeTaken} min</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 12px; font-weight: 500;">Submitted</p>
                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>

        <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                <strong>📢 What's Next?</strong><br>
                Our recruitment team will carefully review your submission. You'll receive an update about the next steps in your application process within the next few business days.
            </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.6;">
            ${isHighScore ? 'Outstanding performance! ' : ''}Thank you for your interest in joining our team. 🌟<br>
            <strong style="color: #1f2937;">The JobAstra Team</strong>
        </p>
    `;

    const mailOptions = {
        from: `"Job Astra" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: `✅ Test Completed: ${testDetails.testTitle}`,
        html: wrapEmailContent(content)
    };

    try {
        await safeSendMail(mailOptions);
        console.log('Test completion email sent to:', candidateEmail);
        return { success: true };
    } catch (error) {
        console.error('Error sending test completion email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send test results notification to recruiter
 */
export const sendTestResultsToRecruiter = async (recruiterEmail, candidateDetails, testDetails, score) => {
    const isHighScore = score >= 70;
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #dbeafe, #e0e7ff); padding: 16px; border-radius: 50%; margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 28px; font-weight: 700;">New Test Submission 📝</h2>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">A candidate has completed their assessment</p>
        </div>

        <div style="background: linear-gradient(135deg, #f0f9ff, #faf5ff); border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                👤 Candidate Information
            </h3>
            <div style="background: white; border-radius: 8px; padding: 20px;">
                <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Name:</span>
                        <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${candidateDetails.name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #6b7280; font-size: 14px;">Email:</span>
                        <span style="color: #2563eb; font-size: 14px; font-weight: 500;">${candidateDetails.email}</span>
                    </div>
                </div>
            </div>
        </div>

        <div style="background: linear-gradient(135deg, ${isHighScore ? '#ecfdf5' : '#fef3c7'}, ${isHighScore ? '#dbeafe' : '#fee2e2'}); border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                📊 Test Results
            </h3>
            <div style="background: white; border-radius: 8px; padding: 24px;">
                <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${testDetails.testTitle}</p>
                
                <div style="text-align: center; margin: 24px 0;">
                    <div style="display: inline-block; position: relative;">
                        <svg width="100" height="100" style="transform: rotate(-90deg);">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="6"/>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="${isHighScore ? '#10b981' : '#f59e0b'}" stroke-width="6" 
                                    stroke-dasharray="${(score / 100) * 282.743} 282.743" stroke-linecap="round"/>
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <span style="font-size: 28px; font-weight: 700; color: ${isHighScore ? '#10b981' : '#f59e0b'};">${score}%</span>
                        </div>
                    </div>
                    <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 14px;">
                        ${isHighScore ? '🌟 Excellent Performance' : '⚠️ Needs Review'}
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <div>
                        <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 12px; font-weight: 500;">Time Taken</p>
                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${testDetails.timeTaken} minutes</p>
                    </div>
                    <div>
                        <p style="margin: 0 0 4px 0; color: #9ca3af; font-size: 12px; font-weight: 500;">Submitted At</p>
                        <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <a href="${testDetails.evaluationLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 16px 40px; 
                      text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                📋 View Detailed Results
            </a>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #374151;">Action Required:</strong><br>
                Please review the detailed test results and provide feedback to the candidate through the dashboard.
            </p>
        </div>
    `;

    const mailOptions = {
        from: `"Job Astra" <${process.env.EMAIL_USER}>`,
        to: recruiterEmail,
        subject: `📝 Test Submitted: ${candidateDetails.name} - ${testDetails.testTitle}`,
        html: wrapEmailContent(content)
    };

    try {
        await safeSendMail(mailOptions);
        console.log('Test results sent to recruiter:', recruiterEmail);
        return { success: true };
    } catch (error) {
        console.error('Error sending test results to recruiter:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send reminder email for pending test
 */
export const sendTestReminder = async (candidateEmail, candidateName, testDetails, hoursRemaining) => {
    const isUrgent = hoursRemaining <= 24;
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #fef3c7, #fee2e2); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                ${isUrgent ? '⚠️ Urgent Reminder!' : '⏰ Friendly Reminder'}
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">You have a pending test to complete</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear <strong style="color: #1f2937;">${candidateName}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            ${isUrgent ?
            'This is an urgent reminder that your test deadline is approaching soon! Please complete it as soon as possible to avoid missing out on this opportunity.' :
            'Just a friendly reminder that you have a pending test waiting for you. We encourage you to complete it at your earliest convenience.'
        }
        </p>

        <div style="background: linear-gradient(135deg, #fef3c7, #fee2e2); border: 2px solid ${isUrgent ? '#ef4444' : '#f59e0b'}; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background: white; border-radius: 50%; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <span style="font-size: 48px;">⏰</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 500;">TIME REMAINING</p>
                <p style="margin: 0; font-size: 36px; font-weight: 700; color: ${isUrgent ? '#ef4444' : '#f59e0b'};">
                    ${hoursRemaining} ${hoursRemaining === 1 ? 'hour' : 'hours'}
                </p>
            </div>

            <div style="background: white; border-radius: 8px; padding: 20px; margin-top: 20px;">
                <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${testDetails.testTitle}</p>
                <div style="display: grid; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #2563eb;">⏱️</span>
                        <span style="color: #6b7280; font-size: 14px;"><strong>Duration:</strong> ${testDetails.duration} minutes</span>
                    </div>
                </div>
            </div>
        </div>

        ${isUrgent ? `
            <div style="background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                    <strong>⚠️ Important:</strong> This test will expire soon! Make sure to complete it before the deadline to continue with your application process.
                </p>
            </div>
        ` : ''}

        <div style="text-align: center; margin: 40px 0;">
            <a href="${testDetails.testLink}" 
               style="display: inline-block; background: linear-gradient(135deg, ${isUrgent ? '#ef4444' : '#f59e0b'}, ${isUrgent ? '#dc2626' : '#d97706'}); color: white; padding: 18px 48px; 
                      text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); animation: pulse 2s infinite;">
                ${isUrgent ? '🚨 Complete Test Now!' : '📝 Start Test'}
            </a>
            <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 13px;">Don't wait until the last minute!</p>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #374151;">Having Trouble?</strong><br>
                If you're experiencing any technical issues or have questions about the test, please reach out to our support team immediately.
            </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.6;">
            We look forward to reviewing your submission! 🌟<br>
            <strong style="color: #1f2937;">The JobAstra Team</strong>
        </p>
    `;

    const mailOptions = {
        from: `"Job Astra" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: `${isUrgent ? '⚠️ URGENT' : '⏰'} Reminder: Test Deadline Approaching - ${testDetails.testTitle}`,
        html: wrapEmailContent(content)
    };

    try {
        await safeSendMail(mailOptions);
        console.log('Test reminder sent to:', candidateEmail);
        return { success: true };
    } catch (error) {
        console.error('Error sending test reminder:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send evaluation feedback to candidate
 */
export const sendEvaluationFeedback = async (candidateEmail, candidateName, testDetails, feedback) => {
    const isHighScore = feedback.score >= 70;
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, ${isHighScore ? '#d1fae5' : '#fee2e2'}, ${isHighScore ? '#dbeafe' : '#fef3c7'}); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                ${isHighScore ?
            '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13L9 17L19 7" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' :
            '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        }
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                ${isHighScore ? 'Great Job! 🎉' : 'Evaluation Complete 📋'}
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">Your test has been reviewed by our team</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear <strong style="color: #1f2937;">${candidateName}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            We've completed the evaluation of your test submission. ${isHighScore ? 'Your performance was impressive!' : 'Here\'s detailed feedback to help you understand your performance.'}
        </p>

        <div style="background: linear-gradient(135deg, ${isHighScore ? '#ecfdf5' : '#fef3c7'}, ${isHighScore ? '#dbeafe' : '#fee2e2'}); border-radius: 16px; padding: 32px; margin: 30px 0;">
            <h3 style="margin: 0 0 24px 0; color: #1f2937; font-size: 20px; font-weight: 600; text-align: center;">
                ${testDetails.testTitle}
            </h3>
            
            <div style="text-align: center; margin: 32px 0;">
                <div style="display: inline-block; position: relative;">
                    <svg width="140" height="140" style="transform: rotate(-90deg);">
                        <circle cx="70" cy="70" r="60" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                        <circle cx="70" cy="70" r="60" fill="none" stroke="url(#evalGradient)" stroke-width="10" 
                                stroke-dasharray="${(feedback.score / 100) * 376.991} 376.991" stroke-linecap="round"/>
                        <defs>
                            <linearGradient id="evalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:${isHighScore ? '#10b981' : '#f59e0b'};stop-opacity:1" />
                                <stop offset="100%" style="stop-color:${isHighScore ? '#2563eb' : '#ef4444'};stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <span style="font-size: 40px; font-weight: 700; background: linear-gradient(135deg, ${isHighScore ? '#10b981' : '#f59e0b'}, ${isHighScore ? '#2563eb' : '#ef4444'}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${feedback.score}%</span>
                        <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px; font-weight: 500;">FINAL SCORE</p>
                    </div>
                </div>
            </div>
        </div>

        ${feedback.strengths && feedback.strengths.length > 0 ? `
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h4 style="margin: 0 0 16px 0; color: #047857; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    ✅ Your Strengths
                </h4>
                <ul style="margin: 0; padding-left: 24px; color: #065f46;">
                    ${feedback.strengths.map(s => `<li style="margin-bottom: 8px; line-height: 1.5;">${s}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${feedback.improvements && feedback.improvements.length > 0 ? `
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h4 style="margin: 0 0 16px 0; color: #92400e; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    💡 Areas for Improvement
                </h4>
                <ul style="margin: 0; padding-left: 24px; color: #78350f;">
                    ${feedback.improvements.map(i => `<li style="margin-bottom: 8px; line-height: 1.5;">${i}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${feedback.comments ? `
            <div style="background: #f0f9ff; border: 1px solid #2563eb; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    💬 Evaluator's Comments
                </h4>
                <p style="margin: 0; color: #1e3a8a; line-height: 1.6; font-size: 15px;">${feedback.comments}</p>
            </div>
        ` : ''}

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #374151;">What's Next?</strong><br>
                ${isHighScore ?
            'Congratulations on your excellent performance! Our team will be in touch soon regarding the next steps in your application process.' :
            'Thank you for your effort. We appreciate your interest and will keep your application on file for future opportunities that match your skills.'
        }
            </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.6;">
            ${isHighScore ? 'Keep up the great work! 🌟' : 'Best wishes for your career journey! 🚀'}<br>
            <strong style="color: #1f2937;">The JobAstra Team</strong>
        </p>
    `;

    const mailOptions = {
        from: `"Job Astra" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: `📊 Test Feedback: ${testDetails.testTitle}`,
        html: wrapEmailContent(content)
    };

    try {
        await safeSendMail(mailOptions);
        console.log('Evaluation feedback sent to:', candidateEmail);
        return { success: true };
    } catch (error) {
        console.error('Error sending evaluation feedback:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset OTP email
 */
export const sendPasswordResetOTP = async (email, name, otp, userType) => {
    const content = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #fef3c7, #dbeafe); padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 28px; font-weight: 700;">Password Reset Request 🔐</h2>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">We received a request to reset your password</p>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Dear <strong style="color: #1f2937;">${name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset the password for your ${userType === 'candidate' ? 'candidate' : 'recruiter'} account. Use the OTP code below to proceed with resetting your password.
        </p>

        <div style="background: linear-gradient(135deg, #fef3c7, #fee2e2); border: 2px solid #f59e0b; border-radius: 16px; padding: 32px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 16px 0; color: #92400e; font-size: 14px; font-weight: 600; letter-spacing: 1px;">YOUR OTP CODE</p>
            <div style="background: white; border-radius: 12px; padding: 24px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <p style="margin: 0; font-size: 48px; font-weight: 700; letter-spacing: 8px; background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: 'Courier New', monospace;">
                    ${otp}
                </p>
            </div>
            <p style="margin: 16px 0 0 0; color: #92400e; font-size: 13px;">
                ⏰ This code will expire in <strong>10 minutes</strong>
            </p>
        </div>

        <div style="background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure. Your password will not be changed unless you complete the reset process.
            </p>
        </div>

        <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">💡 Security Tips:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                <li>Never share your OTP code with anyone</li>
                <li>JobAstra will never ask for your password via email</li>
                <li>Use a strong, unique password for your account</li>
                <li>Enable two-factor authentication if available</li>
            </ul>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #374151;">Need Help?</strong><br>
                If you're having trouble resetting your password or didn't request this change, please contact our support team immediately.
            </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.6;">
            Stay secure! 🛡️<br>
            <strong style="color: #1f2937;">The JobAstra Team</strong>
        </p>
    `;

    const mailOptions = {
        from: `"Job Astra Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Password Reset OTP - JobAstra',
        html: wrapEmailContent(content)
    };

    try {
        await safeSendMail(mailOptions);
        console.log('Password reset OTP sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendTestInvitation,
    sendTestCompletionEmail,
    sendTestResultsToRecruiter,
    sendTestReminder,
    sendEvaluationFeedback,
    sendPasswordResetOTP
};
