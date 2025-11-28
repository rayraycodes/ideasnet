import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';

const fetchIdeas = async () => {
  try {
    const { data } = await api.get('/api/ideas');
    return data;
  } catch (error: any) {
    console.error('Error fetching ideas:', error);
    throw error;
  }
};

const Ideas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: ideas, isLoading, isError, error } = useQuery(['ideas'], fetchIdeas, {
    retry: 2,
    retryDelay: 1000,
  });

  const categories = [
    'all',
    'FinTech',
    'Sustainability',
    'Healthcare',
    'Education',
    'Entertainment',
    'E-commerce'
  ];

  const filteredIdeas = (ideas || []).filter((idea: any) => {
    const matchesSearch =
      idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || idea.industry === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Ideas
          </h1>
          <p className="text-lg text-gray-600">Discover innovative startup ideas from our community</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-hover p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading ideas...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-glass p-8 text-center"
          >
            <>
              <div className="text-red-500 mb-2 text-4xl">⚠️</div>
              <p className="text-red-600 font-medium mb-2">Failed to load ideas. Please try again later.</p>
              {error && (
                <>
                  {(error as any).code === 'ECONNREFUSED' || (error as any).message?.includes('Network Error') ? (
                    <div className="text-sm text-gray-600 mt-3 space-y-2">
                      <p className="font-semibold">Connection Error:</p>
                      <p>Make sure the backend server is running on port 3001.</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Run: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> in the root directory
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      {(error as any).response?.data?.message || 
                       (error as any).response?.data?.error ||
                       (error as any).message ||
                       'Unknown error occurred'}
                    </p>
                  )}
                </>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 btn-primary"
              >
                Retry
              </button>
            </>
          </motion.div>
        )}

        {/* Ideas Grid */}
        {!isLoading && !isError && (
          <>
            {filteredIdeas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-glass p-12 text-center"
              >
                <p className="text-gray-500 text-lg">No ideas found. Be the first to share an idea!</p>
                <Link to="/create" className="btn-primary mt-4 inline-block">
                  Create Idea
                </Link>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIdeas.map((idea: any, index: number) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="card-hover group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                        {idea.industry || 'General'}
                      </span>
                      <div className="flex items-center space-x-3 text-gray-500 text-sm">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          <span>{idea.upvoteCount || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{idea.commentCount || idea.comments?.length || 0}</span>
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                      <Link to={`/ideas/${idea.slug}`}>
                        {idea.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {idea.description}
                    </p>
                    
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {idea.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                      <span className="text-sm text-gray-500">
                        by {idea.author?.firstName} {idea.author?.lastName}
                      </span>
                      <Link
                        to={`/ideas/${idea.slug}`}
                        className="text-gray-900 hover:text-gray-700 text-sm font-semibold flex items-center space-x-1 group-hover:space-x-2 transition-all"
                      >
                        <span>Read more</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Ideas;
