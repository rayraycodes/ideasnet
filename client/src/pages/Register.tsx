import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'ENTHUSIAST'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        if (value.trim().length < 2) {
          return 'First name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;

      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        }
        if (value.trim().length < 2) {
          return 'Last name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;

      case 'email':
        const trimmedEmail = value.trim();
        if (!trimmedEmail) {
          return 'Email address is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          return 'Please enter a valid email address (e.g., name@example.com)';
        }
        // Additional validation: check for common mistakes
        if (trimmedEmail.includes('..')) {
          return 'Email cannot contain consecutive dots (..)';
        }
        if (trimmedEmail.startsWith('.') || trimmedEmail.startsWith('@')) {
          return 'Email cannot start with a dot or @ symbol';
        }
        if (trimmedEmail.endsWith('.') || trimmedEmail.endsWith('@')) {
          return 'Email cannot end with a dot or @ symbol';
        }
        return undefined;

      case 'username':
        if (!value.trim()) {
          return 'Username is required';
        }
        if (value.length < 3) {
          return 'Username must be at least 3 characters';
        }
        if (value.length > 20) {
          return 'Username must be 20 characters or less';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'Username can only contain letters, numbers, and underscores (no spaces)';
        }
        return undefined;

      case 'password':
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        if (value.length > 100) {
          return 'Password must be 100 characters or less';
        }
        return undefined;

      case 'confirmPassword':
        if (!value) {
          return 'Please confirm your password';
        }
        if (value !== formData.password) {
          return 'Passwords do not match';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    setTouched({ ...touched, [fieldName]: true });
    
    const error = validateField(fieldName, e.target.value);
    if (error) {
      setErrors({ ...errors, [fieldName]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[fieldName as keyof FieldErrors];
      setErrors(newErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    const value = e.target.value;
    
    setFormData({ ...formData, [fieldName]: value });

    // Clear error when user starts typing
    if (errors[fieldName as keyof FieldErrors]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName as keyof FieldErrors];
      setErrors(newErrors);
    }

    // Validate confirm password when password changes
    if (fieldName === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      if (confirmError) {
        setErrors({ ...errors, confirmPassword: confirmError });
      } else {
        const newErrors = { ...errors };
        delete newErrors.confirmPassword;
        setErrors(newErrors);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key === 'role') return;
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FieldErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      password: true,
      confirmPassword: true
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      let fieldError: FieldErrors = {};
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        // Map backend errors to specific fields with better detection
        const lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.includes('email') || lowerMessage.includes('e-mail')) {
          fieldError.email = errorMessage;
        } else if (lowerMessage.includes('username') || lowerMessage.includes('user name')) {
          fieldError.username = errorMessage;
        } else if (lowerMessage.includes('password')) {
          fieldError.password = errorMessage;
        } else if (lowerMessage.includes('first name') || lowerMessage.includes('firstname')) {
          fieldError.firstName = errorMessage;
        } else if (lowerMessage.includes('last name') || lowerMessage.includes('lastname')) {
          fieldError.lastName = errorMessage;
        } else if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
          // Try to determine which field from the message
          if (lowerMessage.includes('email')) {
            fieldError.email = errorMessage;
          } else if (lowerMessage.includes('username')) {
            fieldError.username = errorMessage;
          } else {
            // Default to email if we can't determine
            fieldError.email = errorMessage;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (Object.keys(fieldError).length > 0) {
        setErrors({ ...errors, ...fieldError });
      } else {
        setErrors({ ...errors, email: errorMessage });
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-600' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-600' };
    return { strength: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="card-hover p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">I</span>
              </div>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="John"
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Doe"
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="you@example.com"
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
                {!errors.email && touched.email && (
                  <p className="mt-1 text-xs text-gray-500">We'll never share your email</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="johndoe"
                />
                {touched.username && errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
                {!errors.username && touched.username && (
                  <p className="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, and underscores only</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  I am a
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="ENTHUSIAST">Innovation Enthusiast</option>
                  <option value="BUILDER">Startup Builder</option>
                  <option value="INVESTOR">Investor</option>
                  <option value="MENTOR">Mentor/Expert</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="At least 6 characters"
                />
                {touched.password && errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                {formData.password && !errors.password && (
                  <p className={`mt-1 text-xs font-medium ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.strength}
                  </p>
                )}
                {!formData.password && (
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters required</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Re-enter your password"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
                {formData.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
                )}
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
