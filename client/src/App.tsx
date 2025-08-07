import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Joingame from "./pages/Joingame";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Routes for signup, login, and pin entry */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/enter-pin" element={<Joingame />} /> {/* ✅ new route */}
      </Routes>
    </Router>
  );
}

export default App;
