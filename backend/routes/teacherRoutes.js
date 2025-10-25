import express from "express";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
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

// Middleware to verify teacher role
const verifyTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: "Access denied. Teacher role required." });
  }
  next();
};

// ==================== COURSE CRUD OPERATIONS ====================

// GET /api/courses - Get all courses for the teacher
router.get("/courses", verifyToken, verifyTeacher, async (req, res) => {
  try {
    console.log('📚 Fetching courses for teacher:', req.user.id);
    const courses = await Course.find({ teacher: req.user.id }).sort({ createdAt: -1 });
    console.log('✅ Found courses:', courses.length);
    res.json({ courses });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// GET /api/courses/:id - Get a specific course with modules and videos
router.get("/courses/:id", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('📖 Fetching course:', courseId, 'for teacher:', req.user.id);
    
    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    
    console.log('✅ Found course with', course.modules.length, 'modules');
    res.json({ course });
  } catch (error) {
    console.error("❌ Error fetching course:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// POST /api/courses - Create a new course
router.post("/courses", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, duration, level } = req.body;
    console.log('➕ Creating course for teacher:', req.user.id);
    console.log('📝 Course data:', { title, description, duration, level });

    if (!title || !description || !duration) {
      return res.status(400).json({ message: "Title, description, and duration are required." });
    }

    const newCourse = new Course({
      title,
      description,
      duration,
      level: level || 'beginner',
      teacher: req.user.id,
      status: 'active',
      modules: []
    });

    await newCourse.save();
    console.log('✅ Course created successfully:', newCourse._id);
    res.status(201).json({ message: "Course created successfully!", course: newCourse });
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// PUT /api/courses/:id - Update a course
router.put("/courses/:id", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, duration, level } = req.body;
    const courseId = req.params.id;
    
    console.log('✏️ Updating course:', courseId, 'for teacher:', req.user.id);

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.duration = duration || course.duration;
    course.level = level || course.level;
    course.updatedAt = new Date();

    await course.save();
    console.log('✅ Course updated successfully');
    res.json({ message: "Course updated successfully!", course });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// DELETE /api/courses/:id - Delete a course
router.delete("/courses/:id", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('🗑️ Deleting course:', courseId, 'for teacher:', req.user.id);

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    await Course.findByIdAndDelete(courseId);
    console.log('✅ Course deleted successfully');
    res.json({ message: "Course deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ==================== MODULE CRUD OPERATIONS ====================

// GET /api/courses/:courseId/modules - Get modules for a specific course
router.get("/courses/:courseId/modules", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    console.log('📋 Fetching modules for course:', courseId, 'for teacher:', req.user.id);
    
    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    
    console.log('✅ Found course with', course.modules.length, 'modules');
    res.json({ modules: course.modules });
  } catch (error) {
    console.error("❌ Error fetching modules:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// POST /api/courses/:courseId/modules - Add a module to a course
router.post("/courses/:courseId/modules", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const courseId = req.params.courseId;
    
    console.log('➕ Adding module to course:', courseId, 'for teacher:', req.user.id);
    console.log('📝 Module data:', { title, description, order });

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const newModule = {
      title,
      description,
      order: order || (course.modules.length + 1),
      videos: [],
      createdAt: new Date()
    };

    course.modules.push(newModule);
    course.updatedAt = new Date();
    await course.save();
    
    console.log('✅ Module created successfully. Course now has', course.modules.length, 'modules');
    res.status(201).json({ message: "Module created successfully!", module: newModule });
  } catch (error) {
    console.error("❌ Error creating module:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// PUT /api/courses/:courseId/modules/:moduleId - Update a module
router.put("/courses/:courseId/modules/:moduleId", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const { courseId, moduleId } = req.params;
    
    console.log('✏️ Updating module:', moduleId, 'in course:', courseId);

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    module.title = title || module.title;
    module.description = description || module.description;
    module.order = order || module.order;
    course.updatedAt = new Date();

    await course.save();
    console.log('✅ Module updated successfully');
    res.json({ message: "Module updated successfully!", module });
  } catch (error) {
    console.error("❌ Error updating module:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// DELETE /api/courses/:courseId/modules/:moduleId - Delete a module from a course
router.delete("/courses/:courseId/modules/:moduleId", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    console.log('🗑️ Deleting module:', moduleId, 'from course:', courseId);

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    course.modules = course.modules.filter(module => module._id.toString() !== moduleId);
    course.updatedAt = new Date();
    await course.save();

    console.log('✅ Module deleted successfully');
    res.json({ message: "Module deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting module:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ==================== VIDEO CRUD OPERATIONS ====================

// GET /api/courses/:courseId/modules/:moduleId/videos - Get videos for a specific module
router.get("/courses/:courseId/modules/:moduleId/videos", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    console.log('🎥 Fetching videos for module:', moduleId, 'in course:', courseId);
    
    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    console.log('✅ Found module with', module.videos.length, 'videos');
    res.json({ videos: module.videos });
  } catch (error) {
    console.error("❌ Error fetching videos:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// POST /api/courses/:courseId/modules/:moduleId/videos - Add a video to a module
router.post("/courses/:courseId/modules/:moduleId/videos", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, duration, order } = req.body;
    const { courseId, moduleId } = req.params;
    
    console.log('➕ Adding video to module:', moduleId, 'in course:', courseId, 'for teacher:', req.user.id);
    console.log('📝 Video data:', { title, description, duration, order });

    if (!title || !description || !duration) {
      return res.status(400).json({ message: "Title, description, and duration are required." });
    }

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    const newVideo = {
      title,
      description,
      duration,
      order: order || (module.videos.length + 1),
      videoUrl: `placeholder-video-url-${Date.now()}`, // Placeholder for now
      uploadedAt: new Date()
    };

    module.videos.push(newVideo);
    course.updatedAt = new Date();
    await course.save();
    
    console.log('✅ Video created successfully. Module now has', module.videos.length, 'videos');
    res.status(201).json({ message: "Video uploaded successfully!", video: newVideo });
  } catch (error) {
    console.error("❌ Error uploading video:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// PUT /api/courses/:courseId/modules/:moduleId/videos/:videoId - Update a video
router.put("/courses/:courseId/modules/:moduleId/videos/:videoId", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, duration, order } = req.body;
    const { courseId, moduleId, videoId } = req.params;
    
    console.log('✏️ Updating video:', videoId, 'in module:', moduleId);

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    const video = module.videos.id(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found." });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.duration = duration || video.duration;
    video.order = order || video.order;
    course.updatedAt = new Date();

    await course.save();
    console.log('✅ Video updated successfully');
    res.json({ message: "Video updated successfully!", video });
  } catch (error) {
    console.error("❌ Error updating video:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// DELETE /api/courses/:courseId/modules/:moduleId/videos/:videoId - Delete a video from a module
router.delete("/courses/:courseId/modules/:moduleId/videos/:videoId", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { courseId, moduleId, videoId } = req.params;
    console.log('🗑️ Deleting video:', videoId, 'from module:', moduleId);

    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    module.videos = module.videos.filter(video => video._id.toString() !== videoId);
    course.updatedAt = new Date();
    await course.save();

    console.log('✅ Video deleted successfully');
    res.json({ message: "Video deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting video:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ==================== ASSIGNMENT CRUD OPERATIONS ====================

// GET /api/assignments - Get all assignments for the teacher
router.get("/assignments", verifyToken, verifyTeacher, async (req, res) => {
  try {
    console.log('📝 Fetching assignments for teacher:', req.user.id);
    const assignments = await Assignment.find({ teacher: req.user.id })
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    console.log('✅ Found assignments:', assignments.length);
    res.json({ assignments });
  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// GET /api/assignments/:id - Get a specific assignment
router.get("/assignments/:id", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    console.log('📖 Fetching assignment:', assignmentId, 'for teacher:', req.user.id);
    
    const assignment = await Assignment.findOne({ _id: assignmentId, teacher: req.user.id })
      .populate('course', 'title');
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }
    
    console.log('✅ Found assignment:', assignment.title);
    res.json({ assignment });
  } catch (error) {
    console.error("❌ Error fetching assignment:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// POST /api/assignments - Create a new assignment
router.post("/assignments", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, dueDate, courseId, maxPoints } = req.body;
    console.log('➕ Creating assignment for teacher:', req.user.id);
    console.log('📝 Assignment data:', { title, description, dueDate, courseId, maxPoints });

    if (!title || !description || !dueDate || !courseId) {
      return res.status(400).json({ message: "Title, description, due date, and course are required." });
    }

    // Verify the course belongs to the teacher
    const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      course: courseId,
      teacher: req.user.id,
      maxPoints: maxPoints || 100,
      submissions: []
    });

    await newAssignment.save();
    await newAssignment.populate('course', 'title');
    
    console.log('✅ Assignment created successfully:', newAssignment._id);
    res.status(201).json({ message: "Assignment created successfully!", assignment: newAssignment });
  } catch (error) {
    console.error("❌ Error creating assignment:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// PUT /api/assignments/:id - Update an assignment
router.put("/assignments/:id", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const { title, description, dueDate, courseId, maxPoints } = req.body;
    const assignmentId = req.params.id;
    
    console.log('✏️ Updating assignment:', assignmentId, 'for teacher:', req.user.id);

    const assignment = await Assignment.findOne({ _id: assignmentId, teacher: req.user.id });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    // If courseId is being updated, verify the new course belongs to the teacher
    if (courseId && courseId !== assignment.course.toString()) {
      const course = await Course.findOne({ _id: courseId, teacher: req.user.id });
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }
    }

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.course = courseId || assignment.course;
    assignment.maxPoints = maxPoints || assignment.maxPoints;
    assignment.updatedAt = new Date();

    await assignment.save();
    await assignment.populate('course', 'title');
    
    console.log('✅ Assignment updated successfully');
    res.json({ message: "Assignment updated successfully!", assignment });
  } catch (error) {
    console.error("❌ Error updating assignment:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// DELETE /api/assignments/:id - Delete an assignment
router.delete("/assignments/:id", verifyToken, verifyTeacher, async (req, res) => {
  try {
    const assignmentId = req.params.id;
    console.log('🗑️ Deleting assignment:', assignmentId, 'for teacher:', req.user.id);

    const assignment = await Assignment.findOne({ _id: assignmentId, teacher: req.user.id });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    await Assignment.findByIdAndDelete(assignmentId);
    console.log('✅ Assignment deleted successfully');
    res.json({ message: "Assignment deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting assignment:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;