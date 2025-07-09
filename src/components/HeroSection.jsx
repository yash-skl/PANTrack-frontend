import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const HeroSection = () => {
    return (
        <div className='bg-[#0F0F23] h-screen flex items-center justify-center'>
            <div className='text-center max-w-4xl mx-auto px-4'>
                <h1 className='text-5xl md:text-6xl font-bold text-white mb-6'>
                    Welcome to <span className='text-yellow-300'>PAN</span>Track
                </h1>
                <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto'>
                    Streamline your PAN card application process with our comprehensive tracking and management system.
                </p>
                <div className='flex gap-4 justify-center flex-wrap'>
                    <Link to='/signup'>
                        <Button className='bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 text-lg font-semibold transition-colors duration-300'>
                            Get Started
                        </Button>
                    </Link>
                    <Link to='/login'>
                        <Button variant='outline' className='text-white border-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg font-semibold transition-colors duration-300'>
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default HeroSection;