import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import TeacherSidebar from '../components/TeacherSidebar';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Course management states
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner'
  });
  const [courseFormErrors, setCourseFormErrors] = useState({});
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseFormData, setEditCourseFormData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'beginner'
  });
  const [editCourseFormErrors, setEditCourseFormErrors] = useState({});
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);

  // Course modules states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    order: 1
  });
  const [moduleFormErrors, setModuleFormErrors] = useState({});
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    duration: '',
    order: 1
  });
  const [videoFormErrors, setVideoFormErrors] = useState({});
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  // Assignment management states
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    courseId: '',
    maxPoints: 100
  });
  const [assignmentFormErrors, setAssignmentFormErrors] = useState({});
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [showEditAssignmentForm, setShowEditAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editAssignmentFormData, setEditAssignmentFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    courseId: '',
    maxPoints: 100
  });
  const [editAssignmentFormErrors, setEditAssignmentFormErrors] = useState({});
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Set user from localStorage for dummy data
    setUser({
      fullName: localStorage.getItem('name') || 'Teacher',
      email: 'teacher@example.com',
      role: 'teacher'
    });
    setLoading(false);

    // Load dummy data
    loadDummyData();
  }, [navigate]);

  // Load dummy data
  const loadDummyData = () => {
    console.log('📊 Loading dummy data...');
    
    // Dummy courses with modules and videos
    const dummyCourses = [
      {
        _id: '1',
        title: 'Cloud Computing Fundamentals',
        description: 'Learn the basics of cloud computing, including AWS, Azure, and Google Cloud platforms.',
        duration: '8 weeks',
        level: 'beginner',
        status: 'active',
        students: 0,
        modules: [
          {
            _id: '1-1',
            title: 'Introduction to Cloud Computing',
            description: 'Understanding cloud concepts and benefits',
            order: 1,
            videos: [
              {
                _id: '1-1-1',
                title: 'What is Cloud Computing?',
                description: 'Basic concepts and definitions',
                duration: '15 minutes',
                order: 1,
                videoUrl: 'https://example.com/video1'
              },
              {
                _id: '1-1-2',
                title: 'Cloud Service Models',
                description: 'IaaS, PaaS, SaaS explained',
                duration: '20 minutes',
                order: 2,
                videoUrl: 'https://example.com/video2'
              }
            ]
          },
          {
            _id: '1-2',
            title: 'AWS Basics',
            description: 'Getting started with Amazon Web Services',
            order: 2,
            videos: [
              {
                _id: '1-2-1',
                title: 'AWS Console Overview',
                description: 'Navigating the AWS management console',
                duration: '12 minutes',
                order: 1,
                videoUrl: 'https://example.com/video3'
              }
            ]
          }
        ]
      },
      {
        _id: '2',
        title: 'React Development',
        description: 'Master React.js for building modern web applications',
        duration: '12 weeks',
        level: 'intermediate',
        status: 'active',
        students: 0,
        modules: [
          {
            _id: '2-1',
            title: 'React Fundamentals',
            description: 'Components, JSX, and state management',
            order: 1,
            videos: [
              {
                _id: '2-1-1',
                title: 'Creating Your First Component',
                description: 'Building a simple React component',
                duration: '18 minutes',
                order: 1,
                videoUrl: 'https://example.com/video4'
              }
            ]
          }
        ]
      },
      {
        _id: '3',
        title: 'Node.js Backend Development',
        description: 'Build robust backend applications with Node.js and Express',
        duration: '10 weeks',
        level: 'advanced',
        status: 'active',
        students: 0,
        modules: [
          {
            _id: '3-1',
            title: 'Express.js Basics',
            description: 'Setting up Express server and routing',
            order: 1,
            videos: [
              {
                _id: '3-1-1',
                title: 'Setting Up Express Server',
                description: 'Creating your first Express application',
                duration: '25 minutes',
                order: 1,
                videoUrl: 'https://example.com/video5'
              }
            ]
          }
        ]
      }
    ];

    // Dummy assignments
    const dummyAssignments = [
      {
        _id: '1',
        title: 'Cloud Architecture Design',
        description: 'Design a cloud architecture for a web application',
        dueDate: '2024-02-15',
        course: { _id: '1', title: 'Cloud Computing Fundamentals' },
        maxPoints: 100,
        status: 'active'
      },
      {
        _id: '2',
        title: 'React Component Library',
        description: 'Build a reusable component library in React',
        dueDate: '2024-02-20',
        course: { _id: '2', title: 'React Development' },
        maxPoints: 150,
        status: 'active'
      },
      {
        _id: '3',
        title: 'RESTful API Development',
        description: 'Create a complete REST API using Node.js and Express',
        dueDate: '2024-02-25',
        course: { _id: '3', title: 'Node.js Backend Development' },
        maxPoints: 200,
        status: 'active'
      }
    ];

    setCourses(dummyCourses);
    setAssignments(dummyAssignments);
    console.log('✅ Dummy data loaded successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    // Dispatch custom event to notify navbar of auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    navigate('/');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Reset forms when switching sections
    if (section !== 'courses') {
      setShowAddCourseForm(false);
      setCourseFormData({ title: '', description: '', duration: '', level: 'beginner' });
      setCourseFormErrors({});
    }
    if (section !== 'assignments') {
      setShowAddAssignmentForm(false);
      setAssignmentFormData({ title: '', description: '', dueDate: '', courseId: '', maxPoints: 100 });
      setAssignmentFormErrors({});
    }
    
    // Fetch data when switching to specific sections
    if (section === 'courses') {
      fetchCourses();
    } else if (section === 'assignments') {
      fetchAssignments();
    }
  };

  // Course management functions (dummy data)
  const fetchCourses = () => {
    console.log('📚 Using dummy courses data...');
    // Courses are already loaded in loadDummyData()
  };

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setCourseFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (courseFormErrors[name]) {
      setCourseFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateCourseForm = () => {
    const errors = {};
    
    if (!courseFormData.title.trim()) {
      errors.title = 'Course title is required';
    }
    
    if (!courseFormData.description.trim()) {
      errors.description = 'Course description is required';
    }
    
    if (!courseFormData.duration.trim()) {
      errors.duration = 'Course duration is required';
    }
    
    return errors;
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    
    const errors = validateCourseForm();
    if (Object.keys(errors).length > 0) {
      setCourseFormErrors(errors);
      return;
    }
    
    setIsSubmittingCourse(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newCourse = {
        _id: Date.now().toString(),
        title: courseFormData.title,
        description: courseFormData.description,
        duration: courseFormData.duration,
        level: courseFormData.level,
        status: 'active',
        students: 0,
        modules: []
      };
      
      setCourses(prev => [...prev, newCourse]);
      console.log('✅ Course created (dummy):', newCourse);
      alert('Course created successfully!');
      
      // Reset form
      setCourseFormData({ title: '', description: '', duration: '', level: 'beginner' });
      setCourseFormErrors({});
      setShowAddCourseForm(false);
      
      setIsSubmittingCourse(false);
    }, 1000);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setEditCourseFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level
    });
    setEditCourseFormErrors({});
    setShowEditCourseForm(true);
  };

  const handleEditCourseFormChange = (e) => {
    const { name, value } = e.target;
    setEditCourseFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (editCourseFormErrors[name]) {
      setEditCourseFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEditCourseForm = () => {
    const errors = {};
    
    if (!editCourseFormData.title.trim()) {
      errors.title = 'Course title is required';
    }
    
    if (!editCourseFormData.description.trim()) {
      errors.description = 'Course description is required';
    }
    
    if (!editCourseFormData.duration.trim()) {
      errors.duration = 'Course duration is required';
    }
    
    return errors;
  };

  const handleUpdateCourse = (e) => {
    e.preventDefault();
    
    const errors = validateEditCourseForm();
    if (Object.keys(errors).length > 0) {
      setEditCourseFormErrors(errors);
      return;
    }
    
    setIsUpdatingCourse(true);
    
    // Simulate API delay
    setTimeout(() => {
      setCourses(prev => prev.map(course => 
        course._id === editingCourse._id 
          ? { ...course, ...editCourseFormData }
          : course
      ));
      
      console.log('✅ Course updated (dummy):', editCourseFormData);
      alert('Course updated successfully!');
      
      // Reset form
      setEditCourseFormData({ title: '', description: '', duration: '', level: 'beginner' });
      setEditCourseFormErrors({});
      setShowEditCourseForm(false);
      setEditingCourse(null);
      
      setIsUpdatingCourse(false);
    }, 1000);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(course => course._id !== courseId));
      console.log('✅ Course deleted (dummy):', courseId);
      alert('Course deleted successfully!');
    }
  };

  // Module management functions
  const handleViewCourseModules = (course) => {
    console.log('📖 Viewing course modules for:', course.title);
    setSelectedCourse(course);
    setActiveSection('course-modules');
  };

  const handleModuleFormChange = (e) => {
    const { name, value } = e.target;
    setModuleFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (moduleFormErrors[name]) {
      setModuleFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateModuleForm = () => {
    const errors = {};
    
    if (!moduleFormData.title.trim()) {
      errors.title = 'Module title is required';
    }
    
    if (!moduleFormData.description.trim()) {
      errors.description = 'Module description is required';
    }
    
    return errors;
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    
    const errors = validateModuleForm();
    if (Object.keys(errors).length > 0) {
      setModuleFormErrors(errors);
      return;
    }
    
    setIsSubmittingModule(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newModule = {
        _id: Date.now().toString(),
        title: moduleFormData.title,
        description: moduleFormData.description,
        order: selectedCourse.modules.length + 1,
        videos: []
      };
      
      setSelectedCourse(prev => ({
        ...prev,
        modules: [...prev.modules, newModule]
      }));
      
      // Update courses state as well
      setCourses(prev => prev.map(course => 
        course._id === selectedCourse._id 
          ? { ...course, modules: [...course.modules, newModule] }
          : course
      ));
      
      console.log('✅ Module created (dummy):', newModule);
      alert('Module created successfully!');
      
      // Reset form
      setModuleFormData({ title: '', description: '', order: 1 });
      setModuleFormErrors({});
      setShowAddModuleForm(false);
      
      setIsSubmittingModule(false);
    }, 1000);
  };

  const handleDeleteModule = (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module and all its videos?')) {
      setSelectedCourse(prev => ({
        ...prev,
        modules: prev.modules.filter(module => module._id !== moduleId)
      }));
      
      // Update courses state as well
      setCourses(prev => prev.map(course => 
        course._id === selectedCourse._id 
          ? { ...course, modules: course.modules.filter(module => module._id !== moduleId) }
          : course
      ));
      
      console.log('✅ Module deleted (dummy):', moduleId);
      alert('Module deleted successfully!');
    }
  };

  // Video management functions
  const handleAddVideoToModule = (module) => {
    setSelectedModule(module);
    setVideoFormData({
      title: '',
      description: '',
      videoFile: null,
      duration: '',
      order: module.videos ? module.videos.length + 1 : 1
    });
    setVideoFormErrors({});
    setShowAddVideoForm(true);
  };

  const handleVideoFormChange = (e) => {
    const { name, value, files } = e.target;
    setVideoFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (videoFormErrors[name]) {
      setVideoFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateVideoForm = () => {
    const errors = {};
    
    if (!videoFormData.title.trim()) {
      errors.title = 'Video title is required';
    }
    
    if (!videoFormData.description.trim()) {
      errors.description = 'Video description is required';
    }
    
    if (!videoFormData.videoFile) {
      errors.videoFile = 'Video file is required';
    }
    
    if (!videoFormData.duration.trim()) {
      errors.duration = 'Video duration is required';
    }
    
    return errors;
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    
    const errors = validateVideoForm();
    if (Object.keys(errors).length > 0) {
      setVideoFormErrors(errors);
      return;
    }
    
    setIsSubmittingVideo(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newVideo = {
        _id: Date.now().toString(),
        title: videoFormData.title,
        description: videoFormData.description,
        duration: videoFormData.duration,
        order: selectedModule.videos.length + 1,
        videoUrl: `placeholder-video-url-${Date.now()}`
      };
      
      // Update selected course with new video
      setSelectedCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module => 
          module._id === selectedModule._id 
            ? { ...module, videos: [...module.videos, newVideo] }
            : module
        )
      }));
      
      // Update courses state as well
      setCourses(prev => prev.map(course => 
        course._id === selectedCourse._id 
          ? {
              ...course,
              modules: course.modules.map(module => 
                module._id === selectedModule._id 
                  ? { ...module, videos: [...module.videos, newVideo] }
                  : module
              )
            }
          : course
      ));
      
      console.log('✅ Video added (dummy):', newVideo);
      alert('Video uploaded successfully!');
      
      // Reset form
      setVideoFormData({ title: '', description: '', videoFile: null, duration: '', order: 1 });
      setVideoFormErrors({});
      setShowAddVideoForm(false);
      setSelectedModule(null);
      
      setIsSubmittingVideo(false);
    }, 1000);
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      // Update selected course by removing the video
      setSelectedCourse(prev => ({
        ...prev,
        modules: prev.modules.map(module => 
          module._id === selectedModule._id 
            ? { ...module, videos: module.videos.filter(video => video._id !== videoId) }
            : module
        )
      }));
      
      // Update courses state as well
      setCourses(prev => prev.map(course => 
        course._id === selectedCourse._id 
          ? {
              ...course,
              modules: course.modules.map(module => 
                module._id === selectedModule._id 
                  ? { ...module, videos: module.videos.filter(video => video._id !== videoId) }
                  : module
              )
            }
          : course
      ));
      
      console.log('✅ Video deleted (dummy):', videoId);
      alert('Video deleted successfully!');
    }
  };

  // Assignment management functions
  const fetchAssignments = () => {
    console.log('📝 Using dummy assignments data...');
    // Assignments are already loaded in loadDummyData()
  };

  const handleAssignmentFormChange = (e) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (assignmentFormErrors[name]) {
      setAssignmentFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateAssignmentForm = () => {
    const errors = {};
    
    if (!assignmentFormData.title.trim()) {
      errors.title = 'Assignment title is required';
    }
    
    if (!assignmentFormData.description.trim()) {
      errors.description = 'Assignment description is required';
    }
    
    if (!assignmentFormData.dueDate.trim()) {
      errors.dueDate = 'Due date is required';
    }
    
    if (!assignmentFormData.courseId.trim()) {
      errors.courseId = 'Course selection is required';
    }
    
    return errors;
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    
    const errors = validateAssignmentForm();
    if (Object.keys(errors).length > 0) {
      setAssignmentFormErrors(errors);
      return;
    }
    
    setIsSubmittingAssignment(true);
    
    // Simulate API delay
    setTimeout(() => {
      const selectedCourse = courses.find(c => c._id === assignmentFormData.courseId);
      const newAssignment = {
        _id: Date.now().toString(),
        title: assignmentFormData.title,
        description: assignmentFormData.description,
        dueDate: assignmentFormData.dueDate,
        course: { _id: assignmentFormData.courseId, title: selectedCourse?.title || 'Unknown Course' },
        maxPoints: assignmentFormData.maxPoints,
        status: 'active'
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      console.log('✅ Assignment created (dummy):', newAssignment);
      alert('Assignment created successfully!');
      
      // Reset form
      setAssignmentFormData({ title: '', description: '', dueDate: '', courseId: '', maxPoints: 100 });
      setAssignmentFormErrors({});
      setShowAddAssignmentForm(false);
      
      setIsSubmittingAssignment(false);
    }, 1000);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setEditAssignmentFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.split('T')[0], // Format for input type="date"
      courseId: assignment.course._id,
      maxPoints: assignment.maxPoints
    });
    setEditAssignmentFormErrors({});
    setShowEditAssignmentForm(true);
  };

  const handleEditAssignmentFormChange = (e) => {
    const { name, value } = e.target;
    setEditAssignmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (editAssignmentFormErrors[name]) {
      setEditAssignmentFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEditAssignmentForm = () => {
    const errors = {};
    
    if (!editAssignmentFormData.title.trim()) {
      errors.title = 'Assignment title is required';
    }
    
    if (!editAssignmentFormData.description.trim()) {
      errors.description = 'Assignment description is required';
    }
    
    if (!editAssignmentFormData.dueDate.trim()) {
      errors.dueDate = 'Due date is required';
    }
    
    if (!editAssignmentFormData.courseId.trim()) {
      errors.courseId = 'Course selection is required';
    }
    
    return errors;
  };

  const handleUpdateAssignment = (e) => {
    e.preventDefault();
    
    const errors = validateEditAssignmentForm();
    if (Object.keys(errors).length > 0) {
      setEditAssignmentFormErrors(errors);
      return;
    }
    
    setIsUpdatingAssignment(true);
    
    // Simulate API delay
    setTimeout(() => {
      setAssignments(prev => prev.map(assignment => 
        assignment._id === editingAssignment._id 
          ? { ...assignment, ...editAssignmentFormData }
          : assignment
      ));
      
      console.log('✅ Assignment updated (dummy):', editAssignmentFormData);
      alert('Assignment updated successfully!');
      
      // Reset form
      setEditAssignmentFormData({ title: '', description: '', dueDate: '', courseId: '', maxPoints: 100 });
      setEditAssignmentFormErrors({});
      setShowEditAssignmentForm(false);
      setEditingAssignment(null);
      
      setIsUpdatingAssignment(false);
    }, 1000);
  };

  const handleDeleteAssignment = (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
      console.log('✅ Assignment deleted (dummy):', assignmentId);
      alert('Assignment deleted successfully!');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Content components for different sections
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
  return (
          <div>
        <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Teacher Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Welcome back, {user?.fullName}! Manage your courses and students.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Stats Cards */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>My Students</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>24</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>My Courses</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0' }}>{courses.length}</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Assignments</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>{assignments.length}</div>
          </div>

              {/* Recent Activity */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    📚 <strong>New course created:</strong> "Cloud Computing Fundamentals" - 2 modules added
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    📝 <strong>Assignment posted:</strong> "React Component Project" - Due Feb 20, 2024
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    🎥 <strong>Video uploaded:</strong> "What is Cloud Computing?" - 15:30 duration
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    👥 <strong>Student enrolled:</strong> John Doe joined "React Development" course
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'courses':
        return (
          <div>
            <div style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem' 
            }}>
              <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '0' }}>
                My Courses
              </h1>
              <button
                onClick={() => setShowAddCourseForm(true)}
                style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#45a049';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4caf50';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                + Create Course
              </button>
            </div>

            {/* Add Course Form */}
            {showAddCourseForm && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                  Create New Course
                </h3>
                
                <form onSubmit={handleAddCourse}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={courseFormData.title}
                      onChange={handleCourseFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${courseFormErrors.title ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter course title"
                    />
                    {courseFormErrors.title && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {courseFormErrors.title}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={courseFormData.description}
                      onChange={handleCourseFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${courseFormErrors.description ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      placeholder="Enter course description"
                    />
                    {courseFormErrors.description && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {courseFormErrors.description}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Duration *
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={courseFormData.duration}
                        onChange={handleCourseFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${courseFormErrors.duration ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="e.g., 8 weeks"
                      />
                      {courseFormErrors.duration && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {courseFormErrors.duration}
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Level
                      </label>
                      <select
                        name="level"
                        value={courseFormData.level}
                        onChange={handleCourseFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      disabled={isSubmittingCourse}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmittingCourse ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        opacity: isSubmittingCourse ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmittingCourse ? 'Creating...' : 'Create Course'}
              </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowAddCourseForm(false)}
                      disabled={isSubmittingCourse}
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        border: '1px solid #ccc',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmittingCourse ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Courses List */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
                My Courses ({courses.length})
              </h3>
              
              {loadingCourses ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div>Loading courses...</div>
                </div>
              ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No courses found. Create your first course using the button above.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {courses.map((course) => (
                    <div key={course._id} style={{
                      padding: '1.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{ color: '#2e7d32', margin: 0, fontSize: '1.2rem' }}>{course.title}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleViewCourseModules(course)}
                            style={{
                              backgroundColor: '#4caf50',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Manage Modules
                          </button>
                          <button
                            onClick={() => handleEditCourse(course)}
                            style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                              padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Edit
              </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            style={{
                              backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                              padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{course.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                        <span>Duration: {course.duration}</span>
                        <span>Level: {course.level}</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                        Students: {course.students?.length || 0} | Status: {course.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'course-modules':
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem' 
            }}>
              <div>
                <button
                  onClick={() => setActiveSection('courses')}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    border: '1px solid #ccc',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  ← Back to Courses
              </button>
                <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '0' }}>
                  {selectedCourse?.title} - Modules
                </h1>
              </div>
              <button
                onClick={() => setShowAddModuleForm(true)}
                style={{
                  backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#45a049';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4caf50';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                + Add Module
              </button>
            </div>

            {/* Add Module Form */}
            {showAddModuleForm && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                  Add New Module
                </h3>
                
                <form onSubmit={handleAddModule}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Module Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={moduleFormData.title}
                      onChange={handleModuleFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${moduleFormErrors.title ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter module title"
                    />
                    {moduleFormErrors.title && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {moduleFormErrors.title}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={moduleFormData.description}
                      onChange={handleModuleFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${moduleFormErrors.description ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      placeholder="Enter module description"
                    />
                    {moduleFormErrors.description && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {moduleFormErrors.description}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      disabled={isSubmittingModule}
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmittingModule ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        opacity: isSubmittingModule ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmittingModule ? 'Creating...' : 'Create Module'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowAddModuleForm(false)}
                      disabled={isSubmittingModule}
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        border: '1px solid #ccc',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmittingModule ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Video Form Modal */}
            {showAddVideoForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  width: '90%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}>
                  <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                    Add Video to "{selectedModule?.title}"
                  </h3>
                  
                  <form onSubmit={handleAddVideo}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Video Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={videoFormData.title}
                        onChange={handleVideoFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${videoFormErrors.title ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter video title"
                      />
                      {videoFormErrors.title && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {videoFormErrors.title}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={videoFormData.description}
                        onChange={handleVideoFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${videoFormErrors.description ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box',
                          minHeight: '80px',
                          resize: 'vertical'
                        }}
                        placeholder="Enter video description"
                      />
                      {videoFormErrors.description && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {videoFormErrors.description}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem', 
                          fontWeight: '500',
                          color: '#333'
                        }}>
                          Video File *
                        </label>
                        <input
                          type="file"
                          name="videoFile"
                          accept="video/*"
                          onChange={handleVideoFormChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: `1px solid ${videoFormErrors.videoFile ? '#f44336' : '#ccc'}`,
                            borderRadius: '4px',
                            fontSize: '1rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        {videoFormErrors.videoFile && (
                          <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                            {videoFormErrors.videoFile}
                          </span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem', 
                          fontWeight: '500',
                          color: '#333'
                        }}>
                          Duration *
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={videoFormData.duration}
                          onChange={handleVideoFormChange}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: `1px solid ${videoFormErrors.duration ? '#f44336' : '#ccc'}`,
                            borderRadius: '4px',
                            fontSize: '1rem',
                            boxSizing: 'border-box'
                          }}
                          placeholder="e.g., 15:30"
                        />
                        {videoFormErrors.duration && (
                          <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                            {videoFormErrors.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="submit"
                        disabled={isSubmittingVideo}
                        style={{
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isSubmittingVideo ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          opacity: isSubmittingVideo ? 0.7 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isSubmittingVideo ? 'Uploading...' : 'Upload Video'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddVideoForm(false);
                          setSelectedModule(null);
                        }}
                        disabled={isSubmittingVideo}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          border: '1px solid #ccc',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isSubmittingVideo ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modules List */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
                Course Modules ({selectedCourse?.modules?.length || 0})
              </h3>
              
              {selectedCourse?.modules?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No modules found. Add your first module using the button above.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedCourse?.modules?.map((module) => (
                    <div key={module.id} style={{
                      padding: '1.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ color: '#2e7d32', margin: 0, fontSize: '1.2rem' }}>
                            Module {module.order}: {module.title}
                          </h4>
                          <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            {module.description}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleAddVideoToModule(module)}
                            style={{
                              backgroundColor: '#2196f3',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            + Add Video
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            style={{
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Delete Module
                          </button>
                        </div>
                      </div>

                      {/* Videos in Module */}
                      {module.videos && module.videos.length > 0 ? (
                        <div style={{ marginTop: '1rem' }}>
                          <h5 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            Videos ({module.videos.length})
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {module.videos.map((video) => (
                              <div key={video.id} style={{
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#f44336',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.8rem'
                                  }}>
                                    ▶
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                      {video.order}. {video.title}
                                    </div>
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>
                                      {video.description} • Duration: {video.duration}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteVideo(video.id)}
                                  style={{
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  Delete
              </button>
            </div>
                            ))}
          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center', color: '#666' }}>
                          No videos in this module yet. Click "Add Video" to get started.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'assignments':
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem' 
            }}>
              <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '0' }}>
                Assignments
              </h1>
              <button
                onClick={() => setShowAddAssignmentForm(true)}
                style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1976d2';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2196f3';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                + Create Assignment
              </button>
            </div>

            {/* Add Assignment Form */}
            {showAddAssignmentForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ color: '#2e7d32', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                  Create New Assignment
                </h3>
                
                <form onSubmit={handleAddAssignment}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={assignmentFormData.title}
                      onChange={handleAssignmentFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${assignmentFormErrors.title ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter assignment title"
                    />
                    {assignmentFormErrors.title && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {assignmentFormErrors.title}
                      </span>
                    )}
              </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={assignmentFormData.description}
                      onChange={handleAssignmentFormChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${assignmentFormErrors.description ? '#f44336' : '#ccc'}`,
                        borderRadius: '4px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      placeholder="Enter assignment description"
                    />
                    {assignmentFormErrors.description && (
                      <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {assignmentFormErrors.description}
                      </span>
                    )}
              </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Due Date *
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={assignmentFormData.dueDate}
                        onChange={handleAssignmentFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${assignmentFormErrors.dueDate ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      {assignmentFormErrors.dueDate && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {assignmentFormErrors.dueDate}
                        </span>
                      )}
              </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Course *
                      </label>
                      <select
                        name="courseId"
                        value={assignmentFormData.courseId}
                        onChange={handleAssignmentFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${assignmentFormErrors.courseId ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                      </select>
                      {assignmentFormErrors.courseId && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {assignmentFormErrors.courseId}
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Max Points
                      </label>
                      <input
                        type="number"
                        name="maxPoints"
                        value={assignmentFormData.maxPoints}
                        onChange={handleAssignmentFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        min="1"
                        max="1000"
                      />
            </div>
          </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      disabled={isSubmittingAssignment}
                      style={{
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmittingAssignment ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        opacity: isSubmittingAssignment ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmittingAssignment ? 'Creating...' : 'Create Assignment'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowAddAssignmentForm(false)}
                      disabled={isSubmittingAssignment}
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        border: '1px solid #ccc',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: isSubmittingAssignment ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Assignments List */}
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
                My Assignments ({assignments.length})
              </h3>
              
              {loadingAssignments ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div>Loading assignments...</div>
              </div>
              ) : assignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No assignments found. Create your first assignment using the button above.</p>
              </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Title
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Course
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Due Date
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Points
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          Submissions
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500' }}>{assignment.title}</div>
                            <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                              {assignment.description}
              </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: '#666' }}>
                              {assignment.course?.title || 'Unknown Course'}
            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                              {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: '#666' }}>{assignment.maxPoints}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: '#666' }}>{assignment.submissions?.length || 0}</div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditAssignment(assignment)}
                                style={{
                                  backgroundColor: '#2196f3',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#1976d2';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#2196f3';
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAssignment(assignment._id)}
                                style={{
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#d32f2f';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#f44336';
                                }}
                              >
                                Delete
                              </button>
        </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
    </div>
  );
      
      case 'students':
        return (
          <div>
            <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '1rem' }}>My Students</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>Student management features will be implemented here.</p>
            </div>
          </div>
        );
      
      case 'grades':
        return (
          <div>
            <h1 style={{ color: '#2e7d32', fontSize: '2.5rem', marginBottom: '1rem' }}>Grades</h1>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p>Grade management features will be implemented here.</p>
            </div>
          </div>
        );
      
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <TeacherSidebar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* Main Content */}
      <div style={{ 
        marginLeft: '250px', 
        flex: 1, 
        padding: '2rem',
        overflow: 'auto'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default TeacherDashboard;