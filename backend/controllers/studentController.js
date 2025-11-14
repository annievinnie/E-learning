import Course from '../models/Course.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Progress from '../models/Progress.js';

// Get all available courses for students (with filtering and search)
export const getAllCourses = async (req, res) => {
  try {
    const { search, level, category, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { status: 'active' }; // Only show active courses
    
    // Filter by level
    if (level && level !== 'all') {
      query.level = level.toLowerCase();
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get user ID for enrollment check
    const userId = req.user?.userId || req.user?.id;
    
    console.log('🔍 getAllCourses - User ID:', userId);
    
    // Get courses with pagination
    const courses = await Course.find(query)
      .populate('teacher', 'fullName email profilePicture')
      .select('-modules.videos') // Don't send video URLs in list view for performance
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Course.countDocuments(query);
    
    // Format courses for frontend
    const formattedCourses = courses.map((course, courseIndex) => {
      // Check if user is enrolled in this course
      let isEnrolled = false;
      if (userId && course.students && Array.isArray(course.students) && course.students.length > 0) {
        // Debug: log first course's students structure
        if (courseIndex === 0) {
          console.log('📚 Sample course students array:', JSON.stringify(course.students.slice(0, 2), null, 2));
          console.log('🔍 User ID to match:', userId.toString());
        }
        
        isEnrolled = course.students.some(student => {
          try {
            // New format: { studentId, studentName, enrolledAt }
            if (student && typeof student === 'object' && student.studentId) {
              // Handle Mongoose ObjectId - convert both to string for comparison
              const studentIdStr = student.studentId.toString ? student.studentId.toString() : String(student.studentId);
              const userIdStr = userId.toString ? userId.toString() : String(userId);
              const matches = studentIdStr === userIdStr;
              
              if (matches && courseIndex === 0) {
                console.log(`✅ Found enrollment match for course ${course.title}:`, {
                  studentId: studentIdStr,
                  userId: userIdStr,
                  studentName: student.studentName,
                  match: matches
                });
              }
              return matches;
            }
            // Legacy format: direct ObjectId (Mongoose document or string)
            if (student) {
              const studentIdStr = student.toString ? student.toString() : String(student);
              const userIdStr = userId.toString ? userId.toString() : String(userId);
              const matches = studentIdStr === userIdStr;
              
              if (matches && courseIndex === 0) {
                console.log(`✅ Found enrollment match (legacy format) for course ${course.title}`);
              }
              return matches;
            }
          } catch (error) {
            console.error(`Error checking enrollment for course ${course.title}:`, error);
          }
          return false;
        });
      }
      
      // Debug: log enrollment status for first few courses
      if (courseIndex < 3) {
        console.log(`📝 Course ${courseIndex + 1}: ${course.title}, isEnrolled: ${isEnrolled}, students count: ${course.students?.length || 0}`);
      }
      // Format instructor image URL
      let instructorImage = '';
      if (course.teacher?.profilePicture) {
        instructorImage = course.teacher.profilePicture.startsWith('http') 
          ? course.teacher.profilePicture 
          : `http://localhost:5000${course.teacher.profilePicture}`;
      }
      
      return {
        id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.teacher?.fullName || 'Unknown',
        instructorImage: instructorImage,
        thumbnail: course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : '',
      category: course.category || 'Other',
      level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      rating: 4.5, // Can be added as reviews/ratings later
      reviewCount: 0,
      students: course.students?.length || 0,
      duration: course.duration,
      lessons: course.modules?.reduce((acc, mod) => acc + (mod.videos?.length || 0), 0) || 0,
      price: course.price || 0,
      originalPrice: course.price ? course.price * 1.5 : 0,
      bestseller: course.students?.length > 100,
      isEnrolled: isEnrolled,
      createdAt: course.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      courses: formattedCourses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get course details by ID (for students)
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    const course = await Course.findById(courseId)
      .populate('teacher', 'fullName email profilePicture')
      .populate('students', 'fullName email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Check if course is active
    if (course.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This course is not available.'
      });
    }
    
    // Check if student is enrolled (handle both old format ObjectId and new format with studentId)
    const isEnrolled = course.students.some(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() === userId.toString();
      }
      // Handle legacy format (direct ObjectId)
      return student.toString() === userId.toString();
    });
    
    // Format course data similar to getAllCourses for consistency
    // Format instructor image URL
    let instructorImage = '';
    if (course.teacher?.profilePicture) {
      instructorImage = course.teacher.profilePicture.startsWith('http') 
        ? course.teacher.profilePicture 
        : `http://localhost:5000${course.teacher.profilePicture}`;
    }
    
    const formattedCourse = {
      id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.teacher?.fullName || 'Unknown',
      instructorImage: instructorImage,
      instructorEmail: course.teacher?.email || '',
      thumbnail: course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : '',
      category: course.category || 'Other',
      level: course.level.charAt(0).toUpperCase() + course.level.slice(1),
      rating: 4.5, // Can be added as reviews/ratings later
      reviewCount: 0,
      reviews: 0,
      students: course.students?.length || 0,
      duration: course.duration,
      lessons: course.modules?.reduce((acc, mod) => acc + (mod.videos?.length || 0), 0) || 0,
      price: course.price || 0,
      originalPrice: course.price ? course.price * 1.5 : 0,
      bestseller: course.students?.length > 100,
      createdAt: course.createdAt,
      modules: course.modules || [],
      isEnrolled
    };
    
    res.status(200).json({
      success: true,
      course: formattedCourse
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    // Find course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Check if course is active
    if (course.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This course is not available for enrollment.'
      });
    }
    
    // Get user details for enrollment check
    const studentUser = await User.findById(userId);
    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if already enrolled (handle both old format ObjectId and new format with studentId)
    const isEnrolled = course.students.some(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() === userId.toString();
      }
      // Handle legacy format (direct ObjectId)
      return student.toString() === userId.toString();
    });
    
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.'
      });
    }
    
    // Check if course requires payment
    if (course.price && course.price > 0) {
      // Import Payment model here to avoid circular dependencies
      const Payment = (await import('../models/Payment.js')).default;
      
      // Check if payment exists and is completed
      const payment = await Payment.findOne({
        student: userId,
        course: courseId,
        status: 'completed'
      });
      
      if (!payment) {
        return res.status(402).json({
          success: false,
          requiresPayment: true,
          message: 'This course requires payment. Please proceed to checkout.'
        });
      }
    }
    
    // Add student to course with ID and name (user already fetched above)
    course.students.push({
      studentId: userId,
      studentName: studentUser.fullName || 'Student'
    });
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course.'
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get enrolled courses for a student
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    console.log(`🔍 Fetching enrolled courses for user: ${userId}`);
    
    // Find all courses and filter in memory to handle all formats
    const allCourses = await Course.find({ status: 'active' })
      .populate('teacher', 'fullName email profilePicture')
      .sort({ createdAt: -1 });
    
    // Filter courses where student is enrolled (handle all formats)
    const enrolledCourses = allCourses.filter(course => {
      if (!course.students || !Array.isArray(course.students)) {
        return false;
      }
      
      return course.students.some(student => {
        // New format: { studentId, studentName, enrolledAt }
        if (typeof student === 'object' && student.studentId) {
          return student.studentId.toString() === userId.toString();
        }
        // Legacy format: direct ObjectId
        return student.toString() === userId.toString();
      });
    });
    
    // Get progress for all enrolled courses
    const progressRecords = await Progress.find({ 
      student: userId,
      course: { $in: enrolledCourses.map(c => c._id) }
    }).lean();
    
    // Create progress map
    const progressMap = {};
    progressRecords.forEach(record => {
      const courseId = record.course.toString();
      const course = enrolledCourses.find(c => c._id.toString() === courseId);
      if (course) {
        const totalModules = course.modules?.length || 0;
        
        // Get unique completed modules (in case of duplicates)
        let completedModules = 0;
        if (record.completedModules && record.completedModules.length > 0) {
          const uniqueCompletedIds = new Set();
          record.completedModules.forEach(m => {
            const moduleIdStr = m.moduleId ? m.moduleId.toString() : m.moduleId;
            if (moduleIdStr) {
              uniqueCompletedIds.add(moduleIdStr);
            }
          });
          completedModules = uniqueCompletedIds.size;
        }
        
        // Cap progress at 100%
        const progressPercentage = totalModules > 0 
          ? Math.min(100, Math.round((completedModules / totalModules) * 100))
          : 0;
        
        progressMap[courseId] = {
          totalModules,
          completedModules,
          progressPercentage,
          lastAccessedAt: record.lastAccessedAt
        };
      }
    });
    
    // Add progress to each course
    const coursesWithProgress = enrolledCourses.map(course => {
      const courseId = course._id.toString();
      // Get progress from map or calculate default
      let progress = progressMap[courseId];
      if (!progress) {
        const totalModules = course.modules?.length || 0;
        progress = {
          totalModules,
          completedModules: 0,
          progressPercentage: 0,
          lastAccessedAt: null
        };
      }
      
      return {
        ...course.toObject(),
        progress
      };
    });
    
    console.log(`✅ Found ${enrolledCourses.length} enrolled courses for user ${userId}`);
    
    res.status(200).json({
      success: true,
      courses: coursesWithProgress
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Unenroll from a course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Remove student from course (handle both old format ObjectId and new format with studentId)
    course.students = course.students.filter(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() !== userId.toString();
      }
      // Handle legacy format (direct ObjectId)
      return student.toString() !== userId.toString();
    });
    
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course.'
    });
  } catch (error) {
    console.error('Unenroll from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get assignments for a course (for students)
export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Check if course is active
    if (course.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This course is not available.'
      });
    }
    
    // Check if student is enrolled (handle both old format ObjectId and new format with studentId)
    const isEnrolled = course.students.some(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() === userId.toString();
      }
      // Handle legacy format (direct ObjectId)
      return student.toString() === userId.toString();
    });
    
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access assignments.',
        requiresEnrollment: true
      });
    }
    
    // Get all active assignments for this course (only if enrolled)
    const assignments = await Assignment.find({ 
      course: courseId,
      status: 'active' // Only show active assignments
    })
      .populate('course', 'title')
      .populate('teacher', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      assignments: assignments
    });
  } catch (error) {
    console.error('Get course assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Mark a module as completed
export const markModuleComplete = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if student is enrolled
    const isEnrolled = course.students.some(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() === userId.toString();
      }
      return student.toString() === userId.toString();
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to track progress.'
      });
    }

    // Check if module exists in course
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found in this course.'
      });
    }

    // Find or create progress record
    let progress = await Progress.findOne({ student: userId, course: courseId });
    
    if (!progress) {
      progress = new Progress({
        student: userId,
        course: courseId,
        completedModules: []
      });
    }

    // Check if module is already completed (normalize IDs for comparison)
    const normalizedModuleId = moduleId.toString();
    const isAlreadyCompleted = progress.completedModules.some(
      m => {
        const existingId = m.moduleId ? m.moduleId.toString() : m.moduleId;
        return existingId === normalizedModuleId;
      }
    );

    if (!isAlreadyCompleted) {
      // Use the actual module's _id from the course to ensure consistency
      const actualModuleId = module._id || moduleId;
      progress.completedModules.push({
        moduleId: actualModuleId,
        completedAt: new Date()
      });
      progress.lastAccessedAt = new Date();
      await progress.save();
    } else {
      // Module already completed, just update last accessed
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Module marked as completed.',
      progress: progress
    });
  } catch (error) {
    console.error('Mark module complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get course progress for a student
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if student is enrolled
    const isEnrolled = course.students.some(student => {
      if (typeof student === 'object' && student.studentId) {
        return student.studentId.toString() === userId.toString();
      }
      return student.toString() === userId.toString();
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to view progress.'
      });
    }

    // Get progress record
    const progress = await Progress.findOne({ student: userId, course: courseId });

    // Calculate progress - get unique completed modules only
    const totalModules = course.modules.length;
    let completedModules = 0;
    
    if (progress && progress.completedModules) {
      // Get unique module IDs (in case of duplicates)
      const uniqueCompletedIds = new Set();
      progress.completedModules.forEach(m => {
        const moduleIdStr = m.moduleId ? m.moduleId.toString() : m.moduleId;
        if (moduleIdStr) {
          uniqueCompletedIds.add(moduleIdStr);
        }
      });
      completedModules = uniqueCompletedIds.size;
    }
    
    // Cap progress at 100%
    const progressPercentage = totalModules > 0 
      ? Math.min(100, Math.round((completedModules / totalModules) * 100))
      : 0;

    res.status(200).json({
      success: true,
      progress: {
        totalModules,
        completedModules,
        progressPercentage,
        completedModuleIds: progress ? progress.completedModules.map(m => m.moduleId.toString()) : [],
        lastAccessedAt: progress?.lastAccessedAt || null
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Get progress for all enrolled courses
export const getAllCoursesProgress = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Get all progress records for this student
    const progressRecords = await Progress.find({ student: userId })
      .populate('course', 'title modules')
      .lean();

    // Create a map of courseId -> progress
    const progressMap = {};
    progressRecords.forEach(record => {
      const courseId = record.course._id.toString();
      const totalModules = record.course.modules?.length || 0;
      
      // Get unique completed modules (in case of duplicates)
      let completedModules = 0;
      if (record.completedModules && record.completedModules.length > 0) {
        const uniqueCompletedIds = new Set();
        record.completedModules.forEach(m => {
          const moduleIdStr = m.moduleId ? m.moduleId.toString() : m.moduleId;
          if (moduleIdStr) {
            uniqueCompletedIds.add(moduleIdStr);
          }
        });
        completedModules = uniqueCompletedIds.size;
      }
      
      // Cap progress at 100%
      const progressPercentage = totalModules > 0 
        ? Math.min(100, Math.round((completedModules / totalModules) * 100))
        : 0;

      progressMap[courseId] = {
        totalModules,
        completedModules,
        progressPercentage,
        lastAccessedAt: record.lastAccessedAt
      };
    });

    res.status(200).json({
      success: true,
      progress: progressMap
    });
  } catch (error) {
    console.error('Get all courses progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

