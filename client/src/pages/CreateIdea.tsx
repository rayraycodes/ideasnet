import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CreateIdea: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problem: '',
    solution: '',
    targetMarket: '',
    businessModel: '',
    tags: '',
    industry: '',
    technology: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to create an idea');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.problem.trim()) newErrors.problem = 'Problem statement is required';
    if (!formData.solution.trim()) newErrors.solution = 'Solution is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await api.post(
        '/api/ideas',
        formData
      );
      toast.success('Idea created successfully!');
      navigate('/ideas');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to create idea. Please try again.';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create idea');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Share Your Idea
            </h1>
            <p className="text-lg text-gray-600">Tell the community about your startup idea and get feedback from experts.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-glass-hover p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Basic Information</span>
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Idea Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({...formData, title: e.target.value});
                      if (errors.title) setErrors({...errors, title: ''});
                    }}
                    className={`input-field ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Give your idea a catchy title"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Brief Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({...formData, description: e.target.value});
                      if (errors.description) setErrors({...errors, description: ''});
                    }}
                    className={`input-field resize-none ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Describe your idea in one sentence"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Select Industry</option>
                      <option value="FinTech">FinTech</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Sustainability">Sustainability</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="technology" className="block text-sm font-semibold text-gray-700 mb-2">
                      Technology
                    </label>
                    <input
                      type="text"
                      id="technology"
                      value={formData.technology}
                      onChange={(e) => setFormData({...formData, technology: e.target.value})}
                      className="input-field"
                      placeholder="e.g., AI, Blockchain, Mobile"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass-hover p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Problem & Solution</span>
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="problem" className="block text-sm font-semibold text-gray-700 mb-2">
                    Problem Statement <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="problem"
                    required
                    rows={4}
                    value={formData.problem}
                    onChange={(e) => {
                      setFormData({...formData, problem: e.target.value});
                      if (errors.problem) setErrors({...errors, problem: ''});
                    }}
                    className={`input-field resize-none ${errors.problem ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="What problem does your idea solve?"
                  />
                  {errors.problem && <p className="mt-1 text-sm text-red-600">{errors.problem}</p>}
                </div>

                <div>
                  <label htmlFor="solution" className="block text-sm font-semibold text-gray-700 mb-2">
                    Proposed Solution <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="solution"
                    required
                    rows={4}
                    value={formData.solution}
                    onChange={(e) => {
                      setFormData({...formData, solution: e.target.value});
                      if (errors.solution) setErrors({...errors, solution: ''});
                    }}
                    className={`input-field resize-none ${errors.solution ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="How does your idea solve this problem?"
                  />
                  {errors.solution && <p className="mt-1 text-sm text-red-600">{errors.solution}</p>}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-glass-hover p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Market & Business</span>
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="targetMarket" className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Market
                  </label>
                  <textarea
                    id="targetMarket"
                    rows={3}
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({...formData, targetMarket: e.target.value})}
                    className="input-field resize-none"
                    placeholder="Who is your target audience?"
                  />
                </div>

                <div>
                  <label htmlFor="businessModel" className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Model
                  </label>
                  <textarea
                    id="businessModel"
                    rows={3}
                    value={formData.businessModel}
                    onChange={(e) => setFormData({...formData, businessModel: e.target.value})}
                    className="input-field resize-none"
                    placeholder="How will you make money?"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="input-field"
                    placeholder="Enter tags separated by commas (e.g., AI, Finance, Mobile)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end space-x-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/ideas')}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="btn-primary text-lg px-8 py-4"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Idea'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateIdea;
