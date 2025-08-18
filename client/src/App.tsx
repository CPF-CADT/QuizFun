import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login"; 
import Homepage from "./pages/Homepage";
import Joingame from "./pages/Joingame";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore"; 
import CreateQuiz from "./pages/CreateQuiz";
import Game from './test/Quizz';
import VerifyCode from "./pages/VerifyCode";
import LobbyPage from "./pages/LobbyPage"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Root path goes to Homepage */}
        <Route path="/" element={<Homepage />} />
        
        {/* Auth routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Game routes */}
        <Route path="/enter-pin" element={<Joingame />} /> 
       
        <Route path="/game" element={<Game />} />

        {/* Other routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} /> 
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/verifycode" element={<VerifyCode />} />
        <Route
  path="/lobby"
  element={
    <LobbyPage 
      gamePin="123456"
      players={[]} 
      hostName="Host"
    />
  }
/>
      </Routes>
    </Router>
  );
}

export default App;
