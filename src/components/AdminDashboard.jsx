import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Toast from '@/components/ui/Toast';
import Navbar from './shared/Navbar';
import axios from 'axios';

const AdminDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });

    // Enhanced filter states
    const [filters, setFilters] = useState({
        status: 'all',
        user: 'all',
        startDate: '',
        endDate: ''
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

    // Fetch PAN submissions using existing endpoint
    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/v1/pan/`, {
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                },
                withCredentials: true
            });

            if (response.data.success) {
                const allSubmissions = response.data.data || [];
                setSubmissions(allSubmissions);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error fetching submissions';
            setError(errorMessage);
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update submission status using existing endpoint
    const updateStatus = async (submissionId, newStatus) => {
        try {
            const response = await axios.put(
                `http://localhost:8000/api/v1/pan/update/${submissionId}`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${user?.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                setSuccess(`Status updated to ${newStatus}`);
                fetchSubmissions(); // Refresh the list
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error updating status';
            setError(errorMessage);
            console.error('Error updating status:', error);
        }
    };

    // Calculate stats from submissions data
    const calculateStats = (submissions) => {
        if (!submissions || submissions.length === 0) {
            return {
                totalSubmissions: 0,
                pendingSubmissions: 0,
                reviewedSubmissions: 0,
                approvedSubmissions: 0,
                rejectedSubmissions: 0
            };
        }

        return {
            totalSubmissions: submissions.length,
            pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
            reviewedSubmissions: submissions.filter(s => s.status === 'reviewed').length,
            approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
            rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length
        };
    };

    // Get unique users for filter dropdown
    const getUniqueUsers = () => {
        if (!submissions || submissions.length === 0) return [];
        
        const users = submissions
            .filter(submission => submission.user) // Only submissions with user data
            .map(submission => ({
                id: submission.user._id,
                name: submission.user.name,
                email: submission.user.email
            }));
        
        // Remove duplicates based on user ID
        const uniqueUsers = users.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    };

    // Enhanced filter function for submissions
    const getFilteredSubmissions = () => {
        if (!submissions || submissions.length === 0) return [];
        
        let filtered = [...submissions];

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(submission => submission.status === filters.status);
        }

        // Filter by user
        if (filters.user !== 'all') {
            filtered = filtered.filter(submission => submission.user?._id === filters.user);
        }

        // Filter by date range
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setHours(0, 0, 0, 0); // Start of day
            filtered = filtered.filter(submission => {
                const submissionDate = new Date(submission.submissionDate);
                return submissionDate >= startDate;
            });
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            filtered = filtered.filter(submission => {
                const submissionDate = new Date(submission.submissionDate);
                return submissionDate <= endDate;
            });
        }

        return filtered;
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            status: 'all',
            user: 'all',
            startDate: '',
            endDate: ''
        });
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'reviewed': return 'bg-blue-100 text-blue-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Handle viewing images
    const viewImage = (imageUrl, title) => {
        setSelectedImage({ url: imageUrl, title });
        setShowImageModal(true);
    };

    // Handle viewing submission details
    const viewSubmissionDetails = (submission) => {
        setSelectedSubmission(submission);
    };

    // Close modals
    const closeModal = () => {
        setShowImageModal(false);
        setSelectedSubmission(null);
        setSelectedImage({ url: '', title: '' });
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchSubmissions();
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

    const stats = calculateStats(submissions);
    const filteredSubmissions = getFilteredSubmissions();
    const uniqueUsers = getUniqueUsers();

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
                {/* Dashboard Header */}
                <div className='mb-8 flex justify-between items-center'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Admin Dashboard</h1>
                        <p className='text-gray-600'>Manage PAN submissions and view statistics</p>
                    </div>
                    <div>
                        <Button
                            onClick={() => navigate('/subadmin-management')}
                            className='bg-purple-500 hover:bg-purple-600 text-white'
                        >
                            Manage SubAdmins
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <h3 className='text-sm font-medium text-gray-500'>Total Submissions</h3>
                        <p className='text-2xl font-bold text-gray-900'>{stats.totalSubmissions}</p>
                    </div>
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <h3 className='text-sm font-medium text-gray-500'>Pending</h3>
                        <p className='text-2xl font-bold text-yellow-600'>{stats.pendingSubmissions}</p>
                    </div>
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <h3 className='text-sm font-medium text-gray-500'>Reviewed</h3>
                        <p className='text-2xl font-bold text-blue-600'>{stats.reviewedSubmissions}</p>
                    </div>
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <h3 className='text-sm font-medium text-gray-500'>Approved</h3>
                        <p className='text-2xl font-bold text-green-600'>{stats.approvedSubmissions}</p>
                    </div>
                    <div className='bg-white p-6 rounded-lg shadow'>
                        <h3 className='text-sm font-medium text-gray-500'>Rejected</h3>
                        <p className='text-2xl font-bold text-red-600'>{stats.rejectedSubmissions}</p>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <div className='bg-white p-6 rounded-lg shadow mb-6'>
                    <h2 className='text-lg font-semibold text-gray-800 mb-4'>Filter Submissions</h2>
                    <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                        {/* Status Filter */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Status</label>
                            <select
                                name='status'
                                value={filters.status}
                                onChange={handleFilterChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            >
                                <option value='all'>All Statuses</option>
                                <option value='pending'>Pending</option>
                                <option value='reviewed'>Reviewed</option>
                                <option value='approved'>Approved</option>
                                <option value='rejected'>Rejected</option>
                            </select>
                        </div>

                        {/* User Filter */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>User</label>
                            <select
                                name='user'
                                value={filters.user}
                                onChange={handleFilterChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            >
                                <option value='all'>All Users</option>
                                {uniqueUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date Filter */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Start Date</label>
                            <input
                                type='date'
                                name='startDate'
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            />
                        </div>

                        {/* End Date Filter */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>End Date</label>
                            <input
                                type='date'
                                name='endDate'
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            />
                        </div>

                        {/* Reset Button */}
                        <div className='flex items-end'>
                            <Button
                                onClick={resetFilters}
                                variant='outline'
                                className='w-full px-4 py-2 rounded-lg'
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                    
                    {/* Filter Summary */}
                    <div className='mt-4 text-sm text-gray-600'>
                        Showing {filteredSubmissions.length} of {submissions.length} submissions
                        {filters.status !== 'all' && ` • Status: ${filters.status}`}
                        {filters.user !== 'all' && ` • User: ${uniqueUsers.find(u => u.id === filters.user)?.name}`}
                        {filters.startDate && ` • From: ${new Date(filters.startDate).toLocaleDateString()}`}
                        {filters.endDate && ` • To: ${new Date(filters.endDate).toLocaleDateString()}`}
                    </div>
                </div>

                {/* Submissions Table */}
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                        <h2 className='text-lg font-semibold text-gray-800'>PAN Submissions</h2>
                    </div>

                    {loading ? (
                        <div className='p-8 text-center'>
                            <div className='text-gray-500'>Loading submissions...</div>
                        </div>
                    ) : !filteredSubmissions || filteredSubmissions.length === 0 ? (
                        <div className='p-8 text-center'>
                            <div className='text-gray-500'>No submissions found</div>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            User
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            PAN Number
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Full Name
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Submission Date
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Status
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Images
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {filteredSubmissions.map((submission) => (
                                        <tr key={submission._id} className='hover:bg-gray-50'>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='text-sm font-medium text-gray-900'>
                                                    {submission.user?.name || 'N/A'}
                                                </div>
                                                <div className='text-sm text-gray-500'>
                                                    {submission.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                {submission.panNumber}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                {submission.fullName}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                                {formatDate(submission.submissionDate)}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                                                    {submission.status}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                <div className='flex flex-col space-y-1'>
                                                    <button
                                                        onClick={() => viewImage(submission.aadhaarFrontImage, 'Aadhaar Front')}
                                                        className='text-blue-600 hover:text-blue-900 text-xs'
                                                    >
                                                        View Aadhaar Front
                                                    </button>
                                                    <button
                                                        onClick={() => viewImage(submission.aadhaarBackImage, 'Aadhaar Back')}
                                                        className='text-blue-600 hover:text-blue-900 text-xs'
                                                    >
                                                        View Aadhaar Back
                                                    </button>
                                                    <button
                                                        onClick={() => viewImage(submission.panCardImage, 'PAN Card')}
                                                        className='text-blue-600 hover:text-blue-900 text-xs'
                                                    >
                                                        View PAN Card
                                                    </button>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                <div className='flex flex-col space-y-1'>
                                                    <button
                                                        onClick={() => viewSubmissionDetails(submission)}
                                                        className='text-purple-600 hover:text-purple-900 text-xs'
                                                    >
                                                        View Details
                                                    </button>
                                                    {submission.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(submission._id, 'reviewed')}
                                                                className='text-blue-600 hover:text-blue-900 text-xs'
                                                            >
                                                                Mark Reviewed
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(submission._id, 'approved')}
                                                                className='text-green-600 hover:text-green-900 text-xs'
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(submission._id, 'rejected')}
                                                                className='text-red-600 hover:text-red-900 text-xs'
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {submission.status === 'reviewed' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(submission._id, 'approved')}
                                                                className='text-green-600 hover:text-green-900 text-xs'
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(submission._id, 'rejected')}
                                                                className='text-red-600 hover:text-red-900 text-xs'
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Image Modal */}
                {showImageModal && (
                    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold text-gray-800'>{selectedImage.title}</h3>
                                <button
                                    onClick={closeModal}
                                    className='text-gray-500 hover:text-gray-700 text-2xl'
                                >
                                    ×
                                </button>
                            </div>
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                className='max-w-full max-h-[70vh] object-contain mx-auto'
                            />
                        </div>
                    </div>
                )}

                {/* Submission Details Modal */}
                {selectedSubmission && (
                    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
                        <div className='bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-auto'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-lg font-semibold text-gray-800'>Submission Details</h3>
                                <button
                                    onClick={closeModal}
                                    className='text-gray-500 hover:text-gray-700 text-2xl'
                                >
                                    ×
                                </button>
                            </div>
                            <div className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700'>Full Name</label>
                                        <p className='text-sm text-gray-900'>{selectedSubmission.fullName}</p>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700'>PAN Number</label>
                                        <p className='text-sm text-gray-900'>{selectedSubmission.panNumber}</p>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700'>Aadhaar Number</label>
                                        <p className='text-sm text-gray-900'>{selectedSubmission.aadhaarNumber}</p>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700'>Date of Birth</label>
                                        <p className='text-sm text-gray-900'>{new Date(selectedSubmission.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700'>Mobile Number</label>
                                        <p className='text-sm text-gray-900'>{selectedSubmission.mobileNumber}</p>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700'>Status</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                                            {selectedSubmission.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Address</label>
                                    <p className='text-sm text-gray-900'>{selectedSubmission.address}</p>
                                </div>
                                <div className='flex space-x-4 mt-6'>
                                    <button
                                        onClick={() => viewImage(selectedSubmission.aadhaarFrontImage, 'Aadhaar Front')}
                                        className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                                    >
                                        View Aadhaar Front
                                    </button>
                                    <button
                                        onClick={() => viewImage(selectedSubmission.aadhaarBackImage, 'Aadhaar Back')}
                                        className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                                    >
                                        View Aadhaar Back
                                    </button>
                                    <button
                                        onClick={() => viewImage(selectedSubmission.panCardImage, 'PAN Card')}
                                        className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                                    >
                                        View PAN Card
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 