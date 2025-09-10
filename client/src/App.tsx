import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Your Existing Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import Joingame from "./pages/Joingame";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import QuizEditorPage from "./pages/QuizEditorPage";
import VerifyCode from "./pages/VerifyCode";
import HistoryPage from "./pages/History";
import GamePage from "./pages/GamePage";
import PerformanceDetailPage from "./pages/PerformanceDetailPage";
import Report from "./pages/Report";
import SettingsPage from "./pages/SettingsPage";
import Library from "./pages/Library";
import MyQuizz from "./pages/MyQuizz";
import ResultPage from "./pages/Result";
import SoloGamePage from "./pages/SoloGamePage";
import { Toaster } from "react-hot-toast";

// Team & Analytics Pages
import TeamDashboardPage from "./pages/TeamDashboardPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import TeamQuizResultPage from "./pages/TeamQuizResultPage";
import TeamSessionResultPage from "./pages/TeamSessionResultPage";
import JoinTeamPage from "./pages/JoinTeamPage";
import QuizHistoryPage from "./pages/QuizHistoryPage";
import QuizzKHDocs from "./pages/DocsPage";
import AboutUs from "./pages/AboutUs";
import ScrollToTop from "./components/common/ScrollToTop";

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading session...
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const PublicRoute: React.FC = () => {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading session...
      </div>
    );
  }
  return <Outlet />;
};

const NotFound: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
    <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
  </div>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />

        {/* --- Public Routes (No Login Required) --- */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/join" element={<Joingame />} />
          <Route path="/docs" element={<QuizzKHDocs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/game/:sessionId" element={<GamePage />} />

          <Route path="/solo/:quizId" element={<SoloGamePage />} />
          <Route path="/solo/session/:sessionId" element={<SoloGamePage />} />

          <Route
            path="/session/:sessionId/performance/guest/:guestName"
            element={<PerformanceDetailPage />}
          />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-quizz" element={<MyQuizz />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/quiz-editor/:quizId" element={<QuizEditorPage />} />
          <Route path="/report/" element={<Report />} />
          <Route path="/library" element={<Library />} />
          <Route
            path="/session/:sessionId/performance"
            element={<PerformanceDetailPage />}
          />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/result/:sessionId" element={<ResultPage />} />
          <Route path="/my-history" element={<QuizHistoryPage />} />

          <Route path="/teams" element={<TeamDashboardPage />} />
          <Route path="/teams/:teamId" element={<TeamManagementPage />} />
          <Route
            path="/teams/:teamId/analytics/quiz/:quizId"
            element={<TeamQuizResultPage />}
          />
          <Route
            path="/teams/:teamId/analytics/session/:sessionId"
            element={<TeamSessionResultPage />}
          />
          <Route path="/join-team/:inviteCode/" element={<JoinTeamPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
