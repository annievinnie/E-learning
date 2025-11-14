import Course from '../models/Course.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all courses for a teacher
export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    const courses = await Course.find({ teacher: teacherId })
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Get teacher courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get a single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.userId || req.user.id;

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    })
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to access it.'
      });
    }

    res.status(200).json({
      success: true,
      course: course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, duration, level, price, category } = req.body;
    const teacherId = req.user.userId || req.user.id;

    // Validation
    if (!title || !description || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and duration are required.'
      });
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create courses.'
      });
    }

    // Handle thumbnail file upload
    let thumbnailPath = '';
    if (req.file) {
      // File was uploaded, save the path
      thumbnailPath = `/uploads/images/${req.file.filename}`;
    } else if (req.body.thumbnail) {
      // URL was provided instead of file
      thumbnailPath = req.body.thumbnail;
    }

    const course = new Course({
      title,
      description,
      duration,
      level: level || 'beginner',
      category: category || 'Other',
      price: price || 0,
      thumbnail: thumbnailPath,
      teacher: teacherId,
      modules: [],
      students: [],
      status: 'active'
    });

    await course.save();

    // Populate the created course
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update a course
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, duration, level, status, price, category } = req.body;
    const teacherId = req.user.userId || req.user.id;

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it.'
      });
    }

    // Handle thumbnail file upload - if new file uploaded, delete old one
    if (req.file) {
      // Delete old thumbnail if it exists and is a local file
      if (course.thumbnail && course.thumbnail.startsWith('/uploads/images/')) {
        const oldThumbnailPath = path.join(__dirname, '..', course.thumbnail);
        if (fs.existsSync(oldThumbnailPath)) {
          try {
            fs.unlinkSync(oldThumbnailPath);
            console.log('✅ Deleted old thumbnail:', oldThumbnailPath);
          } catch (error) {
            console.error('Error deleting old thumbnail:', error);
          }
        }
      }
      // Set new thumbnail path
      course.thumbnail = `/uploads/images/${req.file.filename}`;
    } else if (req.body.thumbnail !== undefined) {
      // URL was provided or field is being cleared
      course.thumbnail = req.body.thumbnail || '';
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (duration) course.duration = duration;
    if (level) course.level = level;
    if (status) course.status = status;
    if (price !== undefined) course.price = price;
    if (category) course.category = category;

    await course.save();

    // Populate the updated course
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.userId || req.user.id;

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to delete it.'
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully.'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Add a module to a course (with video upload)
export const addModuleToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order, duration } = req.body;
    const teacherId = req.user.userId || req.user.id;
    const videoFile = req.file;

    // Validation
    if (!title || !description) {
      // Clean up uploaded file if validation fails
      if (videoFile && videoFile.path) {
        try {
          fs.unlinkSync(videoFile.path);
        } catch (deleteError) {
          console.error('Error deleting video file:', deleteError);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Module title and description are required.'
      });
    }

    // Video file is required
    if (!videoFile) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required for module creation.'
      });
    }

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      // Clean up uploaded file if course not found
      if (videoFile && videoFile.path) {
        try {
          fs.unlinkSync(videoFile.path);
        } catch (deleteError) {
          console.error('Error deleting video file:', deleteError);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it.'
      });
    }

    // Build video data
    const videoData = {
      title: title, // Use module title as video title
      description: description, // Use module description as video description
      videoPath: `/uploads/videos/${videoFile.filename}`,
      videoUrl: '',
      duration: duration || '0:00',
      order: 1,
      uploadedAt: new Date()
    };

    // Calculate the correct order number
    // Sort existing modules by order and get the highest order number
    const sortedModules = [...course.modules].sort((a, b) => (a.order || 0) - (b.order || 0));
    const nextOrder = sortedModules.length > 0 
      ? Math.max(...sortedModules.map(m => m.order || 0)) + 1 
      : 1;

    const newModule = {
      title,
      description,
      order: order || nextOrder,
      video: videoData
    };

    course.modules.push(newModule);
    await course.save();

    // Populate the course before returning
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Module with video added successfully.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Add module error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting video file:', deleteError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update a module
export const updateModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, order } = req.body;
    const teacherId = req.user.userId || req.user.id;

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it.'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found.'
      });
    }

    if (title) module.title = title;
    if (description) module.description = description;
    if (order) module.order = order;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module updated successfully.',
      course: course
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete a module
export const deleteModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const teacherId = req.user.userId || req.user.id;

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it.'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found.'
      });
    }

    // Get the order of the module being deleted
    const deletedOrder = module.order || 0;

    // Remove the module
    course.modules.pull(moduleId);

    // Reorder remaining modules to fill the gap
    // Sort modules by order first
    course.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Renumber modules sequentially starting from 1
    course.modules.forEach((mod, index) => {
      mod.order = index + 1;
    });

    await course.save();

    // Populate the course before returning
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Add a video to a module (with file upload support)
export const addVideoToModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, duration, order, videoUrl } = req.body;
    const teacherId = req.user.userId || req.user.id;

    // Validation
    if (!title || !description || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Video title, description, and duration are required.'
      });
    }

    // Check if video file is uploaded or videoUrl is provided
    const videoFile = req.file;
    if (!videoFile && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either a video file or video URL is required.'
      });
    }

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      // If file was uploaded but course not found, delete the file
      if (videoFile) {
        const filePath = path.join(__dirname, '..', 'uploads', 'videos', videoFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it.'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      // If file was uploaded but module not found, delete the file
      if (videoFile) {
        const filePath = path.join(__dirname, '..', 'uploads', 'videos', videoFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Module not found.'
      });
    }

    // Build video data
    const newVideo = {
      title,
      description,
      duration,
      order: order || module.videos.length + 1,
      videoPath: videoFile ? `/uploads/videos/${videoFile.filename}` : '',
      videoUrl: videoUrl || ''
    };

    module.videos.push(newVideo);
    await course.save();

    // Populate the course before returning
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Video added successfully.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Add video error:', error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '..', 'uploads', 'videos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update a video (with optional file upload support)
export const updateVideo = async (req, res) => {
  try {
    const { courseId, moduleId, videoId } = req.params;
    const { title, description, duration, order, videoUrl } = req.body;
    const teacherId = req.user.userId || req.user.id;
    const videoFile = req.file;

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      // If file was uploaded but course not found, delete the file
      if (videoFile) {
        const filePath = path.join(__dirname, '..', 'uploads', 'videos', videoFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it.'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      // If file was uploaded but module not found, delete the file
      if (videoFile) {
        const filePath = path.join(__dirname, '..', 'uploads', 'videos', videoFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Module not found.'
      });
    }

    const video = module.videos.id(videoId);
    if (!video) {
      // If file was uploaded but video not found, delete the file
      if (videoFile) {
        const filePath = path.join(__dirname, '..', 'uploads', 'videos', videoFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Video not found.'
      });
    }

    // Delete old video file if new one is being uploaded
    if (videoFile && video.videoPath) {
      try {
        const oldFilePath = path.join(__dirname, '..', video.videoPath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (deleteError) {
        console.error('Error deleting old video file:', deleteError);
      }
    }

    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (duration) video.duration = duration;
    if (order) video.order = order;
    if (videoFile) {
      video.videoPath = `/uploads/videos/${videoFile.filename}`;
      video.videoUrl = ''; // Clear videoUrl if file is uploaded
    }
    if (videoUrl && !videoFile) {
      video.videoUrl = videoUrl;
      video.videoPath = ''; // Clear videoPath if URL is provided
    }

    await course.save();

    // Populate the course before returning
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Video updated successfully.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Update video error:', error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '..', 'uploads', 'videos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete a video (also deletes the video file from server)
export const deleteVideo = async (req, res) => {
  try {
    const { courseId, moduleId, videoId } = req.params;
    const teacherId = req.user.userId || req.user.id;

    const course = await Course.findOne({ 
      _id: courseId, 
      teacher: teacherId 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it.'
      });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found.'
      });
    }

    const video = module.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found.'
      });
    }

    // Delete the video file from server if it exists
    if (video.videoPath) {
      try {
        const filePath = path.join(__dirname, '..', video.videoPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted video file: ${filePath}`);
        }
      } catch (deleteError) {
        console.error('Error deleting video file:', deleteError);
        // Continue with deletion even if file deletion fails
      }
    }

    module.videos.pull(videoId);
    await course.save();

    // Populate the course before returning
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher', 'fullName email')
      .populate('students', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get enrolled students for all teacher's courses
export const getEnrolledStudents = async (req, res) => {
  try {
    const teacherId = req.user.userId || req.user.id;
    
    // Get all courses for this teacher
    const courses = await Course.find({ teacher: teacherId })
      .select('_id title students')
      .sort({ createdAt: -1 });
    
    // Process courses and populate student details
    const coursesWithStudents = await Promise.all(
      courses.map(async (course) => {
        // Safety check: ensure students array exists
        if (!course.students || !Array.isArray(course.students) || course.students.length === 0) {
          return {
            courseId: course._id,
            courseTitle: course.title,
            studentCount: 0,
            students: []
          };
        }

        // Get student details for each enrolled student
        const studentsWithDetails = await Promise.all(
          course.students.map(async (student) => {
            try {
              // Handle both old format (ObjectId) and new format (object with studentId)
              let studentId;
              let studentName;
              let enrolledAt;
              
              if (student && typeof student === 'object' && student.studentId) {
                // New format: { studentId, studentName, enrolledAt }
                studentId = student.studentId;
                studentName = student.studentName;
                enrolledAt = student.enrolledAt;
              } else {
                // Old format: just ObjectId
                studentId = student;
                studentName = null;
                enrolledAt = null;
              }
              
              // Ensure studentId is valid
              if (!studentId) {
                return null;
              }
              
              // Fetch full student details
              const studentDetails = await User.findById(studentId)
                .select('fullName email profilePicture');
              
              if (studentDetails) {
                return {
                  studentId: studentDetails._id,
                  studentName: studentName || studentDetails.fullName,
                  email: studentDetails.email,
                  profilePicture: studentDetails.profilePicture,
                  enrolledAt: enrolledAt || new Date(),
                  // Format enrolled date
                  enrolledDateFormatted: enrolledAt 
                    ? new Date(enrolledAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                };
              }
              return null;
            } catch (err) {
              console.error('Error processing student:', err);
              return null;
            }
          })
        );
        
        // Filter out null values (students that don't exist)
        const validStudents = studentsWithDetails.filter(s => s !== null);
        
        return {
          courseId: course._id,
          courseTitle: course.title,
          studentCount: validStudents.length,
          students: validStudents
        };
      })
    );
    
    // Calculate total students across all courses (unique students)
    const allStudentIds = new Set();
    coursesWithStudents.forEach(course => {
      course.students.forEach(student => {
        allStudentIds.add(student.studentId.toString());
      });
    });
    
    res.status(200).json({
      success: true,
      totalCourses: coursesWithStudents.length,
      totalUniqueStudents: allStudentIds.size,
      courses: coursesWithStudents
    });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
