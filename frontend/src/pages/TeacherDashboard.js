import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import TeacherSidebar from '../components/TeacherSidebar';
import styled from 'styled-components';
import { Menu, X } from 'lucide-react';
import TeacherDashboardOverview from '../components/teacher/TeacherDashboardOverview';
import TeacherCourses from '../components/teacher/TeacherCourses';
import TeacherCourseModules from '../components/teacher/TeacherCourseModules';
import TeacherAssignments from '../components/teacher/TeacherAssignments';
import TeacherStudents from '../components/teacher/TeacherStudents';
import TeacherProfile from '../components/profile/TeacherProfile';
import TeacherPayments from '../components/teacher/TeacherPayments';
import ContactUs from './ContactUs';

// Styled Components
const DashboardContainer = styled.div`
min-height: 100vh;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
padding: 2rem;

@media (max-width: 768px) {
  padding: 1rem;
}
`;

const ContentWrapper = styled.div`
background: white;
border-radius: 20px;
padding: 2.5rem;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
margin-left: 280px;
min-height: calc(100vh - 4rem);

@media (max-width: 768px) {
  margin-left: 0;
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 70px; /* Space for mobile navbar */
}
`;

const LoadingSpinner = styled.div`
display: flex;
justify-content: center;
align-items: center;
height: 100vh;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
&::after {
content: '';
width: 50px;
height: 50px;
border: 5px solid rgba(255, 255, 255, 0.3);
border-top-color: white;
border-radius: 50%;
animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

const TeacherDashboard = () => {
const navigate = useNavigate();
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [activeSection, setActiveSection] = useState('dashboard');
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

// Course management states
const [courses, setCourses] = useState([]);
const [loadingCourses, setLoadingCourses] = useState(false);
const [selectedCourse, setSelectedCourse] = useState(null);
const [editingCourse, setEditingCourse] = useState(null);

// Assignment management states
const [assignments, setAssignments] = useState([]);
const [loadingAssignments, setLoadingAssignments] = useState(false);
const [editingAssignment, setEditingAssignment] = useState(null);
const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);

// Student count state
const [studentCount, setStudentCount] = useState(0);

// Payments state
const [teacherRevenue, setTeacherRevenue] = useState(null);
const [loadingPayments, setLoadingPayments] = useState(false);

useEffect(() => {
const token = localStorage.getItem('token');
if (!token) {
navigate('/login');
return;
}

// Fetch user profile
API.get('/profile')
.then(response => {
setUser(response.data.user);
setLoading(false);
fetchCourses();
fetchAssignments();
fetchStudentCount();
fetchTeacherRevenue();
})
.catch(error => {
console.error('Error fetching profile:', error);
// Fallback to localStorage data
setUser({
fullName: localStorage.getItem('name') || 'Teacher',
email: 'teacher@example.com',
role: 'teacher'
});
setLoading(false);
fetchCourses();
fetchAssignments();
fetchStudentCount();
fetchTeacherRevenue();
});
}, [navigate]);

const handleLogout = () => {
localStorage.removeItem('token');
localStorage.removeItem('role');
localStorage.removeItem('name');
window.dispatchEvent(new CustomEvent('authStateChanged'));
navigate('/');
};

const handleSectionChange = (section) => {
setActiveSection(section);
if (section === 'courses') {
  fetchCourses();
} else if (section === 'assignments') {
  fetchAssignments();
} else if (section === 'dashboard') {
  fetchStudentCount();
  fetchTeacherRevenue();
} else if (section === 'payments') {
  fetchTeacherRevenue();
}
};

// Fetch student count
const fetchStudentCount = async () => {
try {
  const response = await API.get('/courses/students/enrolled');
  if (response.data.success) {
    // Calculate total unique students across all courses
    const allStudents = new Set();
    if (response.data.courses) {
      response.data.courses.forEach(course => {
        if (course.students && Array.isArray(course.students)) {
          course.students.forEach(student => {
            const studentId = typeof student === 'object' ? student.studentId : student;
            if (studentId) {
              allStudents.add(studentId.toString());
            }
          });
        }
      });
    }
    setStudentCount(allStudents.size);
  }
} catch (error) {
  console.error('Error fetching student count:', error);
}
};

// Course management functions
const fetchCourses = async () => {
setLoadingCourses(true);
try {
const response = await API.get('/courses');
if (response.data.success) {
setCourses(response.data.courses || []);
console.log('✅ Courses fetched:', response.data.courses);
} else {
console.error('Failed to fetch courses:', response.data.message);
alert('Failed to fetch courses. Please try again.');
}
} catch (error) {
console.error('Error fetching courses:', error);
alert(error.response?.data?.message || 'Failed to fetch courses. Please try again.');
} finally {
setLoadingCourses(false);
}
};

const handleCreateCourse = async (courseData) => {
try {
// Create FormData for file upload
const formData = new FormData();
formData.append('title', courseData.title);
formData.append('description', courseData.description);
formData.append('duration', courseData.duration);
formData.append('level', courseData.level);
formData.append('category', courseData.category || 'Other');
formData.append('price', courseData.price || 0);

if (courseData.thumbnailFile) {
formData.append('thumbnail', courseData.thumbnailFile);
}

const response = await API.post('/courses', formData);

if (response.data.success) {
const newCourse = response.data.course;
setCourses(prev => [...prev, newCourse]);
console.log('✅ Course created:', newCourse);
alert('Course created successfully!');
fetchStudentCount(); // Refresh student count
} else {
alert(response.data.message || 'Failed to create course.');
}
} catch (error) {
console.error('Error creating course:', error);
alert(error.response?.data?.message || 'Failed to create course. Please try again.');
throw error;
}
};

const handleUpdateCourse = async (courseId, courseData) => {
try {
// Create FormData for file upload
const formData = new FormData();
formData.append('title', courseData.title);
formData.append('description', courseData.description);
formData.append('duration', courseData.duration);
formData.append('level', courseData.level);
formData.append('category', courseData.category || 'Other');
formData.append('price', courseData.price || 0);

if (courseData.thumbnailFile) {
formData.append('thumbnail', courseData.thumbnailFile);
} else if (courseData.thumbnail !== undefined) {
formData.append('thumbnail', courseData.thumbnail || '');
}

const response = await API.put(`/courses/${courseId}`, formData);

if (response.data.success) {
const updatedCourse = response.data.course;
setCourses(prev => prev.map(course =>
course._id === courseId ? updatedCourse : course
));

if (selectedCourse && selectedCourse._id === courseId) {
setSelectedCourse(updatedCourse);
}

console.log('✅ Course updated:', updatedCourse);
alert('Course updated successfully!');
setEditingCourse(null);
} else {
alert(response.data.message || 'Failed to update course.');
}
} catch (error) {
console.error('Error updating course:', error);
alert(error.response?.data?.message || 'Failed to update course. Please try again.');
throw error;
}
};

const handleDeleteCourse = async (courseId) => {
if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
try {
const response = await API.delete(`/courses/${courseId}`);

if (response.data.success) {
setCourses(prev => prev.filter(course => course._id !== courseId));

if (selectedCourse && selectedCourse._id === courseId) {
setSelectedCourse(null);
setActiveSection('courses');
}

console.log('✅ Course deleted:', courseId);
alert('Course deleted successfully!');
} else {
alert(response.data.message || 'Failed to delete course.');
}
} catch (error) {
console.error('Error deleting course:', error);
alert(error.response?.data?.message || 'Failed to delete course. Please try again.');
}
}
};

const handleViewCourseModules = (course) => {
console.log('📖 Viewing course modules for:', course.title);
setSelectedCourse(course);
setActiveSection('course-modules');
};

const handleEditCourse = (course) => {
setEditingCourse(course);
};

// Module management functions
const handleAddModule = async (moduleData) => {
if (!selectedCourse || !selectedCourse._id) {
alert('Please select a course first.');
return;
}

try {
// Create FormData for file upload
const formData = new FormData();
formData.append('title', moduleData.title);
formData.append('description', moduleData.description);
formData.append('order', moduleData.order || (selectedCourse.modules ? selectedCourse.modules.length + 1 : 1));
if (moduleData.videoFile) {
formData.append('video', moduleData.videoFile);
}
// Duration is automatically calculated, always include it
formData.append('duration', moduleData.duration || '0:00');

const response = await API.post(`/courses/${selectedCourse._id}/modules`, formData, {
headers: {
'Content-Type': 'multipart/form-data'
}
});

if (response.data.success) {
const updatedCourse = response.data.course;
setSelectedCourse(updatedCourse);
setCourses(prev => prev.map(course =>
course._id === selectedCourse._id ? updatedCourse : course
));

console.log('✅ Module created:', updatedCourse);
alert('Module with video created successfully!');
// Refresh courses for recent activity if on dashboard
if (activeSection === 'dashboard') {
  fetchCourses();
}
} else {
alert(response.data.message || 'Failed to create module.');
throw new Error(response.data.message);
}
} catch (error) {
console.error('Error creating module:', error);
alert(error.response?.data?.message || 'Failed to create module. Please try again.');
throw error;
}
};

const handleDeleteModule = async (moduleId) => {
if (!selectedCourse || !selectedCourse._id) {
alert('Please select a course first.');
return;
}

if (window.confirm('Are you sure you want to delete this module and all its videos? This action cannot be undone.')) {
try {
const response = await API.delete(`/courses/${selectedCourse._id}/modules/${moduleId}`);

if (response.data.success) {
const updatedCourse = response.data.course;
setSelectedCourse(updatedCourse);
setCourses(prev => prev.map(course =>
course._id === selectedCourse._id ? updatedCourse : course
));

console.log('✅ Module deleted:', moduleId);
alert('Module deleted successfully!');
} else {
alert(response.data.message || 'Failed to delete module.');
}
} catch (error) {
console.error('Error deleting module:', error);
alert(error.response?.data?.message || 'Failed to delete module. Please try again.');
}
}
};

// Assignment management functions
const fetchAssignments = async () => {
setLoadingAssignments(true);
try {
const response = await API.get('/assignments');
if (response.data.success) {
setAssignments(response.data.assignments || []);
console.log('✅ Assignments fetched:', response.data.assignments);
} else {
console.error('Failed to fetch assignments:', response.data.message);
alert('Failed to fetch assignments. Please try again.');
}
} catch (error) {
console.error('Error fetching assignments:', error);
alert(error.response?.data?.message || 'Failed to fetch assignments. Please try again.');
} finally {
setLoadingAssignments(false);
}
};

const handleCreateAssignment = async (assignmentData) => {
setIsSubmittingAssignment(true);
try {
// Create FormData for file upload
const formData = new FormData();
formData.append('title', assignmentData.title);
formData.append('description', assignmentData.description);
formData.append('courseId', assignmentData.courseId);
if (assignmentData.assignmentFile) {
  formData.append('assignmentFile', assignmentData.assignmentFile);
}

const response = await API.post('/assignments', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

if (response.data.success) {
const newAssignment = response.data.assignment;
setAssignments(prev => [...prev, newAssignment]);
console.log('✅ Assignment created:', newAssignment);
alert('Assignment created successfully!');
// Refresh courses to get updated module data for recent activity
if (activeSection === 'dashboard') {
  fetchCourses();
}
} else {
alert(response.data.message || 'Failed to create assignment.');
throw new Error(response.data.message);
}
} catch (error) {
console.error('Error creating assignment:', error);
alert(error.response?.data?.message || 'Failed to create assignment. Please try again.');
throw error;
} finally {
setIsSubmittingAssignment(false);
}
};

const handleUpdateAssignment = async (assignmentId, assignmentData) => {
setIsUpdatingAssignment(true);
try {
// Create FormData for file upload
const formData = new FormData();
formData.append('title', assignmentData.title);
formData.append('description', assignmentData.description);
formData.append('courseId', assignmentData.courseId);
if (assignmentData.assignmentFile) {
  formData.append('assignmentFile', assignmentData.assignmentFile);
}

const response = await API.put(`/assignments/${assignmentId}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

