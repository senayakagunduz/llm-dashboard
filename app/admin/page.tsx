'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Plus, Edit, Trash2, Loader2, Home, RotateCcw } from 'lucide-react';

interface User {
  _id: string;
  fullname: string; 
  email: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin'
  });
console.log("frontend email", formData.email)
  // Redirect if not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch users
  useEffect(() => {
    console.log('Session in admin panel:', session);
    if (session?.user?.role === 'admin') {
      console.log('User is admin, fetching users...');
      fetchUsers();
    } else {
      console.log('User is not admin or session not loaded yet');
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      console.log('Using email for admin check:', session?.user?.email);
      const res = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-email': session?.user?.email || ''
        },
        cache: 'no-store' // Prevent caching
      });

      console.log('API Response status:', res.status);
      const responseData = await res.json().catch(e => {
        console.error('Failed to parse response:', e);
        return { success: false, error: 'Invalid response from server' };
      });
      console.log('API Response data:', responseData);

      if (!res.ok) {
        console.error('Failed to fetch users:', res.status, responseData);
        alert(`Failed to load users: ${responseData.message || 'Unknown error'}`);
        return;
      }

      console.log('Fetched users:', responseData);

      if (responseData.success && responseData.data) {
        setUsers(responseData.data);
      } else {
        console.error('Unexpected response format:', responseData);
        alert('Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullname || !formData.email || (!editingUser && !formData.password)) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const isEdit = !!editingUser;
      const url = isEdit
        ? `/api/users?userId=${editingUser._id}`
        : '/api/users/create';

      const method = isEdit ? 'PUT' : 'POST';

      // Prepare the request body according to the User model
      const userData = {
        fullname: formData.fullname,
        email: formData.email,
        role: formData.role,
        ...(formData.password && { password: formData.password }), // Only include password if provided
        ...(!isEdit && { adminEmail: session?.user?.email }) // Only include for new users
      };
      console.log('=== FRONTEND DEBUG ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Request Data:', userData);
      console.log('Session:', session);

      console.log(`Sending ${method} request to ${url}`, userData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.email && { 'x-email': session.user.email })
        },
        credentials: 'include', // Important for sending cookies
        body: JSON.stringify(userData),
      });
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      
      // Get raw response text first
      const responseText = await response.text();
      console.log('Raw Response Text:', responseText);
      
      // Check if response is empty
      if (!responseText) {
        console.error('Empty response from server');
        throw new Error('Server response is empty. Please try again later.');
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed Response Data:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', {
          error: jsonError,
          responseText: responseText
        });
        throw new Error('Invalid response from server. Please try again later.');
      }

      console.log('API Response:', data);

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        const errorMessage = data?.message || 
                           data?.error || 
                           `Server error! Status code: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.success) {
        // Close the modal first for better UX
        setShowModal(false);
        
        // Show success message
        alert(isEdit ? 'User updated successfully' : 'User created successfully');
        
        // Reset form and refresh user list
        setEditingUser(null);
        setFormData({ fullname: '', email: '', password: '', role: 'user' });
        await fetchUsers(); // Refresh the user list
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullname: user.fullname, // Map to fullname for the form
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    // Prevent deleting admin users
    if (user.role === 'admin') {
      // Check if admin is trying to delete themselves
      if (user.email === session?.user?.email) {
        alert('You cannot delete your own admin account');
      } else {
        alert('Admin users cannot be deleted');
      }
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/users/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId,
            adminEmail: session?.user?.email 
          }),
        });

        const data = await response.json();

        if (data.success) {
          fetchUsers();
          alert('User deleted successfully');
        } else {
          alert(data.message || 'An error occurred');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user');
      }
    }
  };
  const handleReactivate = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reactivate`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message || 'Failed to reactivate user');
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      alert('An error occurred while reactivating the user');
    }
  };


  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Home size={24} className="cursor-pointer text-blue-600 ml-2" onClick={() => router.push('/')} />
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ fullname: '', email: '', password: '', role: 'user' });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive===true
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        title="Edit user"
                      >
                        <Edit size={18} />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!!editingUser}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required={!editingUser}
                    minLength={6}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
