import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout, setCredentials } from '../features/authSlice'; 
import { authService } from '../services/auth.service';
import { tokenStore } from '../utils/tokenStore';

export const useInitializeAuth = () => {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await authService.verifySession();

        dispatch(
            setCredentials({
                id: response.data.id,
                email: response.data.email,
                role: response.data.role,
                accessToken: response.accessToken,
            })
        );
      } catch (error) {
        tokenStore.clear()
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    verifySession();
  }, [dispatch]);

  return { isInitializing };
};