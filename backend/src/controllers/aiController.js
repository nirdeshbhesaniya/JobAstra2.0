import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateCoverLetter = async (req, res) => {
    try {
        const { jobId, candidateName, candidateProfile } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required"
            });
        }

        // Fetch job details
        const job = await Job.findById(jobId).populate('companyId', 'name');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Check if Gemini API is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                success: true,
                message: "Cover letter template generated",
                coverLetter: generateFallbackCoverLetter(job, candidateName, candidateProfile)
            });
        }

        // Prepare the prompt for Gemini
        const prompt = `
Generate a professional cover letter for the following job application:

**Job Details:**
- Position: ${job.title}
- Company: ${job.companyId?.name || 'the company'}
- Location: ${job.location}
- Level: ${job.level}
- Category: ${job.category}

**Job Description:**
${job.description}

**Candidate Information:**
- Name: ${candidateName || 'the candidate'}
- Profile: ${candidateProfile || 'Enthusiastic professional seeking new opportunities'}

**Instructions:**
1. Write a compelling, professional cover letter
2. Highlight relevant skills and experience
3. Show enthusiasm for the specific role and company
4. Keep it concise (3-4 paragraphs)
5. Use professional tone
6. Format with markdown for better readability
7. Include proper salutation and closing

Generate the cover letter in markdown format:
`;

        try {
            // Generate content using Gemini
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1000,
                }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const coverLetter = response.text();

            return res.status(200).json({
                success: true,
                message: "Cover letter generated successfully",
                coverLetter: coverLetter
            });

        } catch (aiError) {
            console.log('Gemini API error, using fallback:', aiError.message);

            // Fallback to template-based generation
            return res.status(200).json({
                success: true,
                message: "Cover letter template generated (AI service temporarily unavailable)",
                coverLetter: generateFallbackCoverLetter(job, candidateName, candidateProfile)
            });
        }

    } catch (error) {
        console.error('Cover letter generation error:', error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate cover letter. Please try again."
        });
    }
};

// Fallback cover letter generator
function generateFallbackCoverLetter(job, candidateName, candidateProfile) {
    const name = candidateName || '[Your Name]';
    const company = job.companyId?.name || 'your company';

    return `# Cover Letter

## Dear Hiring Manager,

I am writing to express my strong interest in the **${job.title}** position at **${company}**. ${candidateProfile}

## Why I'm a Great Fit

I am particularly excited about this opportunity because:

- **Relevant Experience**: My background aligns well with the requirements for this ${job.level} position
- **Location Advantage**: Being in ${job.location}, I can contribute effectively to your team
- **Industry Focus**: My passion for ${job.category} drives my commitment to excellence
- **Growth Mindset**: I am eager to contribute to ${company}'s continued success

## What I Bring

I am confident that my skills and enthusiasm make me an ideal candidate for this role. I would welcome the opportunity to discuss how I can contribute to your team's success.

## Next Steps

Thank you for considering my application. I look forward to hearing from you soon.

**Sincerely,**  
${name}

---
*This cover letter was generated to help you get started. Feel free to customize it to better reflect your unique qualifications and experiences.*`;
}
