import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const fetchIdea = async (slug: string) => {
  try {
    const { data } = await api.get(`/api/ideas/${slug}`);
    return data;
  } catch (error: any) {
    console.error('Error fetching idea:', error);
    throw error;
  }
};

const fetchComments = async (ideaId: string) => {
  const { data } = await api.get(`/api/comments/idea/${ideaId}`);
  return data;
};

const fetchUserVotes = async (ideaId: string, token: string) => {
  try {
    const { data } = await api.get(`/api/votes/idea/${ideaId}/user`);
    return data;
  } catch (error) {
    return [];
  }
};

const IdeaDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, token } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: idea, isLoading, isError, error } = useQuery(['idea', slug], () => fetchIdea(slug!), {
    enabled: !!slug,
    retry: 2,
    onError: (error: any) => {
      console.error('Error loading idea:', error);
    },
    onSuccess: (data) => {
      console.log('Idea loaded successfully:', data);
    },
  });

  const { data: comments = [], isLoading: isCommentsLoading, isError: isCommentsError } = useQuery(
    ['comments', idea?.id],
    () => fetchComments(idea!.id),
    { enabled: !!idea?.id, retry: 2 }
  );

  const { data: userVotes = [], refetch: refetchUserVotes } = useQuery(
    ['userVotes', idea?.id, user?.id],
    () => fetchUserVotes(idea!.id, token!),
    { enabled: !!idea?.id && !!user?.id && !!token, retry: false }
  );

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) {
      if (!isAuthenticated) {
        toast.error('Please log in to comment');
        navigate('/login');
      }
      return;
    }
    setIsCommentLoading(true);
    try {
      await api.post(
        '/api/comments',
        {
          ideaId: idea!.id,
          content: commentText,
        }
      );
      setCommentText('');
      toast.success('Comment posted!');
      queryClient.invalidateQueries(['comments', idea!.id]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.error || 
                          'Failed to post comment';
      toast.error(errorMessage);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleVote = async (type: string, voted: boolean) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      navigate('/login');
      return;
    }
    setIsVoting(true);
    try {
      if (!voted) {
        await api.post(
          `/api/votes/idea/${idea!.id}`,
          { type }
        );
        toast.success('Vote recorded!');
      } else {
        await api.delete(
          `/api/votes/idea/${idea!.id}`,
          { data: { type } }
        );
        toast.success('Vote removed');
      }
      queryClient.invalidateQueries(['idea', slug]);
      refetchUserVotes();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.error || 
                          'Failed to vote';
      toast.error(errorMessage);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this idea? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/ideas/${idea!.id}`);
      toast.success('Idea deleted');
      navigate('/ideas');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.error || 
                          'Failed to delete idea';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (isError || (!isLoading && !idea)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="card text-center p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h2>
          <p className="text-gray-600 mb-6">
            {error ? (
              <>
                The idea you're looking for couldn't be loaded.
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  {error?.response?.data?.error || error?.message || 'Unknown error'}
                </span>
              </>
            ) : (
              "The idea you're looking for doesn't exist or has been removed."
            )}
          </p>
          <button onClick={() => navigate('/ideas')} className="btn-primary">
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  // Safety check - if idea doesn't exist after loading, show error
  if (!isLoading && !idea) {
    console.log('Idea not found - isLoading:', isLoading, 'idea:', idea, 'isError:', isError, 'error:', error);
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="card text-center p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h2>
          <p className="text-gray-600 mb-6">The idea you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/ideas')} className="btn-primary">
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  const hasUpvoted = userVotes?.some((v: any) => v.type === 'UPVOTE');
  const hasInvested = userVotes?.some((v: any) => v.type === 'INVEST_INTEREST');
  const hasWouldUse = userVotes?.some((v: any) => v.type === 'WOULD_USE');
  const isOwner = user && idea.author?.id === user.id;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/ideas')}
              className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Ideas</span>
            </motion.button>

            <div className="card-hover p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{idea.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {idea.tags && idea.tags.map((tag: string) => (
                      <span key={tag} className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {idea.author?.firstName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{idea.author?.firstName} {idea.author?.lastName}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                    {idea.industry && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-gray-100/80 rounded-lg text-xs">{idea.industry}</span>
                      </>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <div className="flex gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="btn-danger text-sm px-4 py-2"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Voting Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-hover p-6 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote('UPVOTE', hasUpvoted)}
                disabled={isVoting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  hasUpvoted
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-lg font-bold">{idea.upvoteCount || 0}</span>
                <span>Upvote</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote('INVEST_INTEREST', hasInvested)}
                disabled={isVoting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  hasInvested
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-bold">{idea.investInterestCount || 0}</span>
                <span>Would Invest</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote('WOULD_USE', hasWouldUse)}
                disabled={isVoting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  hasWouldUse
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-lg font-bold">{idea.wouldUseCount || 0}</span>
                <span>Would Use</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-glass-hover p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">{idea.description}</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Problem</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">{idea.problem}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Solution</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">{idea.solution}</p>
              </div>
            </div>
          </motion.div>

          {/* Market & Business */}
          {(idea.targetMarket || idea.businessModel) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass-hover p-8 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Market & Business</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {idea.targetMarket && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Target Market</h3>
                    <p className="text-gray-700">{idea.targetMarket}</p>
                  </div>
                )}
                {idea.businessModel && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Business Model</h3>
                    <p className="text-gray-700">{idea.businessModel}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-hover p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Discussion ({comments.length})</span>
            </h2>

            {isCommentsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading comments...</div>
            ) : isCommentsError ? (
              <div className="text-center py-8 text-red-500">Failed to load comments</div>
            ) : (
              <>
                {comments && comments.length > 0 ? (
                  <div className="space-y-6 mb-6">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {comment.author?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">{comment.author?.username || 'User'}</span>
                            <span className="text-xs text-gray-500 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 mb-6">No comments yet. Be the first to comment!</div>
                )}

                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <textarea
                      className="input-field resize-none"
                      rows={4}
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={isCommentLoading}
                    />
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        disabled={isCommentLoading || !commentText.trim()}
                      >
                        {isCommentLoading ? 'Posting...' : 'Post Comment'}
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 mb-2">Please log in to join the discussion</p>
                    <Link to="/login" className="btn-primary inline-block">
                      Log In
                    </Link>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default IdeaDetail;
