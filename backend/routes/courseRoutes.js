import express from 'express';
import {
  getTeacherCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModuleToCourse,
  updateModule,
  deleteModule,
  addVideoToModule,
  updateVideo,
  deleteVideo
} from '../controllers/courseController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to verify teacher role
const verifyTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Teacher role required." 
    });
  }
  next();
};

// Course routes
router.get('/', verifyToken, verifyTeacher, getTeacherCourses);
router.get('/:courseId', verifyToken, verifyTeacher, getCourseById);
router.post('/', verifyToken, verifyTeacher, createCourse);
router.put('/:courseId', verifyToken, verifyTeacher, updateCourse);
router.delete('/:courseId', verifyToken, verifyTeacher, deleteCourse);

// Module routes
router.post('/:courseId/modules', verifyToken, verifyTeacher, addModuleToCourse);
router.put('/:courseId/modules/:moduleId', verifyToken, verifyTeacher, updateModule);
router.delete('/:courseId/modules/:moduleId', verifyToken, verifyTeacher, deleteModule);

// Video routes
router.post('/:courseId/modules/:moduleId/videos', verifyToken, verifyTeacher, addVideoToModule);
router.put('/:courseId/modules/:moduleId/videos/:videoId', verifyToken, verifyTeacher, updateVideo);
router.delete('/:courseId/modules/:moduleId/videos/:videoId', verifyToken, verifyTeacher, deleteVideo);

export default router;
