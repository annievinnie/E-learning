import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import TeacherPanel from "./pages/TeacherPanel";
import StudentPanel from "./pages/StudentPanel";
import EditCourse from "./pages/EditCourse";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherPanel /></ProtectedRoute>} />
        <Route path="/teacher/course/:id" element={<ProtectedRoute role="teacher"><TeacherPanel /></ProtectedRoute>} />

        <Route path="/student" element={<ProtectedRoute role="student"><StudentPanel /></ProtectedRoute>} />

        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/courses/create" element={<ProtectedRoute role="teacher"><EditCourse /></ProtectedRoute>} />
        <Route path="/courses/edit/:id" element={<ProtectedRoute role="teacher"><EditCourse /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
