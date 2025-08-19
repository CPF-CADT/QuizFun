import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import Joingame from "./pages/Joingame";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import CreateQuiz from "./pages/CreateQuiz";
import Game from './test/Quizz';
import Report from './pages/Report';
import DuringGamePlay from './pages/DuringGamePlay';
import VerifyCode from "./pages/VerifyCode";
import { Rotate3D } from 'lucide-react';
import QuizEditorPage from "./pages/QuizEditorPage";

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
  const { isAuthenticated, isLoading } = useAuth();

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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<VerifyCode />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/join" element={<Joingame />} />
            <Route path="/explore" element={<Explore />} />
            <Route  path="/report" element={<Report />} />
            <Route path="/quiz-editor/:quizId" element={<QuizEditorPage />} />
            <Route path="/game" element={<Game />} /> 
            <Route path="/During-game-play" element={<DuringGamePlay/>}/>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
