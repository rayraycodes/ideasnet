import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">I</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Ideas.net</span>
            </div>
            <p className="text-gray-600 text-sm">
              Where great ideas come to life. Connect, collaborate, and build the future.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ideas" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Explore Ideas
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Create Idea
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" className="text-gray-600 hover:text-gray-900 transition-colors text-left">
                  About
                </button>
              </li>
              <li>
                <button type="button" className="text-gray-600 hover:text-gray-900 transition-colors text-left">
                  Guidelines
                </button>
              </li>
              <li>
                <button type="button" className="text-gray-600 hover:text-gray-900 transition-colors text-left">
                  Support
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button type="button" className="text-gray-600 hover:text-gray-900 transition-colors text-left">
                  Privacy
                </button>
              </li>
              <li>
                <button type="button" className="text-gray-600 hover:text-gray-900 transition-colors text-left">
                  Terms
                </button>
              </li>
              <li>
                <button type="button" className="text-gray-600 hover:text-gray-900 transition-colors text-left">
                  Cookies
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/20 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Ideas.net. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
