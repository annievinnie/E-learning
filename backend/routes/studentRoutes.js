import express from 'express';
import {
  getAllCourses,
  getCourseDetails,
  enrollInCourse,
  getEnrolledCourses,
  unenrollFromCourse,
  getCourseAssignments,
  markModuleComplete,
  getCourseProgress,
  getAllCoursesProgress
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

// Get assignments for a course
router.get('/courses/:courseId/assignments', verifyToken, getCourseAssignments);

// Progress tracking routes
router.post('/courses/:courseId/modules/:moduleId/complete', verifyToken, verifyStudent, markModuleComplete);
router.get('/courses/:courseId/progress', verifyToken, verifyStudent, getCourseProgress);
router.get('/progress', verifyToken, verifyStudent, getAllCoursesProgress);

export default router;

