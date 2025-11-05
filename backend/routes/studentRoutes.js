import express from 'express';
import {
  getAllCourses,
  getCourseDetails,
  enrollInCourse,
  getEnrolledCourses,
  unenrollFromCourse
} from '../controllers/studentController.js';
import { verifyToken, verifyStudent } from '../middleware/auth.js';

const router = express.Router();

// Public route - anyone authenticated can browse courses
// Get all available courses (with filtering and search)
router.get('/courses', verifyToken, getAllCourses);

// Get course details by ID
router.get('/courses/:courseId', verifyToken, getCourseDetails);

// Student-only routes
// Enroll in a course
router.post('/courses/:courseId/enroll', verifyToken, verifyStudent, enrollInCourse);

// Get enrolled courses
router.get('/enrolled', verifyToken, verifyStudent, getEnrolledCourses);

// Unenroll from a course
router.delete('/courses/:courseId/enroll', verifyToken, verifyStudent, unenrollFromCourse);

export default router;

