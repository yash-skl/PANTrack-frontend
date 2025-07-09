import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from './shared/Navbar';
import HeroSection from './HeroSection';

const Home = () => {
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect logged-in users to their appropriate pages
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'subadmin') {
        navigate('/subadmin/dashboard');
      } else if (user.role === 'user') {
        navigate('/pan-submission');
      }
    }
  }, [user, navigate]);

  // Only show home page for non-logged-in users
  return (
    <div>
      <Navbar />
      <HeroSection />
    </div>
  )
}

export default Home;