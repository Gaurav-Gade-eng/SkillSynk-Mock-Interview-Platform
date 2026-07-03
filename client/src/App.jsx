import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import Result from "./pages/Result";
import ProtectedRoute from "./components/ProtectedRoute";

const Private = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={localStorage.getItem("token") ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/interview/:id" element={<Private><InterviewRoom /></Private>} />
        <Route path="/result/:id" element={<Private><Result /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
