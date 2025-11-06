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
import { uploadVideo } from '../middleware/uploadMiddleware.js';
import { uploadImage } from '../middleware/imageUploadMiddleware.js';

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
router.post('/', verifyToken, verifyTeacher, uploadImage, createCourse);
router.put('/:courseId', verifyToken, verifyTeacher, uploadImage, updateCourse);
router.delete('/:courseId', verifyToken, verifyTeacher, deleteCourse);

// Module routes
router.post('/:courseId/modules', verifyToken, verifyTeacher, addModuleToCourse);
router.put('/:courseId/modules/:moduleId', verifyToken, verifyTeacher, updateModule);
router.delete('/:courseId/modules/:moduleId', verifyToken, verifyTeacher, deleteModule);

// Video routes (with file upload support)
router.post('/:courseId/modules/:moduleId/videos', verifyToken, verifyTeacher, uploadVideo, addVideoToModule);
router.put('/:courseId/modules/:moduleId/videos/:videoId', verifyToken, verifyTeacher, uploadVideo, updateVideo);
router.delete('/:courseId/modules/:moduleId/videos/:videoId', verifyToken, verifyTeacher, deleteVideo);

export default router;
