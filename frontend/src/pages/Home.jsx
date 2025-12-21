import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import PostCard from '../components/PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/posts?limit=10').then(res => {
      setPosts(res.data.posts);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="greek-card p-12 mb-12 text-center marble-texture">
        <div className="max-w-3xl mx-auto">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-navy bg-white">
            <img
              src="/logo.jpg"
              alt="Lyceum"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-6xl font-serif italic text-navy mb-4">Welcome to Lyceum</h1>
          <p className="text-xl text-navy/80 mb-8">
            A sanctuary for philosophical discourse and wisdom
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/forum" className="greek-button">Enter the Forum</Link>
            <Link to="/essays" className="greek-button-outline">Read Essays</Link>
          </div>
        </div>
      </div>

      <h2 className="text-4xl font-serif italic text-navy mb-6">Recent Discussions</h2>
      {posts.length === 0 ? (
        <div className="greek-card p-12 text-center">
          <p className="text-navy/60 text-lg font-serif italic">No discussions yet</p>
          <Link to="/create" className="greek-button inline-block mt-4">Start First Discussion</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  );
};

export default Home;