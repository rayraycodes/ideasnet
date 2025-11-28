import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-glass shadow-xl' : 'bg-white/60 backdrop-blur-2xl border-b border-white/20'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg md:text-xl">I</span>
            </motion.div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">Ideas.net</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/ideas"
              className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/ideas')
                  ? 'text-gray-900 bg-gray-100'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Explore
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    isActive('/create')
                      ? 'text-blue-600 bg-blue-50/50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  Create
                </Link>
                <div className="relative ml-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.firstName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-700">{user?.firstName}</span>
                    <svg
                      className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                        isMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg"
                      >
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600 font-medium"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-white/50 transition-all duration-300"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 border-t border-white/20 mt-2">
                <Link
                  to="/ideas"
                  className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive('/ideas') ? 'bg-blue-50/50 text-blue-600' : 'text-gray-700 hover:bg-white/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore Ideas
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/create"
                      className={`block px-4 py-3 rounded-xl font-medium transition-all ${
                        isActive('/create') ? 'bg-blue-50/50 text-blue-600' : 'text-gray-700 hover:bg-white/50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Idea
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-white/50 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50/50 transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-white/50 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block btn-primary text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
