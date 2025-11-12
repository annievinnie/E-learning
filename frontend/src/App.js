import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import ContactUs from "./pages/ContactUs";
import Navbar from "./components/Navbar";
import CourseDetailPage from "./pages/CourseDetailPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import TeacherApplicationForm from "./components/teacher/TeacherApplicationForm";
import StudentMyCourses from "./components/student/StudentMyCourses";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/course/:id" element={<CourseDetailPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/teacher-application" element={<TeacherApplicationForm />} />
        <Route path="/my-courses" element={<StudentMyCourses />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
