import Course from '../models/Course.js';
import User from '../models/User.js';

// Get all courses for a teacher
export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
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
    const teacherId = req.user.id;

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
    const { title, description, duration, level } = req.body;
    const teacherId = req.user.id;

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

    const course = new Course({
      title,
      description,
      duration,
      level: level || 'beginner',
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
    const { title, description, duration, level, status } = req.body;
    const teacherId = req.user.id;

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

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (duration) course.duration = duration;
    if (level) course.level = level;
    if (status) course.status = status;

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
    const teacherId = req.user.id;

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

// Add a module to a course
export const addModuleToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;
    const teacherId = req.user.id;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Module title and description are required.'
      });
    }

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

    const newModule = {
      title,
      description,
      order: order || course.modules.length + 1,
      videos: []
    };

    course.modules.push(newModule);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module added successfully.',
      course: course
    });
  } catch (error) {
    console.error('Add module error:', error);
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
    const teacherId = req.user.id;

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
    const teacherId = req.user.id;

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

    course.modules.pull(moduleId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully.',
      course: course
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Add a video to a module
export const addVideoToModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, duration, order, videoUrl } = req.body;
    const teacherId = req.user.id;

    // Validation
    if (!title || !description || !duration || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video title, description, duration, and URL are required.'
      });
    }

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

    const newVideo = {
      title,
      description,
      duration,
      order: order || module.videos.length + 1,
      videoUrl
    };

    module.videos.push(newVideo);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Video added successfully.',
      course: course
    });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update a video
export const updateVideo = async (req, res) => {
  try {
    const { courseId, moduleId, videoId } = req.params;
    const { title, description, duration, order, videoUrl } = req.body;
    const teacherId = req.user.id;

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

    if (title) video.title = title;
    if (description) video.description = description;
    if (duration) video.duration = duration;
    if (order) video.order = order;
    if (videoUrl) video.videoUrl = videoUrl;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Video updated successfully.',
      course: course
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const { courseId, moduleId, videoId } = req.params;
    const teacherId = req.user.id;

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

    module.videos.pull(videoId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully.',
      course: course
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
