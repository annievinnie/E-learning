import React, { useState, useEffect } from 'react';
import { HeaderActions, PageTitle, SectionCard, SectionTitle, Button, EmptyState, FormGroup, FormLabel, ErrorText } from './AdminSharedStyles';
import API from '../../api';

const AdminMerchandise = () => {
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'General',
    isActive: true,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMerchandise();
  }, []);

  // Ensure form doesn't auto-close - only closes on user action or successful edit
  // No timeout or auto-close logic here

  const fetchMerchandise = async () => {
    setLoading(true);
    try {
      const response = await API.get('/merchandise/admin/all');
      if (response.data.success) {
        setMerchandise(response.data.merchandise || []);
      }
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      setMessage({ type: 'error', text: 'Failed to fetch merchandise.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Also allow URL input
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.stock === '' || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors in the form.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('category', formData.category);
      submitData.append('isActive', formData.isActive);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (formData.image) {
        submitData.append('image', formData.image); // URL
      }

      let response;
      if (editingItem) {
        response = await API.put(`/merchandise/admin/${editingItem._id}`, submitData);
      } else {
        response = await API.post('/merchandise/admin/create', submitData);
      }

      if (response.data.success) {
        const successMessage = editingItem ? 'Merchandise updated successfully!' : 'Merchandise created successfully!';
        setMessage({ type: 'success', text: successMessage });
        fetchMerchandise();
        
        // If editing, close the form after successful update
        if (editingItem) {
          setShowForm(false);
          setEditingItem(null);
        } else {
          // If creating new, reset form but keep it open for adding more items
          setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: 'General',
            isActive: true,
            image: ''
          });
          setImageFile(null);
          setErrors({});
          // Form stays open so admin can add more items
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: response.data?.message || 'Failed to save merchandise.' 
        });
      }
    } catch (error) {
      console.error('Error saving merchandise:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save merchandise. Please try again.';
      setMessage({ 
        type: 'error', 
        text: `Error: ${errorMessage}. Please check the console for details.`
      });
      // Keep form open on error so user can fix and retry
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      stock: item.stock || '',
      category: item.category || 'General',
      isActive: item.isActive !== undefined ? item.isActive : true,
      image: item.image || ''
    });
    setImageFile(null);
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merchandise item?')) {
      return;
    }

    try {
      const response = await API.delete(`/merchandise/admin/${id}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Merchandise deleted successfully!' });
        fetchMerchandise();
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete merchandise.' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: 'General',
      isActive: true,
      image: ''
    });
    setImageFile(null);
    setEditingItem(null);
    setShowForm(false);
    setErrors({});
  };

  return (
    <div>
      <HeaderActions>
        <PageTitle style={{ marginBottom: 0 }}>Merchandise Management</PageTitle>
        <Button variant="primary" onClick={() => { 
          setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: 'General',
            isActive: true,
            image: ''
          });
          setImageFile(null);
          setEditingItem(null);
          setErrors({});
          setMessage({ type: '', text: '' });
          setShowForm(true); 
        }}>
          + Add Merchandise
        </Button>
      </HeaderActions>

      {message.text && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            style={{
              background: 'none',
              border: 'none',
              color: message.type === 'success' ? '#155724' : '#721c24',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0 0.5rem',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <SectionCard style={{ marginBottom: '1.5rem' }}>
          <SectionTitle>{editingItem ? 'Edit Merchandise' : 'Add New Merchandise'}</SectionTitle>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <FormGroup>
                <FormLabel>Name *</FormLabel>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.name ? '#dc3545' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.name && <ErrorText>{errors.name}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <FormLabel>Category</FormLabel>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="General">General</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Books">Books</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </FormGroup>
            </div>

            <FormGroup>
              <FormLabel>Description *</FormLabel>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.description ? '#dc3545' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <FormGroup>
                <FormLabel>Price ($) *</FormLabel>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.price ? '#dc3545' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.price && <ErrorText>{errors.price}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <FormLabel>Stock *</FormLabel>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${errors.stock ? '#dc3545' : '#ccc'}`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.stock && <ErrorText>{errors.stock}</ErrorText>}
              </FormGroup>
            </div>

            <FormGroup>
              <FormLabel>Image</FormLabel>
              <div style={{ marginBottom: '0.5rem' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginBottom: '0.5rem' }}
                />
                <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>OR</div>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    marginTop: '0.5rem'
                  }}
                />
              </div>
              <small style={{ color: '#666' }}>Upload an image file or provide a URL</small>
            </FormGroup>

            <FormGroup>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Active (visible to students)</span>
              </label>
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle>All Merchandise ({merchandise.length})</SectionTitle>
        {loading ? (
          <EmptyState>Loading merchandise...</EmptyState>
        ) : merchandise.length === 0 ? (
          <EmptyState>No merchandise items found. Add your first item to get started!</EmptyState>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Image</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Stock</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchandise.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '1rem' }}>
                      {item.image && (
                        <img
                          src={item.image.startsWith('http') 
                            ? item.image 
                            : `${process.env.REACT_APP_API_URL}${item.image}`}
                          alt={item.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{item.category}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                      ${item.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{item.stock}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        backgroundColor: item.isActive ? '#d4edda' : '#f8d7da',
                        color: item.isActive ? '#155724' : '#721c24'
                      }}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Button variant="primary" size="small" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="small" onClick={() => handleDelete(item._id)}>
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
    </div>
  );
};

export default AdminMerchandise;

