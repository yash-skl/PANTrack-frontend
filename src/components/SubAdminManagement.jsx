import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Toast from '@/components/ui/Toast';
import Navbar from './shared/Navbar';
import axios from 'axios';
import { SUBADMIN_API_END_POINT } from '@/constants';

const SubAdminManagement = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        permissions: 'view-only',
        assignedGroups: []
    });

    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    // Redirect if not admin
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    // Fetch all subadmins
    const fetchSubAdmins = async () => {
        setLoading(true);
        try {
            const response = await axios.get(SUBADMIN_API_END_POINT, {
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                },
                withCredentials: true
            });

            if (response.data.success) {
                setSubAdmins(response.data.data || []);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error fetching subadmins';
            setError(errorMessage);
            console.error('Error fetching subadmins:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create subadmin
    const createSubAdmin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(
                `${SUBADMIN_API_END_POINT}/create`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setSuccess('SubAdmin created successfully');
                setShowCreateModal(false);
                setFormData({ name: '', email: '', password: '', permissions: 'view-only', assignedGroups: [] });
                fetchSubAdmins();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error creating subadmin';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Update subadmin
    const updateSubAdmin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.put(
                `${SUBADMIN_API_END_POINT}/${selectedSubAdmin._id}`,
                {
                    name: formData.name,
                    permissions: formData.permissions,
                    assignedGroups: formData.assignedGroups,
                    isActive: true
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setSuccess('SubAdmin updated successfully');
                setShowEditModal(false);
                setSelectedSubAdmin(null);
                setFormData({ name: '', email: '', password: '', permissions: 'view-only', assignedGroups: [] });
                fetchSubAdmins();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error updating subadmin';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Delete subadmin
    const deleteSubAdmin = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this subadmin? This action cannot be undone.')) return;

        try {
            const response = await axios.delete(
                `${SUBADMIN_API_END_POINT}/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user?.accessToken}`,
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setSuccess('SubAdmin permanently deleted from database');
                fetchSubAdmins();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error deleting subadmin';
            setError(errorMessage);
        }
    };





    // Handle form changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Open edit modal
    const openEditModal = (subAdmin) => {
        setSelectedSubAdmin(subAdmin);
        setFormData({
            name: subAdmin.user.name,
            email: subAdmin.user.email,
            password: '',
            permissions: subAdmin.permissions,
            assignedGroups: subAdmin.assignedGroups || []
        });
        setShowEditModal(true);
    };

    // Close modals
    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedSubAdmin(null);
        setFormData({ name: '', email: '', password: '', permissions: 'view-only', assignedGroups: [] });
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchSubAdmins();
        }
    }, [user]);

    // Show loading if user is not yet loaded
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    // Show unauthorized if not admin
    if (user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Unauthorized - Admin access required</div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <Navbar />

            <Toast
                message={error}
                type="error"
                onClose={() => setError('')}
            />
            <Toast
                message={success}
                type="success"
                onClose={() => setSuccess('')}
            />

            <div className='container mx-auto px-4 py-8'>
                {/* Header */}
                <div className='mb-8 flex justify-between items-center'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>SubAdmin Management</h1>
                        <p className='text-gray-600'>Manage subadmins and their permissions</p>
                    </div>
                    <div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className='bg-green-500 hover:bg-green-600 text-white'
                        >
                            Create SubAdmin
                        </Button>
                    </div>
                </div>

                {/* SubAdmins Table */}
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                        <h2 className='text-lg font-semibold text-gray-800'>SubAdmins</h2>
                    </div>

                    {loading ? (
                        <div className='p-8 text-center'>
                            <div className='text-gray-500'>Loading subadmins...</div>
                        </div>
                    ) : !subAdmins || subAdmins.length === 0 ? (
                        <div className='p-8 text-center'>
                            <div className='text-gray-500'>No subadmins found</div>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Name & Email
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Permissions
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Created Date
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Created By
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {subAdmins.map((subAdmin) => (
                                        <tr key={subAdmin._id} className='hover:bg-gray-50'>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='text-sm font-medium text-gray-900'>
                                                    {subAdmin.user?.name || 'N/A'}
                                                </div>
                                                <div className='text-sm text-gray-500'>
                                                    {subAdmin.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    subAdmin.permissions === 'full-access' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {subAdmin.permissions}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                {formatDate(subAdmin.createdAt)}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                {subAdmin.createdBy?.name || 'N/A'}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                <div className='flex space-x-2'>
                                                    <button
                                                        onClick={() => openEditModal(subAdmin)}
                                                        className='text-blue-600 hover:text-blue-900'
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSubAdmin(subAdmin._id)}
                                                        className='text-red-600 hover:text-red-900'
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

                {/* Create SubAdmin Modal */}
                {showCreateModal && (
                    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Create SubAdmin</h3>
                            <form onSubmit={createSubAdmin}>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Name</label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        required
                                    />
                                </div>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                                    <input
                                        type='email'
                                        name='email'
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        required
                                    />
                                </div>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                                    <input
                                        type='password'
                                        name='password'
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        required
                                    />
                                </div>
                                <div className='mb-6'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Permissions</label>
                                    <select
                                        name='permissions'
                                        value={formData.permissions}
                                        onChange={handleFormChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value='view-only'>View Only</option>
                                        <option value='full-access'>Full Access</option>
                                    </select>
                                </div>
                                <div className='flex justify-end space-x-4'>
                                    <Button
                                        type='button'
                                        onClick={closeModals}
                                        variant='outline'
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type='submit'
                                        disabled={loading}
                                        className='bg-green-500 hover:bg-green-600 text-white'
                                    >
                                        {loading ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit SubAdmin Modal */}
                {showEditModal && (
                    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Edit SubAdmin</h3>
                            <form onSubmit={updateSubAdmin}>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Name</label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        required
                                    />
                                </div>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                                    <input
                                        type='email'
                                        name='email'
                                        value={formData.email}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100'
                                        disabled
                                    />
                                </div>
                                <div className='mb-6'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Permissions</label>
                                    <select
                                        name='permissions'
                                        value={formData.permissions}
                                        onChange={handleFormChange}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value='view-only'>View Only</option>
                                        <option value='full-access'>Full Access</option>
                                    </select>
                                </div>
                                <div className='flex justify-end space-x-4'>
                                    <Button
                                        type='button'
                                        onClick={closeModals}
                                        variant='outline'
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type='submit'
                                        disabled={loading}
                                        className='bg-blue-500 hover:bg-blue-600 text-white'
                                    >
                                        {loading ? 'Updating...' : 'Update'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default SubAdminManagement; 