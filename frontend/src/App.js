import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
<<<<<<< Updated upstream
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import TeacherPanel from "./pages/TeacherPanel";
import StudentPanel from "./pages/StudentPanel";
import EditCourse from "./pages/EditCourse";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
=======
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
>>>>>>> Stashed changes

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login role="Admin" />} />
        <Route path="/signup" element={<Signup />} />
<<<<<<< Updated upstream

        <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherPanel /></ProtectedRoute>} />
        <Route path="/teacher/course/:id" element={<ProtectedRoute role="teacher"><TeacherPanel /></ProtectedRoute>} />

        <Route path="/student" element={<ProtectedRoute role="student"><StudentPanel /></ProtectedRoute>} />

        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/courses/create" element={<ProtectedRoute role="teacher"><EditCourse /></ProtectedRoute>} />
        <Route path="/courses/edit/:id" element={<ProtectedRoute role="teacher"><EditCourse /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
=======
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
>>>>>>> Stashed changes
      </Routes>
    </BrowserRouter>
  );
}

export default App;
