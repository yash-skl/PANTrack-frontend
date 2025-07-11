import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Toast from '@/components/ui/Toast';
import Navbar from './shared/Navbar';
import { PAN_API_END_POINT } from '@/constants';
import axios from 'axios';

const SubAdminDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });
    const [showImageModal, setShowImageModal] = useState(false);



    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    // Redirect if not subadmin
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'subadmin') {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    // Fetch submissions on component mount
    useEffect(() => {
        if (user && user.role === 'subadmin') {
            fetchSubmissions();
        }
    }, [user]);

    // Fetch submissions using existing PAN endpoint
    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(PAN_API_END_POINT, {
                headers: {
                    'Authorization': `Bearer ${user?.accessToken}`,
                },
                withCredentials: true
            });

            if (response.data.success) {
                setSubmissions(response.data.data || []);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error fetching submissions';
            setError(errorMessage);
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update submission status using existing PAN endpoint (only if full-access)
    const updateStatus = async (submissionId, newStatus) => {
        // Check permissions from user data
        const permissions = user?.subAdminData?.permissions || 'view-only';
        if (permissions !== 'full-access') {
            setError('You do not have permission to update submission status');
            return;
        }

        try {
            const response = await axios.put(
                `${PAN_API_END_POINT}/update/${submissionId}`,
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



    // View image
    const viewImage = (imageUrl, title) => {
        setSelectedImage({ url: imageUrl, title });
        setShowImageModal(true);
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

    // Show loading if user is not yet loaded
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    // Show unauthorized if not subadmin
    if (user.role !== 'subadmin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Unauthorized - SubAdmin access required</div>
            </div>
        );
    }

    const stats = calculateStats(submissions);

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
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>SubAdmin Dashboard</h1>
                    <div className='flex items-center space-x-4'>
                        <p className='text-gray-600'>Welcome, {user.name}</p>
                        {user?.subAdminData && (
                            <span className={`px-3 py-1 text-sm rounded-full ${
                                user.subAdminData.permissions === 'full-access' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                                {user.subAdminData.permissions}
                            </span>
                        )}
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



                {/* Submissions Table */}
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                        <h2 className='text-lg font-semibold text-gray-800'>PAN Submissions</h2>
                    </div>

                    {loading ? (
                        <div className='p-8 text-center'>
                            <div className='text-gray-500'>Loading submissions...</div>
                        </div>
                    ) : !submissions || submissions.length === 0 ? (
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
                                        {user?.subAdminData?.permissions === 'full-access' && (
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {submissions.map((submission) => (
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
                                            {user?.subAdminData?.permissions === 'full-access' && (
                                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                    <div className='flex flex-col space-y-1'>
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
                                            )}
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
                                    onClick={() => setShowImageModal(false)}
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
            </div>
        </div>
    );
};

export default SubAdminDashboard; 