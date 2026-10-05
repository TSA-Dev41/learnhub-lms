import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Catalogue from "./pages/Catalogue";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CourseDetails from "./pages/CourseDetails";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import QuizResult from "./pages/QuizResult";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import ManageCourses from "./pages/admin/ManageCourses";
import CreateCourse from "./pages/admin/CreateCourse";
import EditCourse from "./pages/admin/EditCourse";
import ManageLessons from "./pages/admin/ManageLessons";
import ManageQuizzes from "./pages/admin/ManageQuizzes";
import Students from "./pages/admin/Students";
import StudentDetail from "./pages/admin/StudentDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Enrollments from "./pages/admin/Enrollments";
import Messages from "./pages/admin/Messages";
import Chatbot from "./components/Chatbot";
import FAQ from "./pages/FAQ";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/courses" element={<Catalogue />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/faq" element={<FAQ />} />
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
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="courses" element={<ManageCourses />} />
            <Route path="courses/new" element={<CreateCourse />} />
            <Route path="courses/:id/edit" element={<EditCourse />} />
            <Route path="courses/:id/lessons" element={<ManageLessons />} />
            <Route path="courses/:id/quizzes" element={<ManageQuizzes />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="enrollments" element={<Enrollments />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Routes>
      </div>
      <Chatbot />
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
