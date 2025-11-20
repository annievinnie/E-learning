import React, { useState, useEffect } from 'react';
import API from '../../api';
import { 
  Mail, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MessageSquare,
  Clock
} from 'lucide-react';

const AdminContactUs = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read, responded
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await API.get('/contact/admin/all');
      if (response.data.success) {
        setContacts(response.data.contacts);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get('/contact/admin/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (contactId) => {
    try {
      const response = await API.put(`/contact/admin/mark-read/${contactId}`);
      if (response.data.success) {
        setContacts(contacts.map(contact => 
          contact._id === contactId 
            ? { ...contact, isRead: true }
            : contact
        ));
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      alert('Failed to mark as read');
    }
  };

  const handleMarkAsResponded = async (contactId) => {
    try {
      const response = await API.put(`/contact/admin/mark-responded/${contactId}`, {
        response: responseText,
      });
      if (response.data.success) {
        setContacts(contacts.map(contact => 
          contact._id === contactId 
            ? { ...contact, responded: true, response: responseText, isRead: true }
            : contact
        ));
        setSelectedContact(null);
        setResponseText('');
        fetchUnreadCount();
        alert('Marked as responded successfully');
      }
    } catch (error) {
      console.error('Error marking as responded:', error);
      alert('Failed to mark as responded');
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) {
      return;
    }
    try {
      const response = await API.delete(`/contact/admin/delete/${contactId}`);
      if (response.data.success) {
        setContacts(contacts.filter(contact => contact._id !== contactId));
        if (selectedContact?._id === contactId) {
          setSelectedContact(null);
        }
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'unread') return !contact.isRead;
    if (filter === 'read') return contact.isRead && !contact.responded;
    if (filter === 'responded') return contact.responded;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <MessageSquare className="text-indigo-600" size={32} />
              Contact Us Submissions
            </h2>
            <p className="text-gray-600 mt-1">Manage and respond to contact form submissions</p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <Mail size={20} />
              <span className="font-bold">{unreadCount} Unread</span>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({contacts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unread ({contacts.filter(c => !c.isRead).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'read'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Read ({contacts.filter(c => c.isRead && !c.responded).length})
          </button>
          <button
            onClick={() => setFilter('responded')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'responded'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Responded ({contacts.filter(c => c.responded).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No contact submissions found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedContact?._id === contact._id
                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                        : contact.isRead
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => {
                      setSelectedContact(contact);
                      setResponseText(contact.response || '');
                      if (!contact.isRead) {
                        handleMarkAsRead(contact._id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={18} className="text-gray-500" />
                          <h3 className="font-semibold text-gray-800">{contact.fullName}</h3>
                          {!contact.isRead && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                          {contact.responded && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle size={12} />
                              Responded
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            {contact.email}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(contact.userRole)}`}>
                            {contact.userRole || 'Guest'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{contact.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Calendar size={14} />
                          {formatDate(contact.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(contact._id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Contact Details</h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-800 font-semibold">{selectedContact.fullName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{selectedContact.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getRoleBadgeColor(selectedContact.userRole)}`}>
                    {selectedContact.userRole || 'Guest'}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <p className="text-gray-800 text-sm">{formatDate(selectedContact.createdAt)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>

                {selectedContact.response && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Admin Response</label>
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedContact.response}</p>
                    </div>
                  </div>
                )}

                {!selectedContact.responded && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Add Response (Optional)
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Enter your response..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                    <button
                      onClick={() => handleMarkAsResponded(selectedContact._id)}
                      className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Mark as Responded
                    </button>
                  </div>
                )}

                {selectedContact.responded && (
                  <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-green-800 font-medium">This contact has been responded to</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Select a contact to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactUs;

