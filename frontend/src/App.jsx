import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Catalogue from "./pages/Catalogue";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetails from "./pages/CourseDetails";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/courses" element={<Catalogue />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/" element={<Catalogue />} />
      </Routes>
    </>
  );
}

export default App;