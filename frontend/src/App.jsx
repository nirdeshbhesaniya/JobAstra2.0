import React from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import About from "./pages/About";
import AllJobs from "./pages/AllJobs";
import Applications from "./pages/Applications";
import ApplyJob from "./pages/ApplyJob";
import CandidatesLogin from "./pages/CandidatesLogin";
import CandidatesSignup from "./pages/CandidatesSignup";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import RecruiterLogin from "./pages/RecruiterLogin";
import RecruiterSignup from "./pages/RecruiterSignup";
import Dashborad from "./pages/Dashborad";
import AddJobs from "./pages/AddJobs";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import RecruiterOverview from "./pages/RecruiterOverview";
import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateOverview from "./pages/CandidateOverview";
import CandidateProfile from "./pages/CandidateProfile";
import SavedJobs from "./pages/SavedJobs";
import InterviewDashboard from "./pages/candidate/InterviewDashboard";
import RecruiterInterviewPage from "./pages/RecruiterInterviewPage";
import Chatbot from "./components/Chatbot/Chatbot";

// MCQ Test System
import MCQTestBuilder from "./components/MCQTestBuilder";
import MCQTestManagement from "./components/MCQTestManagement";
import MCQTestTaking from "./components/MCQTestTaking";
import CandidateTestResults from "./components/CandidateTestResults";
import RecruiterTestResults from "./components/RecruiterTestResults";
import TestsPage from "./pages/TestsPage";
import TestAttemptsPage from "./pages/TestAttemptsPage";
import TestHistoryPage from "./pages/TestHistoryPage";
import CandidateForgotPassword from "./pages/CandidateForgotPassword";
import RecruiterForgotPassword from "./pages/RecruiterForgotPassword";

// Route Protection
import ProtectedRoute from "./components/ProtectedRoute";
import RecruiterProtectedRoute from "./components/RecruiterProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

const App = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/all-jobs/:category" element={<AllJobs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />

        {/* Public Only Routes - Redirect if already logged in */}
        <Route path="/candidate-login" element={<PublicOnlyRoute><CandidatesLogin /></PublicOnlyRoute>} />
        <Route path="/candidate-signup" element={<PublicOnlyRoute><CandidatesSignup /></PublicOnlyRoute>} />
        <Route path="/candidate-forgot-password" element={<PublicOnlyRoute><CandidateForgotPassword /></PublicOnlyRoute>} />
        <Route path="/recruiter-login" element={<PublicOnlyRoute><RecruiterLogin /></PublicOnlyRoute>} />
        <Route path="/recruiter-signup" element={<PublicOnlyRoute><RecruiterSignup /></PublicOnlyRoute>} />
        <Route path="/recruiter-forgot-password" element={<PublicOnlyRoute><RecruiterForgotPassword /></PublicOnlyRoute>} />

        {/* Protected Routes - Require Candidate Login */}
        <Route path="/apply-job/:id" element={<ProtectedRoute><ApplyJob /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />

        {/* Recruiter Dashboard - Require Recruiter Login */}
        <Route path="/dashboard" element={<RecruiterProtectedRoute><Dashborad /></RecruiterProtectedRoute>}>
          <Route path="overview" element={<RecruiterOverview />} />
          <Route path="add-job" element={<AddJobs />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
          <Route path="interviews" element={<RecruiterInterviewPage />} />
          <Route path="tests" element={<MCQTestManagement />} />
          <Route path="test-attempts" element={<TestAttemptsPage />} />
        </Route>

        {/* Candidate Dashboard - Require Candidate Login */}
        <Route path="/candidate-dashboard" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>}>
          <Route path="overview" element={<CandidateOverview />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="interviews" element={<InterviewDashboard />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="test-results" element={<TestHistoryPage />} />
          <Route path="test-results/:attemptId" element={<CandidateTestResults />} />
        </Route>

        {/* MCQ Test Routes - Require Appropriate Login */}
        <Route path="/create-mcq-test" element={<RecruiterProtectedRoute><MCQTestBuilder /></RecruiterProtectedRoute>} />
        <Route path="/edit-mcq-test/:testId" element={<RecruiterProtectedRoute><MCQTestBuilder /></RecruiterProtectedRoute>} />
        <Route path="/take-test/:testId" element={<ProtectedRoute><MCQTestTaking /></ProtectedRoute>} />
        <Route path="/test-results/:attemptId" element={<ProtectedRoute><CandidateTestResults /></ProtectedRoute>} />
        <Route path="/test-attempts/:testId" element={<RecruiterProtectedRoute><TestAttemptsPage /></RecruiterProtectedRoute>} />
        <Route path="/recruiter/test-results/:attemptId" element={<RecruiterProtectedRoute><RecruiterTestResults /></RecruiterProtectedRoute>} />
      </Routes>

      {/* Global Chatbot */}
      <Chatbot />
    </AppLayout>
  );
};

export default App;
