import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { setLoading, setError } from '@/redux/authSlice';
import Toast from '@/components/ui/Toast';
import axios from 'axios';

const Signup = () => {
    const [input, setInput] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        file: null
    });

    const { loading, error } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', input.name);
        formData.append('email', input.email);
        formData.append('password', input.password);
        formData.append('role', input.role);
        if (input.file) {
            formData.append('file', input.file);
        }

        try {
            dispatch(setLoading(true));
            
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/user/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
            
            if (response.data.success) {
                setSuccessMessage('Account created successfully! Please login.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                dispatch(setError(null));
            } else {
                dispatch(setError(response.data.message || 'Registration failed'));
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
            dispatch(setError(errorMessage));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-8'>
            <Toast 
                message={error} 
                type="error" 
                onClose={() => dispatch(setError(null))} 
            />
            <Toast 
                message={successMessage} 
                type="success" 
                onClose={() => setSuccessMessage('')} 
            />
            <div className='bg-white p-8 rounded-xl shadow-2xl w-full max-w-md'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800'>Create Account</h1>
                    <p className='text-gray-600 mt-2'>Join PANTrack today</p>
                </div>
                
                <form onSubmit={submitHandler}>
                    <div className='mb-4'>
                        <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                            Full Name
                        </label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            value={input.name}
                            onChange={changeEventHandler}
                            placeholder='Enter your full name'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            required
                        />
                    </div>
                    
                    <div className='mb-4'>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                            Email
                        </label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={input.email}
                            onChange={changeEventHandler}
                            placeholder='Enter your email'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            required
                        />
                    </div>
                    
                    <div className='mb-4'>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                            Password
                        </label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            value={input.password}
                            onChange={changeEventHandler}
                            placeholder='Enter your password'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            required
                        />
                    </div>
                    
                    <div className='mb-4'>
                        <label htmlFor='role' className='block text-sm font-medium text-gray-700 mb-2'>
                            Register as
                        </label>
                        <select
                            id='role'
                            name='role'
                            value={input.role}
                            onChange={changeEventHandler}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                        >
                            <option value='user'>User</option>
                            <option value='admin'>Admin</option>
                        </select>
                    </div>
                    
                    <div className='mb-6'>
                        <label htmlFor='file' className='block text-sm font-medium text-gray-700 mb-2'>
                            Profile Photo (Optional)
                        </label>
                        <input
                            type='file'
                            id='file'
                            name='file'
                            accept='image/*'
                            onChange={changeFileHandler}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500'
                        />
                    </div>
                    
                    <Button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300'
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
                
                <div className='text-center mt-6'>
                    <p className='text-gray-600'>
                        Already have an account?{' '}
                        <Link to='/login' className='text-yellow-500 hover:text-yellow-600 font-medium'>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup; 