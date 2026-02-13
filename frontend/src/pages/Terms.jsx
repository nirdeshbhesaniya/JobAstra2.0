import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Shield,
  FileText,
  Users,
  Lock,
  AlertCircle,
  Clock,
  Globe,
  Mail,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle
} from "lucide-react";

const Terms = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const termsData = [
    {
      id: 1,
      icon: FileText,
      title: "Acceptance of Terms",
      summary: "By accessing and using JobAstra, you agree to these terms and conditions.",
      content: `Welcome to JobAstra, India's premier job portal platform. By accessing our website, mobile application, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.

These terms constitute a legally binding agreement between you and JobAstra. If you do not agree with any part of these terms, you must not use our services.

Your continued use of our platform after any modifications to these terms will constitute your acceptance of such changes.`,
      highlight: "Last updated: January 2024"
    },
    {
      id: 2,
      icon: Users,
      title: "User Accounts and Responsibilities",
      summary: "Guidelines for creating and managing your JobAstra account.",
      content: `**Account Creation:**
• You must provide accurate, complete, and current information during registration
• You are responsible for maintaining the confidentiality of your account credentials
• You must be at least 18 years old to create an account
• Each user may maintain only one active account

**User Responsibilities:**
• Keep your profile information up-to-date and accurate
• Use the platform in accordance with applicable laws and regulations
• Respect other users' privacy and intellectual property rights
• Report any suspicious activities or policy violations

**Account Security:**
• Use strong, unique passwords for your account
• Enable two-factor authentication when available
• Immediately notify us of any unauthorized access
• Log out from shared or public devices`,
      highlight: "Your account security is our priority"
    },
    {
      id: 3,
      icon: Shield,
      title: "Job Posting and Application Guidelines",
      summary: "Rules and regulations for job postings and applications on our platform.",
      content: `**For Employers:**
• All job postings must be for legitimate employment opportunities
• Job descriptions must be accurate and not misleading
• Salary ranges and benefits must be clearly stated
• No discrimination based on race, gender, religion, or other protected characteristics
• Posting fees are non-refundable once a job is published

**For Job Seekers:**
• Submit only truthful and accurate information in applications
• Tailor your applications to specific job requirements
• Respect employer preferences and requirements
• Do not spam employers with irrelevant applications
• Maintain professional communication standards

**Prohibited Content:**
• Fraudulent or misleading job posts
• Requests for personal financial information
• Adult content or illegal activities
• Pyramid schemes or multi-level marketing
• Jobs requiring upfront payments from candidates`,
      highlight: "Quality and authenticity matter"
    },
    {
      id: 4,
      icon: Lock,
      title: "Privacy and Data Protection",
      summary: "How we collect, use, and protect your personal information.",
      content: `**Data Collection:**
• Personal information provided during registration
• Professional details in your profile and resume
• Application history and job preferences
• Usage analytics and platform interactions
• Communication records with employers

**Data Usage:**
• Matching you with relevant job opportunities
• Improving our platform and user experience
• Sending notifications about job matches
• Providing customer support services
• Compliance with legal requirements

**Data Protection:**
• Industry-standard encryption for data transmission
• Secure servers with regular security audits
• Limited access to personal data on need-to-know basis
• Regular data backup and recovery procedures
• GDPR and local privacy law compliance

**Your Rights:**
• Access and download your personal data
• Request correction of inaccurate information
• Delete your account and associated data
• Opt-out of marketing communications
• Control visibility of your profile to employers`,
      highlight: "Your privacy is non-negotiable"
    },
    {
      id: 5,
      icon: AlertCircle,
      title: "Platform Rules and Prohibited Activities",
      summary: "Activities that are not allowed on the JobAstra platform.",
      content: `**Strictly Prohibited:**
• Creating fake profiles or impersonating others
• Posting discriminatory or offensive content
• Attempting to circumvent our security measures
• Scraping or automated data collection
• Sharing login credentials with third parties
• Using the platform for illegal activities

**Content Guidelines:**
• Keep all communications professional and respectful
• No spam, promotional content unrelated to jobs
• Respect intellectual property rights
• No harassment or abusive behavior
• Report inappropriate content immediately

**Consequences of Violations:**
• Warning notifications for minor infractions
• Temporary suspension of account privileges
• Permanent account termination for serious violations
• Legal action for illegal activities
• Cooperation with law enforcement when required

**Reporting Violations:**
• Use the report feature on suspicious profiles
• Contact support for urgent safety concerns
• Provide detailed information about violations
• Allow 24-48 hours for investigation and response`,
      highlight: "Fair play creates a better experience for everyone"
    },
    {
      id: 6,
      icon: Globe,
      title: "Service Availability and Modifications",
      summary: "Information about platform availability and our right to make changes.",
      content: `**Service Availability:**
• 99.9% uptime target with scheduled maintenance windows
• Service may be temporarily unavailable for updates
• Emergency maintenance may occur without prior notice
• Some features may be limited in certain geographic regions

**Platform Modifications:**
• We reserve the right to modify or discontinue features
• Major changes will be communicated in advance
• User feedback is considered for platform improvements
• Legacy features may be deprecated with reasonable notice

**Geographic Limitations:**
• Services primarily designed for the Indian job market
• Some features may not be available in all regions
• Local laws and regulations may affect service availability
• Currency and payment methods vary by location

**Third-Party Integrations:**
• Integration with professional social networks
• Payment processing through secure third-party providers
• Analytics and performance monitoring tools
• Customer support and communication platforms`,
      highlight: "We're constantly evolving to serve you better"
    },
    {
      id: 7,
      icon: Clock,
      title: "Limitation of Liability",
      summary: "Understanding the limits of our responsibility and your rights.",
      content: `**Platform Liability:**
• JobAstra serves as a platform connecting job seekers and employers
• We do not guarantee job placement or hiring outcomes
• Users are responsible for verifying employer legitimacy
• We are not liable for disputes between users and employers

**Service Limitations:**
• Platform provided "as is" without warranties
• No guarantee of continuous, error-free operation
• Third-party content accuracy not guaranteed
• External links and integrations beyond our control

**Financial Liability:**
• Liability limited to fees paid for premium services
• No liability for indirect or consequential damages
• Force majeure events beyond reasonable control
• User assumes risk for platform usage decisions

**Dispute Resolution:**
• Good faith effort to resolve disputes amicably
• Mediation preferred before legal proceedings
• Jurisdiction governed by Indian laws
• Class action lawsuits explicitly waived

**User Indemnification:**
• Users agree to indemnify JobAstra against claims
• Protection for lawful use of platform services
• Cooperation required in defense of claims
• Reasonable legal costs may be recoverable`,
      highlight: "Understanding our mutual responsibilities"
    },
    {
      id: 8,
      icon: Mail,
      title: "Contact Information and Support",
      summary: "How to reach us for questions, support, or legal matters.",
      content: `**Customer Support:**
• Email: support@jobastra.com
• Response time: 24-48 hours for most inquiries
• Live chat available during business hours (9 AM - 6 PM IST)
• FAQ section for common questions

**Business Inquiries:**
• Partnership opportunities: partnerships@jobastra.com
• Media and press: media@jobastra.com
• Business development: business@jobastra.com
• Investor relations: investors@jobastra.com

**Legal Matters:**
• Terms violations: legal@jobastra.com
• Privacy concerns: privacy@jobastra.com
• Compliance issues: compliance@jobastra.com
• DMCA notices: dmca@jobastra.com

**Corporate Address:**
JobAstra Technologies Pvt. Ltd.
Innovation Hub, Sector 62
Noida, Uttar Pradesh 201309
India

**Emergency Contact:**
• Security incidents: security@jobastra.com
• Platform abuse: abuse@jobastra.com
• 24/7 emergency hotline: +91-XXX-XXX-XXXX`,
      highlight: "We're here to help you succeed"
    }
  ];

  // Render content with headings (from **Heading:**), bullet lists (•), and paragraphs
  const renderContent = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let listItems = [];
    let paraLines = [];
    let keyIdx = 0;

    const flushList = () => {
      if (listItems.length) {
        elements.push(
          <ul key={`ul-${keyIdx++}`} className="space-y-2 mb-4">
            {listItems.map((item, i) => (
              <li key={`li-${keyIdx}-${i}`} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushPara = () => {
      if (paraLines.length) {
        elements.push(
          <p key={`p-${keyIdx++}`} className="text-gray-600 leading-relaxed mb-4">
            {paraLines.join(' ')}
          </p>
        );
        paraLines = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '') {
        // Paragraph or list boundary
        flushList();
        flushPara();
        continue;
      }

      // Heading like **Title:**
      const headingMatch = line.match(/^\*\*(.+?)\*\*(?::)?$/);
      if (headingMatch) {
        flushList();
        flushPara();
        const headingText = headingMatch[1];
        elements.push(
          <h4 key={`h4-${keyIdx++}`} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
            <strong>{headingText}</strong>
          </h4>
        );
        continue;
      }

      // Bullet start with •
      if (line.startsWith('•')) {
        flushPara();
        const itemText = line.replace(/^•\s*/, '');
        listItems.push(itemText);
        continue;
      }

      // Regular paragraph line
      flushList();
      paraLines.push(line);
    }

    // Flush any remaining content
    flushList();
    flushPara();

    return elements;
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Terms & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Conditions</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Understanding our platform rules, your rights, and responsibilities for a safe and productive job search experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: January 2024</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Applicable worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Terms Content */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Quick Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 mb-12 border border-blue-200/50">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Quick Overview
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  These terms govern your use of JobAstra's platform and services. Key points include account responsibilities,
                  privacy protection, platform rules, and our commitment to connecting job seekers with genuine opportunities.
                  Click on each section below to explore detailed information.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-4">
            {termsData.map((section) => {
              const IconComponent = section.icon;
              const isExpanded = expandedSection === section.id;

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 sm:px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shrink-0">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {section.summary}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="px-6 sm:px-8 pb-6">
                      <div className="border-t border-gray-200 pt-6">
                        <div className="max-w-none">
                          {renderContent(section.content)}
                        </div>

                        {/* Highlight */}
                        {section.highlight && (
                          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-blue-800">
                              💡 {section.highlight}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 sm:p-10 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Questions About Our Terms?
              </h2>
              <p className="text-blue-100 mb-8 leading-relaxed">
                Our legal and support teams are here to help clarify any questions you may have about these terms and conditions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:legal@jobastra.com"
                  className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  Contact Legal Team
                </a>
                <a
                  href="mailto:support@jobastra.com"
                  className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200"
                >
                  General Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Terms;
