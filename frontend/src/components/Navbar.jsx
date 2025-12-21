import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b-3 border-navy mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-navy group-hover:border-darkNavy transition-all">
              <img 
                src="/logo.jpg" 
                alt="Lyceum Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-3xl font-serif italic text-navy">Lyceum</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 font-serif italic text-lg text-navy hover:bg-stone transition-colors">
              Agora
            </Link>
            <Link to="/forum" className="px-4 py-2 font-serif italic text-lg text-navy hover:bg-stone transition-colors">
              Forum
            </Link>
            <Link to="/essays" className="px-4 py-2 font-serif italic text-lg text-navy hover:bg-stone transition-colors">
              Essays
            </Link>
            {user && (
              <Link to="/create" className="px-4 py-2 font-serif italic text-lg text-navy hover:bg-stone transition-colors">
                Create
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link 
                  to={`/profile/${user.username}`} 
                  className="font-serif italic text-navy hover:underline"
                >
                  {user.username}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 border-2 border-navy text-navy hover:bg-navy hover:text-cream transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 border-2 border-navy text-navy hover:bg-navy hover:text-cream transition-all">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 bg-navy text-cream border-2 border-navy hover:bg-white hover:text-navy transition-all">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;