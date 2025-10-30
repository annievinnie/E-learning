import express from "express";
import User from "../models/User.js";
import { 
  signupUser, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  getUserProfile,
  getPendingTeacherApplications,
  approveTeacherApplication,
  rejectTeacherApplication,
  getRejectedTeacherApplications,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from "../controllers/userController.js";
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

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", verifyToken, getUserProfile);

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

export default router;
