import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, X } from 'lucide-react';
import API from '../api';
import AdminSidebar from '../components/AdminSidebar';
import AdminDashboardOverview from '../components/admin/AdminDashboardOverview';
import AdminStudents from '../components/admin/AdminStudents';
import AdminTeachers from '../components/admin/AdminTeachers';
import AdminCourses from '../components/admin/AdminCourses';
import AdminAllPayments from '../components/admin/AdminAllPayments';
import AdminMerchandise from '../components/admin/AdminMerchandise';
import AdminProfile from '../components/profile/AdminProfile';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [approvalPassword, setApprovalPassword] = useState('');
  const [approvalPasswordConfirm, setApprovalPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddTeacherForm, setShowAddTeacherForm] = useState(false);
  const [showEditTeacherForm, setShowEditTeacherForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState('approved'); // 'approved', 'pending', 'rejected', 'deleted'
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherFormData, setTeacherFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    isApproved: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastCheckedApplications, setLastCheckedApplications] = useState([]);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    pendingApplications: 0,
    totalRevenue: 0
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null); // For filtering courses by teacher
  const [teacherRevenue, setTeacherRevenue] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedTeacherForRevenue, setSelectedTeacherForRevenue] = useState(null); // For showing teacher revenue details

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
        if (response.data.user.role === 'admin') {
          fetchPendingApplications();
          fetchDashboardStats();
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Auto-refresh pending applications every 30 seconds
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingApplications(); // Fetch immediately
      const interval = setInterval(() => {
        fetchPendingApplications();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Track new applications
  useEffect(() => {
    if (pendingApplications.length > 0 && lastCheckedApplications.length > 0) {
      const newApps = pendingApplications.filter(app => 
        !lastCheckedApplications.some(oldApp => oldApp._id === app._id)
      );
      setNewApplicationsCount(newApps.length);
    } else if (pendingApplications.length > 0 && lastCheckedApplications.length === 0) {
      // First load - don't count as new
      setLastCheckedApplications(pendingApplications);
    }
  }, [pendingApplications, lastCheckedApplications]);

  // Update last checked when applications are fetched
  useEffect(() => {
    if (pendingApplications.length > 0) {
      setLastCheckedApplications(pendingApplications);
    }
  }, [pendingApplications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('[data-notification-container]')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchPendingApplications = async () => {
    try {
      const response = await API.get('/admin/pending-teachers');
      const newApps = response.data.applications || [];
      
      // Check for truly new applications (created in last 24 hours)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const newCount = newApps.filter(app => {
        const createdAt = new Date(app.createdAt || app.appliedAt);
        return createdAt > oneDayAgo;
      }).length;
      
      setPendingApplications(newApps);
      
      // Update new applications count
      if (newCount > 0 && newCount !== newApplicationsCount) {
        setNewApplicationsCount(newCount);
      }
    } catch (error) {
      console.error('Error fetching pending applications:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await API.get('/admin/dashboard/stats');
      if (response.data.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await API.get('/admin/students');
      if (response.data.success) {
        setStudents(response.data.students || []);
      } else {
        console.error('Failed to fetch students:', response.data);
        alert(response.data.message || 'Failed to fetch students. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch students. Please try again.';
      alert(errorMessage);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await API.get('/admin/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      } else {
        console.error('Failed to fetch courses:', response.data);
        alert(response.data.message || 'Failed to fetch courses. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch courses. Please try again.';
      alert(errorMessage);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchTeacherRevenue = async () => {
    setLoadingPayments(true);
    try {
      const response = await API.get('/admin/payments/teachers');
      console.log('Teacher revenue response:', response.data);
      if (response.data.success) {
        setTeacherRevenue(response.data.teachers || []);
      } else {
        console.error('Failed to fetch teacher revenue:', response.data);
        alert(response.data.message || 'Failed to fetch teacher revenue. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching teacher revenue:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch teacher revenue. Please try again.';
      alert(`Error: ${errorMessage} (Status: ${error.response?.status || 'Unknown'})`);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await API.delete(`/admin/courses/${courseId}`);
      if (response.data.success) {
        alert('Course deleted successfully!');
        // Refresh courses list
        fetchCourses();
        // Refresh dashboard stats
        fetchDashboardStats();
      } else {
        alert(response.data.message || 'Failed to delete course.');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete course. Please try again.';
      alert(errorMessage);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await API.get('/admin/teachers');
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Failed to fetch teachers. Please try again.');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchRejectedApplications = async () => {
    setLoadingTeachers(true);
    try {
      const response = await API.get('/admin/rejected-teachers');
      setRejectedApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching rejected applications:', error);
      alert('Failed to fetch rejected applications. Please try again.');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleFilterChange = (filter) => {
    setTeacherFilter(filter);
    if (filter === 'approved') {
      fetchTeachers();
    } else if (filter === 'pending') {
      fetchPendingApplications();
    } else if (filter === 'rejected') {
      fetchRejectedApplications();
    } else if (filter === 'deleted') {
      // Deleted teachers can't be fetched since we use hard delete
      setTeachers([]);
    }
  };

  const handleApproveApplication = (application) => {
    setSelectedApplication(application);
    setApprovalPassword('');
    setApprovalPasswordConfirm('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handleSubmitApproval = async () => {
    // Validate password
    if (!approvalPassword || approvalPassword.trim() === '') {
      setPasswordError('Password is required');
      return;
    }

    if (approvalPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (approvalPassword !== approvalPasswordConfirm) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError('');
    
    try {
      const response = await API.post(`/admin/approve-teacher/${selectedApplication._id}`, {
        password: approvalPassword
      });
      
      if (response.data.success) {
        alert('Teacher application approved successfully! Password has been set and email sent to teacher.');
        setShowPasswordModal(false);
        setApprovalPassword('');
        setApprovalPasswordConfirm('');
        setSelectedApplication(null);
        
        // Refresh based on current filter
        if (teacherFilter === 'pending') {
          fetchPendingApplications();
        } else if (teacherFilter === 'approved') {
          fetchTeachers();
        }
        // Also refresh dashboard stats
        fetchDashboardStats();
      } else {
        alert(response.data.message || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve application';
      alert(errorMessage);
    }
  };

  const handleRejectApplication = async (applicationId, reason) => {
    try {
      await API.post(`/admin/reject-teacher/${applicationId}`, { rejectionReason: reason });
      alert('Teacher application rejected');
      setShowApprovalModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
      fetchPendingApplications(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

  const openRejectionModal = (application) => {
    setSelectedApplication(application);
    setShowApprovalModal(true);
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
    // Reset form when switching sections
    if (section !== 'teachers') {
      setShowAddTeacherForm(false);
      setShowEditTeacherForm(false);
      setEditingTeacher(null);
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
      setFormErrors({});
      setEditFormErrors({});
    } else {
      // Fetch data based on current filter when switching to teachers section
      if (teacherFilter === 'approved') {
        fetchTeachers();
      } else if (teacherFilter === 'pending') {
        fetchPendingApplications();
      } else if (teacherFilter === 'rejected') {
        fetchRejectedApplications();
      }
    }
    
    // Fetch data when switching to students, courses, or payments sections
    if (section === 'students') {
      fetchStudents();
    } else if (section === 'courses') {
      fetchCourses();
      setSelectedTeacher(null); // Reset teacher filter when entering courses section
    } else if (section === 'dashboard') {
      fetchDashboardStats();
    } else if (section === 'payments') {
      fetchTeacherRevenue();
      setSelectedTeacherForRevenue(null); // Reset selected teacher when entering payments section
    }
  };

  const handleTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setTeacherFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Don't clear errors here - let them clear on blur or submit to avoid re-renders
  };

  const handleTeacherFormBlur = (e) => {
    const { name } = e.target;
    // Clear error when user leaves the field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateTeacherForm = () => {
    const errors = {};

    if (!teacherFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!teacherFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(teacherFormData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!teacherFormData.password.trim()) {
      errors.password = 'Password is required';
    } else if (teacherFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    const errors = validateTeacherForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post('/admin/teachers', teacherFormData);
      if (response.data.success) {
        alert(response.data.message || 'Teacher added successfully! Password has been set and email sent to teacher.');
      } else {
        alert(response.data.message || 'Teacher added successfully!');
      }
      
      // Reset form
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setFormErrors({});
      setShowAddTeacherForm(false);
      
      // Refresh teachers list
      fetchTeachers();
      // Refresh dashboard stats
      fetchDashboardStats();
    } catch (err) {
      console.error('Error adding teacher:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add teacher. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAddTeacher = () => {
    setShowAddTeacherForm(false);
    setTeacherFormData({ fullName: '', email: '', password: '' });
    setFormErrors({});
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      fullName: teacher.fullName || '',
      email: teacher.email || '',
      password: '', // Don't pre-fill password
      isApproved: teacher.isApproved !== undefined ? teacher.isApproved : true
    });
    setEditFormErrors({});
    setShowEditTeacherForm(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (editFormErrors[name]) {
      setEditFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Password is optional when editing, but if provided, must be at least 6 characters
    if (editFormData.password && editFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();

    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        isApproved: editFormData.isApproved
      };

      // Only include password if it was provided
      if (editFormData.password.trim()) {
        updateData.password = editFormData.password;
      }

      await API.put(`/admin/teachers/${editingTeacher.id || editingTeacher._id}`, updateData);
      alert('Teacher updated successfully!');
      
      // Reset form
      setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
      setEditFormErrors({});
      setShowEditTeacherForm(false);
      setEditingTeacher(null);
      
      // Refresh teachers list
      fetchTeachers();
    } catch (err) {
      console.error('Error updating teacher:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update teacher. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEditTeacher = () => {
    setShowEditTeacherForm(false);
    setEditingTeacher(null);
    setEditFormData({ fullName: '', email: '', password: '', isApproved: true });
    setEditFormErrors({});
  };

  const handleDeleteTeacher = async (teacherId) => {
    const teacher = teachers.find(t => (t.id || t._id) === teacherId);
    const teacherName = teacher?.fullName || 'this teacher';
    
    if (!window.confirm(`Are you sure you want to delete ${teacherName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/admin/teachers/${teacherId}`);
      alert('Teacher deleted successfully!');
      fetchTeachers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting teacher:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete teacher. Please try again.';
      alert(errorMessage);
    }
  };

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

  const PageTitle = styled.h1`
    font-size: 2.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  `;

  const PageSubtitle = styled.p`
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    font-weight: 400;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  `;

  const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  `;

  const StatCard = styled.div`
    background: linear-gradient(135deg, ${props => props.color1 || '#667eea'} 0%, ${props => props.color2 || '#764ba2'} 100%);
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    color: white;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      transition: all 0.5s ease;
    }

    &:hover::before {
      top: -30%;
      right: -30%;
    }
  `;

  const StatTitle = styled.h3`
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
  `;

  const StatValue = styled.div`
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
  `;

  const SectionCard = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 2rem;
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }
  `;

  const SectionTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 3px solid;
    border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
  `;

  const Button = styled.button`
    background: ${props => props.variant === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
      props.variant === 'success' ? 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' :
      props.variant === 'danger' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
      props.variant === 'warning' ? 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' :
      '#f0f0f0'};
    color: ${props => props.variant === 'secondary' ? '#333' : 'white'};
    border: none;
    padding: ${props => props.size === 'small' ? '0.5rem 1rem' : props.size === 'large' ? '1rem 2rem' : '0.75rem 1.5rem'};
    border-radius: 10px;
    cursor: pointer;
    font-size: ${props => props.size === 'small' ? '0.9rem' : props.size === 'large' ? '1.1rem' : '1rem'};
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  `;

  const ApplicationCard = styled.div`
    background: ${props => props.status === 'pending' ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' :
      props.status === 'rejected' ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' :
      'white'};
    padding: 1.5rem;
    border-radius: 12px;
    border: 2px solid ${props => props.status === 'pending' ? '#ff9800' : props.status === 'rejected' ? '#f44336' : '#e0e0e0'};
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
  `;

  const FormInput = styled.input`
    width: 100%;
    padding: 0.875rem;
    border: 2px solid ${props => props.error ? '#f44336' : '#e0e0e0'};
    border-radius: 10px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: all 0.3s ease;
    background: #fafafa;

    &:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  `;

  const FormLabel = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
  `;

  const FormGroup = styled.div`
    margin-bottom: 1.5rem;
  `;

  const ErrorText = styled.span`
    color: #f44336;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  const HeaderActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  `;

  const FilterSelect = styled.select`
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    border: 2px solid #e0e0e0;
    font-size: 1rem;
    cursor: pointer;
    background: white;
    transition: all 0.3s ease;
    font-weight: 500;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  `;

  const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: #999;
    font-style: italic;
  `;

  const TeacherCard = styled.div`
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }
  `;

  const NotificationBell = styled.div`
    position: relative;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 50%;
    background: ${props => props.hasNew ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'white'};
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
  `;

  const NotificationBadge = styled.div`
    position: absolute;
    top: -5px;
    right: -5px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(240, 147, 251, 0.5);
    animation: pulse 2s infinite;
  `;

  const NotificationDropdown = styled.div`
    position: absolute;
    top: 70px;
    right: 20px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 400px;
    max-height: 500px;
    overflow-y: auto;
    z-index: 1000;
    border: 2px solid #f0f0f0;

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;

  const NotificationHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 2px solid #f0f0f0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 16px 16px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const NotificationItem = styled.div`
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.isNew ? '#fff3e0' : 'white'};

    &:hover {
      background: #f8f9fa;
      transform: translateX(5px);
    }

    &:last-child {
      border-bottom: none;
    }
  `;

  const NotificationTitle = styled.div`
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
  `;

  const NotificationTime = styled.div`
    font-size: 0.8rem;
    color: #999;
  `;

  const NewBadge = styled.span`
    display: inline-block;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: 0.5rem;
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

  if (loading) {
    return <LoadingSpinner />;
  }

  // Content components for different sections
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <AdminDashboardOverview 
            user={user}
            dashboardStats={dashboardStats}
          />
        );

      case 'students':
        return (
          <AdminStudents
            students={students}
            loadingStudents={loadingStudents}
            onRefresh={fetchStudents}
            onRefreshDashboardStats={fetchDashboardStats}
          />
        );

      case 'teachers':
        return (
          <AdminTeachers
            teacherFilter={teacherFilter}
            onFilterChange={handleFilterChange}
            pendingApplications={pendingApplications}
            rejectedApplications={rejectedApplications}
            teachers={teachers}
            loadingTeachers={loadingTeachers}
            showAddTeacherForm={showAddTeacherForm}
            onShowAddTeacherForm={setShowAddTeacherForm}
            onRefreshTeachers={fetchTeachers}
            onRefreshPending={fetchPendingApplications}
            onRefreshRejected={fetchRejectedApplications}
            onRefreshDashboardStats={fetchDashboardStats}
          />
        );

      case 'courses':
        return (
          <AdminCourses
            courses={courses}
            loadingCourses={loadingCourses}
            selectedTeacher={selectedTeacher}
            onTeacherSelect={setSelectedTeacher}
            onRefresh={fetchCourses}
            onDeleteCourse={handleDeleteCourse}
          />
        );

      case 'analytics':
        return (
          <div>
            <PageTitle>Analytics</PageTitle>
            <SectionCard>
              <SectionTitle>Analytics & Reporting</SectionTitle>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Analytics and reporting features will be implemented here.</p>
            </SectionCard>
          </div>
        );

      case 'settings':
        return (
          <div>
            <PageTitle>System Settings</PageTitle>
            <SectionCard>
              <SectionTitle>System Configuration</SectionTitle>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>System settings and configuration will be implemented here.</p>
            </SectionCard>
          </div>
        );

      case 'messages':
        return (
          <div>
            <PageTitle>Messages</PageTitle>
            <SectionCard>
              <SectionTitle>Message Center</SectionTitle>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Message center and communication features will be implemented here.</p>
            </SectionCard>
          </div>
        );

      case 'reports':
        return (
          <div>
            <PageTitle>Reports</PageTitle>
            <SectionCard>
              <SectionTitle>Report Generation</SectionTitle>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Report generation and export features will be implemented here.</p>
            </SectionCard>
          </div>
        );

      case 'payments':
        return (
          <AdminAllPayments />
        );
      case 'merchandise':
        return <AdminMerchandise />;

      case 'profile':
        return (
          <AdminProfile
            user={user}
            onUpdate={(updatedUser) => {
              setUser(updatedUser);
            }}
          />
        );

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

      {/* Sidebar */}
      <AdminSidebar
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

      {/* Main Content */}
      <ContentWrapper>
        {/* Notification Bell */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }} data-notification-container>
          <NotificationBell 
            hasNew={newApplicationsCount > 0}
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (newApplicationsCount > 0) {
                setNewApplicationsCount(0); // Mark as read
              }
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            {pendingApplications.length > 0 && (
              <NotificationBadge>
                {pendingApplications.length > 99 ? '99+' : pendingApplications.length}
              </NotificationBadge>
            )}
          </NotificationBell>

          {/* Notification Dropdown */}
          {showNotifications && (
            <NotificationDropdown data-notification-container>
              <NotificationHeader>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Teacher Applications</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    {pendingApplications.length} pending application{pendingApplications.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button 
                  size="small" 
                  variant="secondary"
                  onClick={() => setShowNotifications(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
                >
                  ✕
                </Button>
              </NotificationHeader>
              
              {pendingApplications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  No pending applications
                </div>
              ) : (
                pendingApplications
                  .sort((a, b) => new Date(b.createdAt || b.appliedAt) - new Date(a.createdAt || a.appliedAt))
                  .slice(0, 5)
                  .map((application) => {
                    const createdAt = new Date(application.createdAt || application.appliedAt);
                    const now = new Date();
                    const hoursAgo = (now - createdAt) / (1000 * 60 * 60);
                    const isNew = hoursAgo < 24;

                    return (
                      <NotificationItem 
                        key={application._id} 
                        isNew={isNew}
                        onClick={() => {
                          setActiveSection('teachers');
                          setTeacherFilter('pending');
                          setShowNotifications(false);
                        }}
                      >
                        <NotificationTitle>
                          {application.fullName}
                          {isNew && <NewBadge>NEW</NewBadge>}
                        </NotificationTitle>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                          {application.email}
                        </div>
                        {application.coursesKnown && application.coursesKnown.length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' }}>
                            Courses: {application.coursesKnown.slice(0, 3).join(', ')}
                            {application.coursesKnown.length > 3 && '...'}
                          </div>
                        )}
                        <NotificationTime>
                          {hoursAgo < 1 
                            ? `${Math.floor(hoursAgo * 60)} minutes ago`
                            : hoursAgo < 24 
                            ? `${Math.floor(hoursAgo)} hours ago`
                            : `${Math.floor(hoursAgo / 24)} days ago`
                          }
                        </NotificationTime>
                      </NotificationItem>
                    );
                  })
              )}
              
              {pendingApplications.length > 5 && (
                <div style={{ 
                  padding: '1rem', 
                  textAlign: 'center', 
                  borderTop: '1px solid #f0f0f0',
                  background: '#f8f9fa'
                }}>
                  <Button 
                    variant="primary" 
                    size="small"
                    onClick={() => {
                      setActiveSection('teachers');
                      setTeacherFilter('pending');
                      setShowNotifications(false);
                    }}
                  >
                    View All {pendingApplications.length} Applications
                  </Button>
                </div>
              )}
            </NotificationDropdown>
          )}
        </div>

        {renderContent()}
      </ContentWrapper>
    </DashboardContainer>
  );
};

export default AdminDashboard;
