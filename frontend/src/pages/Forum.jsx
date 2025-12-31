import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../utils/api';
import PostCard from '../components/PostCard';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';

  const categories = ['All', 'Ethics', 'Metaphysics', 'Epistemology', 'Political Philosophy', 
                      'Philosophy of Mind', 'Philosophy of Religion', 'Aesthetics', 'Logic', 
                      'Eastern Philosophy', 'Other'];

  useEffect(() => {
    setLoading(true);
    const params = category !== 'All' ? { category } : {};
    API.get('/posts', { params }).then(res => {
      setPosts(res.data.posts);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl font-serif italic text-navy">The Forum</h1>
        <Link to="/create" className="greek-button text-lg px-6 py-3">
          + Create Post
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="greek-card p-6">
          <h3 className="text-2xl font-serif italic text-navy mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSearchParams({ category: cat })}
                className={`block w-full text-left px-3 py-2 border-2 transition-all ${
                  category === cat ? 'bg-navy text-cream border-navy' : 'border-navy hover:bg-stone'
                }`}
              >
                <span className="font-serif italic">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="greek-card p-12 text-center">
              <p className="text-navy/60 text-xl font-serif italic">No posts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => <PostCard key={post._id} post={post} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;