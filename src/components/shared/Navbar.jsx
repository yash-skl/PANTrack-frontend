import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { setLogout } from '@/redux/authSlice';
import axios from 'axios';

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/v1/user/logout`, {
                withCredentials: true
            });

            if (response.data.success) {
                dispatch(setLogout());
                navigate('/');
            }
        } catch (error) {
            console.log('Logout error:', error);
            // Even if logout request fails, clear local state
            dispatch(setLogout());
            navigate('/');
        }
    };

    return (
        <div className='bg-[rgba(15,15,35,0.9)]'>
            <div className='flex justify-between items-center p-4 mx-auto max-w-7xl h-16'>
                {/* Logo */}
                <div>
                    <Link to='/'>
                        <Button variant='outline'>
                            <h1 className='text-2xl font-bold text-yellow-300'>PAN<span className='text-white'>Track</span></h1>
                        </Button>
                    </Link>
                </div>

                {/* Navbar Links */}
                <div className='flex gap-4 items-center'>
                    <Link to='/' className='text-white hover:text-yellow-300 transition-colors duration-300'>Home</Link>
                    <button className='text-white hover:text-yellow-300 transition-colors duration-300'>About</button>
                    {user && user.role === 'admin' && (
                        <Link to='/admin/dashboard' className='text-white hover:text-yellow-300 transition-colors duration-300'>
                            Admin Dashboard
                        </Link>
                    )}
                    {user && user.role === 'subadmin' && (
                        <Link to='/subadmin/dashboard' className='text-white hover:text-yellow-300 transition-colors duration-300'>
                            SubAdmin Dashboard
                        </Link>
                    )}
                    {user && user.role === 'user' && (
                        <Link to='/pan-submission' className='text-white hover:text-yellow-300 transition-colors duration-300'>
                            PAN Submission
                        </Link>
                    )}

                    {/* Authentication Buttons */}
                    {!user ? (
                        <div className='flex gap-2 ml-4'>
                            <Link to='/login'>
                                <Button variant='outline' className='text-white border-white hover:bg-white hover:text-gray-900 transition-colors duration-300'>
                                    Login
                                </Button>
                            </Link>
                            <Link to='/signup'>
                                <Button className='bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-300'>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className='flex gap-2 items-center ml-4'>
                            <span className='text-white'>Welcome, <span className='font-bold text-red-500'>{user?.name}</span> !</span>
                            <Button
                                onClick={logoutHandler}
                                variant='outline'
                                className='text-white border-white hover:bg-red-500 hover:border-red-500 transition-colors duration-300'
                            >
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar;