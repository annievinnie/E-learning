import React, { useState, useEffect } from 'react';
import { HeaderActions, PageTitle, SectionCard, SectionTitle, Button, EmptyState } from './AdminSharedStyles';
import API from '../../api';

const AdminAllPayments = () => {
  const [payments, setPayments] = useState({ courses: [], merchandise: [], totals: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'courses', 'merchandise'
  const [filterTeacher, setFilterTeacher] = useState(null);
  const [filterCourse, setFilterCourse] = useState(null);

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/admin/payments/all');
      console.log('All payments response:', response.data);
      if (response.data.success && response.data.payments) {
        console.log('Payments data:', response.data.payments);
        setPayments(response.data.payments);
      } else {
        console.error('Failed to fetch payments:', response.data);
        setError(response.data?.message || 'Failed to fetch payments');
        setPayments({ courses: [], merchandise: [], totals: {} });
      }
    } catch (error) {
      console.error('Error fetching all payments:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch payments. Please check console for details.';
      setError(errorMsg);
      setPayments({ courses: [], merchandise: [], totals: {} });
    } finally {
      setLoading(false);
    }
  };

  // Get unique teachers from course payments
  const getUniqueTeachers = () => {
    const teachers = new Map();
    payments.courses.forEach(payment => {
      if (payment.course?.teacher) {
        const teacherId = payment.course.teacher.id;
        if (!teachers.has(teacherId)) {
          teachers.set(teacherId, payment.course.teacher);
        }
      }
    });
    return Array.from(teachers.values());
  };

  // Get unique courses from course payments
  const getUniqueCourses = () => {
    const courses = new Map();
    payments.courses.forEach(payment => {
      if (payment.course) {
        const courseId = payment.course.id;
        if (!courses.has(courseId)) {
          courses.set(courseId, payment.course);
        }
      }
    });
    return Array.from(courses.values());
  };

  // Filter payments based on active tab and filters
  const getFilteredPayments = () => {
    let filtered = [];
    
    if (activeTab === 'courses' || activeTab === 'all') {
      let coursePayments = [...payments.courses];
      
      if (filterTeacher) {
        coursePayments = coursePayments.filter(p => 
          p.course?.teacher?.id === filterTeacher
        );
      }
      
      if (filterCourse) {
        coursePayments = coursePayments.filter(p => 
          p.course?.id === filterCourse
        );
      }
      
      filtered = filtered.concat(coursePayments);
    }
    
    if (activeTab === 'merchandise' || activeTab === 'all') {
      filtered = filtered.concat(payments.merchandise);
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.createdAt);
      return dateB - dateA;
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayments = getFilteredPayments();

  return (
    <div>
      <HeaderActions>
        <PageTitle style={{ marginBottom: 0 }}>All Payments & Revenue</PageTitle>
        <Button variant="primary" size="small" onClick={fetchAllPayments} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </HeaderActions>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          Loading payments data...
        </div>
      )}

      {/* Summary Cards */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <SectionCard style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
              ${(payments.totals?.totalRevenue || 0).toFixed(2)}
            </div>
          </SectionCard>
          <SectionCard style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Course Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#56ab2f' }}>
              ${(payments.totals?.courseRevenue || 0).toFixed(2)}
            </div>
          </SectionCard>
          <SectionCard style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Merchandise Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f6d365' }}>
              ${(payments.totals?.merchandiseRevenue || 0).toFixed(2)}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => { setActiveTab('all'); setFilterTeacher(null); setFilterCourse(null); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'all' ? '#667eea' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}
        >
          All Payments ({payments.courses.length + payments.merchandise.length})
        </button>
        <button
          onClick={() => { setActiveTab('courses'); setFilterTeacher(null); setFilterCourse(null); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'courses' ? '#667eea' : 'transparent',
            color: activeTab === 'courses' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'courses' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}
        >
          Course Payments ({payments.courses.length})
        </button>
        <button
          onClick={() => { setActiveTab('merchandise'); setFilterTeacher(null); setFilterCourse(null); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'merchandise' ? '#667eea' : 'transparent',
            color: activeTab === 'merchandise' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'merchandise' ? '3px solid #667eea' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}
        >
          Merchandise Orders ({payments.merchandise.length})
        </button>
      </div>

      {/* Filters for Course Payments */}
      {activeTab === 'courses' || activeTab === 'all' ? (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <select
            value={filterTeacher || ''}
            onChange={(e) => { setFilterTeacher(e.target.value || null); setFilterCourse(null); }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">All Teachers</option>
            {getUniqueTeachers().map(teacher => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </select>
          <select
            value={filterCourse || ''}
            onChange={(e) => setFilterCourse(e.target.value || null)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
            disabled={!filterTeacher}
          >
            <option value="">All Courses</option>
            {getUniqueCourses()
              .filter(course => !filterTeacher || course.teacher?.id === filterTeacher)
              .map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
          </select>
          {(filterTeacher || filterCourse) && (
            <Button variant="secondary" size="small" onClick={() => { setFilterTeacher(null); setFilterCourse(null); }}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : null}

      {/* Payments Table */}
      <SectionCard>
        <SectionTitle>
          {activeTab === 'all' ? 'All Payments' : 
           activeTab === 'courses' ? 'Course Payments' : 
           'Merchandise Orders'} 
          ({filteredPayments.length})
        </SectionTitle>
        {loading ? (
          <EmptyState>Loading payments...</EmptyState>
        ) : filteredPayments.length === 0 ? (
          <EmptyState>No payments found.</EmptyState>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Details</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        backgroundColor: payment.type === 'course' ? '#e3f2fd' : '#fff3e0',
                        color: payment.type === 'course' ? '#1976d2' : '#f57c00',
                        fontWeight: '600'
                      }}>
                        {payment.type === 'course' ? 'Course' : 'Merchandise'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {payment.student ? (
                        <div>
                          <div style={{ fontWeight: '500' }}>{payment.student.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>{payment.student.email}</div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {payment.type === 'course' ? (
                        <div>
                          <div style={{ fontWeight: '500' }}>{payment.course?.title || 'Unknown Course'}</div>
                          {payment.course?.teacher && (
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              Teacher: {payment.course.teacher.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: '500' }}>Order #{payment.id.slice(-8)}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {payment.items?.length || 0} item(s)
                          </div>
                          {payment.items && payment.items.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                              {payment.items.slice(0, 2).map((item, idx) => (
                                <div key={idx}>
                                  {item.merchandise?.name || item.name} x{item.quantity}
                                </div>
                              ))}
                              {payment.items.length > 2 && <div>+{payment.items.length - 2} more</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                      ${(payment.amount || payment.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                      {formatDate(payment.completedAt || payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminAllPayments;

