import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, resetLoading } from '@/redux/authSlice';

const useAuth = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Reset loading state on app initialization
        dispatch(resetLoading());
        

        console.log('Auth hook loaded - relying on login for user data');
    }, [dispatch]);
};

export default useAuth; 