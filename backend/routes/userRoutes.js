import express from "express";
import User from "../models/User.js";
import { signupUser, loginUser, forgotPassword, resetPassword, getUserProfile, addTeacher, getAllTeachers, updateTeacher, deleteTeacher } from "../controllers/userController.js";
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

// Teacher management routes (admin only)
router.post("/teachers", verifyToken, verifyAdmin, addTeacher);
router.get("/teachers", verifyToken, verifyAdmin, getAllTeachers);
router.put("/teachers/:teacherId", verifyToken, verifyAdmin, updateTeacher);
router.delete("/teachers/:teacherId", verifyToken, verifyAdmin, deleteTeacher);

export default router;
