const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

class ChatbotService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/chatbot`;
  }

  // Send message to chatbot
  async sendMessage(message, conversationHistory = []) {
    try {
      const response = await fetch(`${this.baseURL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response from chatbot');
      }

      return {
        success: true,
        message: data.data.message,
        suggestions: data.data.suggestions || [],
        timestamp: data.data.timestamp,
        fallback: data.data.fallback || false
      };
    } catch (error) {
      console.error('Chatbot service error:', error);

      // Return fallback response for better user experience
      return this.getFallbackResponse(message);
    }
  }

  // Get quick suggestions
  async getSuggestions() {
    try {
      const response = await fetch(`${this.baseURL}/suggestions`);
      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to get suggestions');
      }

      return {
        success: true,
        suggestions: data.data
      };
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return {
        success: false,
        suggestions: this.getDefaultSuggestions()
      };
    }
  }

  // Check chatbot health
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();

      return {
        success: data.success,
        status: data.data.status,
        geminiConfigured: data.data.gemini_configured
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        status: 'offline'
      };
    }
  }

  // Fallback response when API is unavailable
  getFallbackResponse(message) {
    const msg = message.toLowerCase();

    const responses = {
      job: {
        message: "🎯 I can help you explore job opportunities on JobAstra! We have openings across India in IT, Finance, Healthcare, and many other sectors. What field interests you?",
        suggestions: ["Software jobs", "Finance roles", "Healthcare careers", "Remote opportunities"]
      },
      resume: {
        message: "📄 Resume tips: Use strong action verbs, quantify achievements, tailor for each job, and ensure ATS compatibility. Need specific guidance for your industry?",
        suggestions: ["Resume templates", "ATS optimization", "Skills section", "Work experience"]
      },
      interview: {
        message: "🎤 Interview preparation is key! Research the company, practice common questions, prepare your own questions, and dress appropriately. What type of interview?",
        suggestions: ["Technical prep", "Behavioral questions", "Company research", "Follow-up tips"]
      },
      salary: {
        message: "💰 Salary ranges in India vary by role and location. Software: ₹6-25 LPA, Marketing: ₹4-15 LPA, Finance: ₹5-20 LPA. Want specific data for your role?",
        suggestions: ["Entry-level pay", "Senior roles", "City comparison", "Negotiation"]
      },
      skills: {
        message: "🚀 In-demand skills include AI/ML, Cloud Computing, Data Analysis, Digital Marketing, and UX Design. Which area would you like to explore?",
        suggestions: ["Tech skills", "Soft skills", "Certifications", "Learning paths"]
      }
    };

    // Find matching response
    for (const [key, response] of Object.entries(responses)) {
      if (msg.includes(key)) {
        return {
          success: true,
          message: response.message,
          suggestions: response.suggestions,
          timestamp: new Date().toISOString(),
          fallback: true
        };
      }
    }

    // Default response
    return {
      success: true,
      message: "👋 Hi! I'm JobBot, your career assistant. I can help with job search, resume building, interview prep, and career guidance. What would you like to know?",
      suggestions: ["Find jobs", "Resume help", "Interview tips", "Career advice"],
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  // Default suggestions when API is unavailable
  getDefaultSuggestions() {
    return [
      {
        category: "Job Search",
        items: ["Browse jobs", "Search by location", "Remote opportunities", "Salary insights"]
      },
      {
        category: "Career Help",
        items: ["Resume tips", "Interview prep", "Skill development", "Career guidance"]
      },
      {
        category: "Platform",
        items: ["Profile setup", "Application tracking", "Notifications", "Account help"]
      }
    ];
  }

  // Validate message before sending
  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message must be a non-empty string' };
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > 1000) {
      return { valid: false, error: 'Message too long (max 1000 characters)' };
    }

    return { valid: true, message: trimmed };
  }

  // Format conversation history for API
  formatConversationHistory(messages, limit = 10) {
    return messages
      .slice(-limit)
      .map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      }));
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

export default chatbotService;
