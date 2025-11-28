import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fetchUserIdeas = async (userId: string) => {
  const { data } = await api.get(`/api/users/${userId}/ideas`);
  return data;
};

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ideas' | 'activity'>('ideas');

  const { data: userIdeas = [], isLoading } = useQuery(
    ['userIdeas', user?.id],
    () => fetchUserIdeas(user!.id),
    { enabled: !!user?.id && isAuthenticated }
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="card text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <div className="card-hover p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {user.firstName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    {user.role}
                  </span>
                  {user.isVerified && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                {user.bio && (
                  <p className="mt-4 text-gray-700 leading-relaxed">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('ideas')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'ideas'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              My Ideas ({userIdeas.length})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'activity'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Activity
            </motion.button>
          </div>

          {/* Content */}
          {activeTab === 'ideas' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {isLoading ? (
                <div className="card p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading your ideas...</p>
                </div>
              ) : userIdeas.length === 0 ? (
                <div className="card-hover p-12 text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas yet</h3>
                  <p className="text-gray-600 mb-6">Start sharing your ideas with the community!</p>
                  <button onClick={() => navigate('/create')} className="btn-primary">
                    Create Your First Idea
                  </button>
                </div>
              ) : (
                userIdeas.map((idea: any, index: number) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-hover p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          <a href={`/ideas/${idea.slug}`} className="hover:text-blue-600 transition-colors">
                            {idea.title}
                          </a>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{idea.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>↑ {idea.upvoteCount || 0}</span>
                          <span>💬 {idea.comments?.length || 0}</span>
                          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-hover p-8 text-center"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activity</h3>
              <p className="text-gray-600">Activity tracking coming soon!</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