if (response.data.success) {
const updatedAssignment = response.data.assignment;
setAssignments(prev => prev.map(assignment =>
assignment._id === assignmentId ? updatedAssignment : assignment
));
console.log('✅ Assignment updated:', updatedAssignment);
alert('Assignment updated successfully!');
setEditingAssignment(null);
} else {
alert(response.data.message || 'Failed to update assignment.');
throw new Error(response.data.message);
}
} catch (error) {
console.error('Error updating assignment:', error);
alert(error.response?.data?.message || 'Failed to update assignment. Please try again.');
throw error;
} finally {
setIsUpdatingAssignment(false);
}
};

const handleDeleteAssignment = async (assignmentId) => {
if (window.confirm('Are you sure you want to delete this assignment?')) {
try {
const response = await API.delete(`/assignments/${assignmentId}`);
if (response.data.success) {
setAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
console.log('✅ Assignment deleted:', assignmentId);
alert('Assignment deleted successfully!');
} else {
alert(response.data.message || 'Failed to delete assignment.');
}
} catch (error) {
console.error('Error deleting assignment:', error);
alert(error.response?.data?.message || 'Failed to delete assignment. Please try again.');
}
}
};

const handleEditAssignment = (assignment) => {
setEditingAssignment(assignment);
};

// Fetch teacher revenue
const fetchTeacherRevenue = async () => {
setLoadingPayments(true);
try {
  const response = await API.get('/teacher/payments');
  console.log('Teacher revenue response:', response.data);
  if (response.data.success) {
    setTeacherRevenue(response.data.teacher);
  } else {
    console.error('Failed to fetch teacher revenue:', response.data);
    // Don't show alert for dashboard, just log it
    console.warn('Revenue data not available:', response.data.message);
    setTeacherRevenue({ totalRevenue: 0, totalStudents: 0, courseCount: 0, courses: [] });
  }
} catch (error) {
  console.error('Error fetching teacher revenue:', error);
  // Only show alert if explicitly accessing payments section
  if (activeSection === 'payments') {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch teacher revenue. Please try again.';
    alert(`Error: ${errorMessage}`);
  } else {
    // For dashboard, just set default values
    console.warn('Revenue data not available, using defaults');
    setTeacherRevenue({ totalRevenue: 0, totalStudents: 0, courseCount: 0, courses: [] });
  }
} finally {
  setLoadingPayments(false);
}
};

