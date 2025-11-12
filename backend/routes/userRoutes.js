import express from "express";
import User from "../models/User.js";
import { 
  signupUser, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  submitTeacherApplication,
  getPendingTeacherApplications,
  approveTeacherApplication,
  rejectTeacherApplication,
  getRejectedTeacherApplications,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getDashboardStats,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getAllCourses,
  deleteCourseAdmin,
  getTeacherRevenue
} from "../controllers/userController.js";
import { uploadProfilePicture as uploadProfilePictureMiddleware } from "../middleware/profilePictureUploadMiddleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  next();
};

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateProfile);
router.post("/profile/picture", verifyToken, uploadProfilePictureMiddleware, uploadProfilePicture);

// Public teacher application route
router.post("/teacher/apply", (req, res, next) => {
  console.log("=== TEACHER APPLICATION ROUTE HIT ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Original URL:", req.originalUrl);
  console.log("Request body:", req.body);
  console.log("=====================================");
  next();
}, submitTeacherApplication);

// Admin routes for teacher application management
router.get("/admin/pending-teachers", verifyToken, getPendingTeacherApplications);
router.get("/admin/rejected-teachers", verifyToken, getRejectedTeacherApplications);
router.post("/admin/approve-teacher/:applicationId", verifyToken, approveTeacherApplication);
router.post("/admin/reject-teacher/:applicationId", verifyToken, rejectTeacherApplication);

// Admin routes for teacher CRUD operations
router.get("/admin/teachers", verifyToken, getAllTeachers);
router.post("/admin/teachers", verifyToken, createTeacher);
router.put("/admin/teachers/:teacherId", verifyToken, updateTeacher);
router.delete("/admin/teachers/:teacherId", verifyToken, deleteTeacher);

// Admin routes for dashboard and management
router.get("/admin/dashboard/stats", verifyToken, getDashboardStats);
router.get("/admin/students", verifyToken, getAllStudents);
router.put("/admin/students/:studentId", verifyToken, updateStudent);
router.delete("/admin/students/:studentId", verifyToken, deleteStudent);
router.get("/admin/courses", verifyToken, getAllCourses);
router.delete("/admin/courses/:courseId", verifyToken, deleteCourseAdmin);
router.get("/admin/payments/teachers", verifyToken, getTeacherRevenue);
//router.post("/admin/teachers/:teacherId/set-password", verifyToken, verifyAdmin, setTeacherPassword);

export default router;