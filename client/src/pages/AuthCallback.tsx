import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../utils/api';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (!token) {
        toast.error('No authentication token received.');
        navigate('/login');
        return;
      }

      try {
        // Store token
        localStorage.setItem('token', token);

        // Verify token and get user data
        const response = await api.get('/api/auth/verify');
        const user = response.data.user;

        // Update auth context
        updateUser(user);

        toast.success('Successfully signed in!');
        navigate('/');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error('Failed to complete authentication.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">I</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600 mb-6">Please wait while we finish setting up your account.</p>
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;