if (loading) {
return <LoadingSpinner />;
}

// Render content based on active section
const renderContent = () => {
switch (activeSection) {
case 'dashboard':
return <TeacherDashboardOverview user={user} courses={courses} assignments={assignments} studentCount={studentCount} totalRevenue={teacherRevenue?.totalRevenue || 0} />;

case 'courses':
return (
<TeacherCourses
courses={courses}
loadingCourses={loadingCourses}
onViewModules={handleViewCourseModules}
onEditCourse={handleEditCourse}
onDeleteCourse={handleDeleteCourse}
onCreateCourse={handleCreateCourse}
onUpdateCourse={handleUpdateCourse}
editingCourse={editingCourse}
/>
);

case 'course-modules':
return (
<TeacherCourseModules
selectedCourse={selectedCourse}
onBackToCourses={() => {
setActiveSection('courses');
setSelectedCourse(null);
}}
onAddModule={handleAddModule}
onDeleteModule={handleDeleteModule}
/>
);

case 'assignments':
return (
<TeacherAssignments
assignments={assignments}
courses={courses}
loadingAssignments={loadingAssignments}
onCreateAssignment={handleCreateAssignment}
onUpdateAssignment={handleUpdateAssignment}
onDeleteAssignment={handleDeleteAssignment}
onEditAssignment={handleEditAssignment}
editingAssignment={editingAssignment}
/>
);

case 'students':
return <TeacherStudents />;

case 'profile':
return (
  <TeacherProfile
    user={user}
    onUpdate={(updatedUser) => {
      setUser(updatedUser);
    }}
  />
);

case 'payments':
return (
  <TeacherPayments
    teacherData={teacherRevenue}
    loadingPayments={loadingPayments}
    onRefresh={fetchTeacherRevenue}
  />
);

case 'contact':
return <ContactUs />;

// case 'grades':
// return <TeacherGrades />; // Commented out for now

default:
return <div>Section not found</div>;
}
};

return (
<DashboardContainer>
{/* Mobile Hamburger Menu Button */}
<MobileMenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
  {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
</MobileMenuButton>

{/* Mobile Overlay */}
{isSidebarOpen && <MobileOverlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />}

<TeacherSidebar
activeSection={activeSection}
onSectionChange={(section) => {
  handleSectionChange(section);
  setIsSidebarOpen(false); // Close sidebar on mobile when section changes
}}
user={user}
onLogout={handleLogout}
isOpen={isSidebarOpen}
onClose={() => setIsSidebarOpen(false)}
/>

<ContentWrapper>
{renderContent()}
</ContentWrapper>
</DashboardContainer>
);
};

export default TeacherDashboard;