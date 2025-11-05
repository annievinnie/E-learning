import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import API from '../api';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
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

  const handleApproveApplication = async (applicationId) => {
    try {
      await API.post(`/admin/approve-teacher/${applicationId}`);
      alert('Teacher application approved successfully! Teacher can now login.');
      // Refresh based on current filter
      if (teacherFilter === 'pending') {
        fetchPendingApplications();
      } else if (teacherFilter === 'approved') {
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
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
  };

  const handleTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setTeacherFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
      await API.post('/admin/teachers', teacherFormData);
      alert('Teacher added successfully!');
      
      // Reset form
      setTeacherFormData({ fullName: '', email: '', password: '' });
      setFormErrors({});
      setShowAddTeacherForm(false);
      
      // Refresh teachers list
      fetchTeachers();
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
  `;

  const ContentWrapper = styled.div`
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    margin-left: 280px;
    min-height: calc(100vh - 4rem);
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
  `;

  const PageSubtitle = styled.p`
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    font-weight: 400;
  `;

  const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
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

  if (loading) {
    return <LoadingSpinner />;
  }

  // Content components for different sections
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <PageTitle>Dashboard Overview</PageTitle>
              <PageSubtitle>
                Welcome back, {user?.fullName}! Here's what's happening on your platform.
              </PageSubtitle>
            </div>

            <StatsGrid>
              <StatCard color1="#56ab2f" color2="#a8e063">
                <StatTitle>Total Students</StatTitle>
                <StatValue>1,234</StatValue>
              </StatCard>

              <StatCard color1="#f6d365" color2="#fda085">
                <StatTitle>Total Teachers</StatTitle>
                <StatValue>{teachers.length || 56}</StatValue>
              </StatCard>

              <StatCard color1="#667eea" color2="#764ba2">
                <StatTitle>Active Courses</StatTitle>
                <StatValue>89</StatValue>
              </StatCard>

              <StatCard color1="#f093fb" color2="#f5576c">
                <StatTitle>Pending Applications</StatTitle>
                <StatValue>{pendingApplications.length}</StatValue>
              </StatCard>
            </StatsGrid>
          </div>
        );

      case 'students':
        return (
          <div>
            <PageTitle>Students Management</PageTitle>
            <SectionCard>
              <SectionTitle>Student Management Features</SectionTitle>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Student management features will be implemented here.</p>
            </SectionCard>
          </div>
        );

      case 'teachers':
        return (
          <div>
            <HeaderActions>
              <PageTitle style={{ marginBottom: 0 }}>Teachers Management</PageTitle>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontWeight: '600', color: '#333', fontSize: '1rem' }}>Filter:</label>
                  <FilterSelect
                    value={teacherFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="deleted">Deleted</option>
                  </FilterSelect>
                </div>
                {teacherFilter === 'approved' && (
                  <Button variant="success" onClick={() => setShowAddTeacherForm(true)}>
                    + Add Teacher
                  </Button>
                )}
              </div>
            </HeaderActions>

            {/* Filter-based content display */}
            {teacherFilter === 'pending' && (
              <SectionCard>
                <SectionTitle>
                  Pending Teacher Applications ({pendingApplications.length})
                </SectionTitle>
                {loadingTeachers ? (
                  <EmptyState>Loading applications...</EmptyState>
                ) : pendingApplications.length === 0 ? (
                  <EmptyState>No pending applications found.</EmptyState>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingApplications.map((application) => (
                      <ApplicationCard key={application._id} status="pending">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#e65100', fontSize: '1.2rem' }}>
                              {application.fullName}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                <strong>Email:</strong> {application.email}
                              </p>
                              {application.age && (
                                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                  <strong>Age:</strong> {application.age}
                                </p>
                              )}
                              {application.phone && (
                                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                  <strong>Phone:</strong> {application.phone}
                                </p>
                              )}
                              {application.confidenceLevel && (
                                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                  <strong>Confidence Level:</strong> {application.confidenceLevel}
                                </p>
                              )}
                            </div>
                            {application.teachingExperience && (
                              <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                                <strong>Experience:</strong> {application.teachingExperience}
                              </p>
                            )}
                            {application.coursesKnown && application.coursesKnown.length > 0 && (
                              <div style={{ margin: '0.5rem 0' }}>
                                <strong style={{ color: '#666', fontSize: '0.9rem' }}>Courses:</strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                                  {application.coursesKnown.map((course, idx) => (
                                    <span key={idx} style={{
                                      background: '#e3f2fd',
                                      color: '#1976d2',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '12px',
                                      fontSize: '0.85rem'
                                    }}>
                                      {course}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>
                              Applied: {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Button variant="success" size="small" onClick={() => handleApproveApplication(application._id)}>
                              Approve
                            </Button>
                            <Button variant="danger" size="small" onClick={() => openRejectionModal(application)}>
                              Reject
                            </Button>
                          </div>
                        </div>
                      </ApplicationCard>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {teacherFilter === 'rejected' && (
              <SectionCard>
                <SectionTitle>
                  Rejected Teacher Applications ({rejectedApplications.length})
                </SectionTitle>
                {loadingTeachers ? (
                  <EmptyState>Loading applications...</EmptyState>
                ) : rejectedApplications.length === 0 ? (
                  <EmptyState>No rejected applications found.</EmptyState>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {rejectedApplications.map((application) => (
                      <ApplicationCard key={application._id} status="rejected">
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#c62828' }}>
                            {application.fullName}
                          </h4>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                            Email: {application.email}
                          </p>
                          {application.rejectionReason && (
                            <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontStyle: 'italic' }}>
                              Reason: {application.rejectionReason}
                            </p>
                          )}
                          <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                            Rejected: {application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </ApplicationCard>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {teacherFilter === 'deleted' && (
              <SectionCard>
                <SectionTitle>Deleted Teachers</SectionTitle>
                <EmptyState>
                  Deleted teachers cannot be viewed as they have been permanently removed from the system.
                </EmptyState>
              </SectionCard>
            )}

            {/* Add Teacher Form - only show for approved filter */}
            {teacherFilter === 'approved' && showAddTeacherForm && (
              <SectionCard>
                <SectionTitle>Add New Teacher</SectionTitle>
                <form onSubmit={handleAddTeacher}>
                  <FormGroup>
                    <FormLabel>Full Name *</FormLabel>
                    <FormInput
                      type="text"
                      name="fullName"
                      value={teacherFormData.fullName}
                      onChange={handleTeacherFormChange}
                      error={formErrors.fullName}
                      placeholder="Enter teacher's full name"
                    />
                    {formErrors.fullName && <ErrorText>{formErrors.fullName}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Email *</FormLabel>
                    <FormInput
                      type="email"
                      name="email"
                      value={teacherFormData.email}
                      onChange={handleTeacherFormChange}
                      error={formErrors.email}
                      placeholder="Enter teacher's email"
                    />
                    {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Password *</FormLabel>
                    <FormInput
                      type="password"
                      name="password"
                      value={teacherFormData.password}
                      onChange={handleTeacherFormChange}
                      error={formErrors.password}
                      placeholder="Enter password (min 6 characters)"
                    />
                    {formErrors.password && <ErrorText>{formErrors.password}</ErrorText>}
                  </FormGroup>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button type="submit" variant="success" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Teacher'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleCancelAddTeacher} disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </SectionCard>
            )}

            {/* Approved Teachers List */}
            {teacherFilter === 'approved' && (
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <SectionTitle style={{ marginBottom: 0 }}>
                    Approved Teachers ({teachers.filter(t => t.isApproved).length})
                  </SectionTitle>
                  <Button variant="primary" size="small" onClick={fetchTeachers}>
                    Refresh
                  </Button>
                </div>

                {loadingTeachers ? (
                  <EmptyState>Loading teachers...</EmptyState>
                ) : teachers.filter(t => t.isApproved).length === 0 ? (
                  <EmptyState>No approved teachers found. Add a teacher to get started.</EmptyState>
                ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '1rem'
                  }}>
                    <thead>
                      <tr style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderBottom: '2px solid #667eea',
                        color: 'white'
                      }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.filter(t => t.isApproved).map((teacher) => (
                        <tr 
                          key={teacher.id || teacher._id} 
                          style={{ 
                            borderBottom: '1px solid #eee',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{teacher.fullName}</td>
                          <td style={{ padding: '1rem', color: '#666' }}>{teacher.email}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                              color: 'white',
                              display: 'inline-block',
                              boxShadow: '0 2px 8px rgba(86, 171, 47, 0.3)'
                            }}>
                              {teacher.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#666' }}>
                            {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <Button variant="primary" size="small" onClick={() => handleEditTeacher(teacher)}>
                                Edit
                              </Button>
                              <Button variant="danger" size="small" onClick={() => handleDeleteTeacher(teacher.id || teacher._id)}>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </SectionCard>
            )}

            {/* Edit Teacher Form Modal */}
            {showEditTeacherForm && editingTeacher && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  maxWidth: '500px',
                  width: '90%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <h3 style={{ color: '#1976d2', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                    Edit Teacher
                  </h3>

                  <form onSubmit={handleUpdateTeacher}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={editFormData.fullName}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${editFormErrors.fullName ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter teacher's full name"
                      />
                      {editFormErrors.fullName && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {editFormErrors.fullName}
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
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${editFormErrors.email ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter teacher's email"
                      />
                      {editFormErrors.email && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {editFormErrors.email}
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
                        Password (leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditFormChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${editFormErrors.password ? '#f44336' : '#ccc'}`,
                          borderRadius: '4px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter new password (optional)"
                      />
                      {editFormErrors.password && (
                        <span style={{ color: '#f44336', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                          {editFormErrors.password}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500',
                        color: '#333',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          name="isApproved"
                          checked={editFormData.isApproved}
                          onChange={handleEditFormChange}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>Teacher is approved</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleCancelEditTeacher}
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          border: '1px solid #ccc',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: '#1976d2',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Teacher'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'courses':
        return (
          <div>
            <PageTitle>Courses Management</PageTitle>
            <SectionCard>
              <SectionTitle>Course Management Features</SectionTitle>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>Course management features will be implemented here.</p>
            </SectionCard>
          </div>
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

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <DashboardContainer>
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
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

        {/* Rejection Modal (rendered at top-level so it isn't nested incorrectly) */}
        {showApprovalModal && selectedApplication && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ marginTop: 0, color: '#f44336' }}>Reject Teacher Application</h3>
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to reject {selectedApplication?.fullName}'s application?
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Reason for rejection (optional):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedApplication(null);
                    setRejectionReason('');
                  }}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectApplication(selectedApplication._id, rejectionReason)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        )}
      </ContentWrapper>
    </DashboardContainer>
  );
};

export default AdminDashboard;
