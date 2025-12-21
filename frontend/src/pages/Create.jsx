import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';

const Create = () => {
  const [contentType, setContentType] = useState('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Ethics');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = ['Ethics', 'Metaphysics', 'Epistemology', 'Political Philosophy', 
                      'Philosophy of Mind', 'Philosophy of Religion', 'Aesthetics', 
                      'Logic', 'Eastern Philosophy', 'Other'];

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (contentType === 'post') {
        const { data } = await API.post('/posts', { title, content, category, type: 'discussion' });
        navigate(`/post/${data._id}`);
      } else {
        const { data } = await API.post('/essays', { title, content, category, type: 'essay' });
        navigate(`/essay/${data._id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-serif italic text-navy mb-8">Create</h1>
      <div className="greek-card p-8">
        <div className="flex space-x-4 mb-8">
          <button onClick={() => setContentType('post')} 
                  className={`flex-1 py-3 border-2 font-serif italic text-lg ${contentType === 'post' ? 'bg-navy text-cream border-navy' : 'border-navy hover:bg-stone'}`}>
            Forum Post
          </button>
          <button onClick={() => setContentType('essay')} 
                  className={`flex-1 py-3 border-2 font-serif italic text-lg ${contentType === 'essay' ? 'bg-navy text-cream border-navy' : 'border-navy hover:bg-stone'}`}>
            Essay / Poem
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-navy font-serif italic text-lg mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="greek-input w-full">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-navy font-serif italic text-lg mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} 
                   className="greek-input w-full" placeholder="What question keeps you awake?" required />
          </div>

          <div>
            <label className="block text-navy font-serif italic text-lg mb-2">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} 
                      className="greek-input w-full" rows={12} 
                      placeholder="Share your thoughts..." required />
          </div>

          <button type="submit" disabled={loading} className="greek-button disabled:opacity-50">
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;