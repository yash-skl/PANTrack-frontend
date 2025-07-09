import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { setLoading, setUser, setError } from '@/redux/authSlice';
import Toast from '@/components/ui/Toast';
import axios from 'axios';

const Login = () => {
    const [input, setInput] = useState({
        email: '',
        password: '',
        role: 'user'
    });

    const { loading, error } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        
        try {
            dispatch(setLoading(true));
            
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/user/login`, input, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            });
            
            if (response.data.success) {
                const userData = {
                    ...response.data.user,
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                };
                dispatch(setUser(userData));
                
                // Navigate based on user role
                if (userData.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                dispatch(setError(response.data.message || 'Login failed'));
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
            dispatch(setError(errorMessage));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden'>
            <Toast 
                message={error} 
                type="error" 
                onClose={() => dispatch(setError(null))} 
            />
            <div className='bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800'>Welcome Back</h1>
                    <p className='text-gray-600 mt-2'>Sign in to your account</p>
                </div>
                
                <form onSubmit={submitHandler}>
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
                    
                    <div className='mb-6'>
                        <label htmlFor='role' className='block text-sm font-medium text-gray-700 mb-2'>
                            Login as
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
                    
                    <Button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300'
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
                
                <div className='text-center mt-6'>
                    <p className='text-gray-600'>
                        Don't have an account?{' '}
                        <Link to='/signup' className='text-yellow-500 hover:text-yellow-600 font-medium'>
                            Sign up
                        </Link>
                    </p>
                    <p className='text-gray-600 mt-2'>
                        SubAdmin?{' '}
                        <Link to='/subadmin/login' className='text-purple-500 hover:text-purple-600 font-medium'>
                            SubAdmin Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 