import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Catalogue from "./pages/Catalogue";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetails from "./pages/CourseDetails";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import QuizResult from "./pages/QuizResult";

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
        <Route
          path="/lessons/:id"
          element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id/result"
          element={
            <ProtectedRoute>
              <QuizResult />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;