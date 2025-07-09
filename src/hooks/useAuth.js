import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '@/redux/authSlice';

const useAuth = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Since there's no profile endpoint in the backend,
        // we'll rely on login to set user data
        // and cookies/localStorage for persistence
        console.log('Auth hook loaded - relying on login for user data');
    }, [dispatch]);
};

export default useAuth; 