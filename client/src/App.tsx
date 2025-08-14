import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login"; 
import Homepage from "./pages/Homepage"; // Importing Homepage component
import Joingame from "./pages/Joingame";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore"; // Importing Explore component
import CreateQuiz from "./pages/CreateQuiz";
import Game from './test/Quizz';
// import VerifyPage from "./pages/VerifyPage";
function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root path to login */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/" element={<Homepage />} /> {/* Set Homepage as the root path */}
        {/* Routes for signup and login */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Joingame />} /> {/* ✅ new route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} /> 
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/verify-page" element={<VerifyPage/>}/>
        <Route path="/game" element={<Game />}  />
        {/* <Route path="/test" element={<ImageUploader />}  /> */}
      </Routes>
    </Router>
  );
}

export default App;
