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
import StudentMerch from "./pages/StudentMerch";
import MerchOrderSuccess from "./pages/MerchOrderSuccess";
import MerchOrderCancel from "./pages/MerchOrderCancel";
import useInactivityLogout from "./hooks/useInactivityLogout";

// Inner component to use the hook inside Router context
function AppContent() {
  // Enable automatic logout after 15 minutes of inactivity
  useInactivityLogout(15 * 60 * 1000); // 15 minutes in milliseconds

  return (
    <>
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
        <Route path="/merch" element={<StudentMerch />} />
        <Route path="/merch/order/success" element={<MerchOrderSuccess />} />
        <Route path="/merch/order/cancel" element={<MerchOrderCancel />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
