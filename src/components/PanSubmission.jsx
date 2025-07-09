import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Toast from '@/components/ui/Toast';
import Navbar from './shared/Navbar';
import axios from 'axios';

const PanSubmission = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        panNumber: '',
        aadhaarNumber: '',
        dateOfBirth: '',
        mobileNumber: '',
        address: ''
    });
    
    const [files, setFiles] = useState({
        aadhaarFront: null,
        aadhaarBack: null,
        panCard: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    // Redirect if not logged in
    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        setFiles(prev => ({
            ...prev,
            [name]: fileList[0]
        }));
    };

    const validateForm = () => {
        // Check all required fields
        const requiredFields = ['fullName', 'panNumber', 'aadhaarNumber', 'dateOfBirth', 'mobileNumber', 'address'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        // Check all required files
        const requiredFiles = ['aadhaarFront', 'aadhaarBack', 'panCard'];
        const missingFiles = requiredFiles.filter(file => !files[file]);
        
        if (missingFiles.length > 0) {
            setError(`Please upload all required documents: ${missingFiles.join(', ')}`);
            return false;
        }

        // Validate PAN number format (basic)
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData.panNumber.toUpperCase())) {
            setError('Please enter a valid PAN number (format: ABCDE1234F)');
            return false;
        }

        // Validate Aadhaar number format (basic)
        const aadhaarRegex = /^[0-9]{12}$/;
        if (!aadhaarRegex.test(formData.aadhaarNumber)) {
            setError('Please enter a valid 12-digit Aadhaar number');
            return false;
        }

        // Validate mobile number
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const submitData = new FormData();
            
            // Append form fields
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            // Append files
            submitData.append('aadhaarFront', files.aadhaarFront);
            submitData.append('aadhaarBack', files.aadhaarBack);
            submitData.append('panCard', files.panCard);

            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/pan/submit`, submitData, {
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            if (response.data.success) {
                setSuccess('PAN submission created successfully! You will be redirected to home page.');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to submit PAN application');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
            setError(errorMessage);
            console.error('Submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null; // Will redirect to login
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

            <div className='container mx-auto px-4 py-8 max-w-4xl'>
                <div className='bg-white rounded-xl shadow-lg p-8'>
                    <div className='text-center mb-8'>
                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>PAN Card Application</h1>
                        <p className='text-gray-600'>Please fill in all the required details and upload necessary documents</p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        {/* Personal Information */}
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div>
                                <label htmlFor='fullName' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Full Name *
                                </label>
                                <input
                                    type='text'
                                    id='fullName'
                                    name='fullName'
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder='Enter your full name as per Aadhaar'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor='panNumber' className='block text-sm font-medium text-gray-700 mb-2'>
                                    PAN Number *
                                </label>
                                <input
                                    type='text'
                                    id='panNumber'
                                    name='panNumber'
                                    value={formData.panNumber}
                                    onChange={handleInputChange}
                                    placeholder='ABCDE1234F'
                                    maxLength={10}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase'
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor='aadhaarNumber' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Aadhaar Number *
                                </label>
                                <input
                                    type='text'
                                    id='aadhaarNumber'
                                    name='aadhaarNumber'
                                    value={formData.aadhaarNumber}
                                    onChange={handleInputChange}
                                    placeholder='123456789012'
                                    maxLength={12}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor='dateOfBirth' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Date of Birth *
                                </label>
                                <input
                                    type='date'
                                    id='dateOfBirth'
                                    name='dateOfBirth'
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor='mobileNumber' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Mobile Number *
                                </label>
                                <input
                                    type='tel'
                                    id='mobileNumber'
                                    name='mobileNumber'
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    placeholder='9876543210'
                                    maxLength={10}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    required
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-2'>
                                Address *
                            </label>
                            <textarea
                                id='address'
                                name='address'
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder='Enter your complete address'
                                rows={4}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                required
                            />
                        </div>

                        {/* Document Uploads */}
                        <div className='space-y-4'>
                            <h3 className='text-lg font-semibold text-gray-800'>Document Uploads *</h3>
                            
                            <div className='grid md:grid-cols-3 gap-6'>
                                <div>
                                    <label htmlFor='aadhaarFront' className='block text-sm font-medium text-gray-700 mb-2'>
                                        Aadhaar Front Image *
                                    </label>
                                    <input
                                        type='file'
                                        id='aadhaarFront'
                                        name='aadhaarFront'
                                        onChange={handleFileChange}
                                        accept='image/*'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor='aadhaarBack' className='block text-sm font-medium text-gray-700 mb-2'>
                                        Aadhaar Back Image *
                                    </label>
                                    <input
                                        type='file'
                                        id='aadhaarBack'
                                        name='aadhaarBack'
                                        onChange={handleFileChange}
                                        accept='image/*'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor='panCard' className='block text-sm font-medium text-gray-700 mb-2'>
                                        PAN Card Image *
                                    </label>
                                    <input
                                        type='file'
                                        id='panCard'
                                        name='panCard'
                                        onChange={handleFileChange}
                                        accept='image/*'
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className='flex justify-center pt-6'>
                            <Button
                                type='submit'
                                disabled={loading}
                                className='w-full md:w-auto px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition duration-300 disabled:opacity-50'
                            >
                                {loading ? 'Submitting...' : 'Submit PAN Application'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PanSubmission; 