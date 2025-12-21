import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Detect if this is an essay or post based on the URL
  const isEssay = location.pathname.includes('/essay/');
  const contentType = isEssay ? 'essays' : 'posts';

  useEffect(() => {
    // Fetch the correct content type
    API.get(`/${contentType}/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err));
    
    // Fetch comments with correct query param
    const queryParam = isEssay ? `essayId=${id}` : `postId=${id}`;
    API.get(`/comments?${queryParam}`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  }, [id, contentType, isEssay]);

  const handleVote = async (voteType) => {
    if (!user) return navigate('/login');
    try {
      const { data } = await API.post(`/${contentType}/${id}/vote`, { voteType });
      setPost(prev => ({ ...prev, votes: data.votes }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const commentData = {
        content: newComment,
        ...(isEssay ? { essayId: id } : { postId: id })
      };
      const { data } = await API.post('/comments', commentData);
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!post) return (
    <div className="flex justify-center py-12">
      <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="greek-card p-8 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => handleVote(1)} 
                    className="w-10 h-10 border-3 border-navy flex items-center justify-center hover:bg-navy hover:text-cream">
              ▲
            </button>
            <span className="font-serif italic text-2xl text-navy">{post.votes || 0}</span>
            <button onClick={() => handleVote(-1)} 
                    className="w-10 h-10 border-3 border-navy flex items-center justify-center hover:bg-navy hover:text-cream">
              ▼
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 border-2 border-navy text-sm font-serif italic">{post.category}</span>
              <span className="px-3 py-1 bg-navy text-cream text-sm font-serif italic">{post.type}</span>
            </div>
            <h1 className="text-4xl font-serif italic text-navy mb-4">{post.title}</h1>
            <div className="text-sm text-navy/60 mb-6">
              <span className="font-serif italic">by {post.author?.username}</span> • 
              <span> {new Date(post.createdAt).toLocaleDateString()}</span> • 
              <span> {post.views || 0} views</span>
            </div>
            <p className="text-navy/80 text-lg leading-relaxed">{post.content}</p>
          </div>
        </div>
      </div>

      <div className="greek-card p-8">
        <h2 className="text-3xl font-serif italic text-navy mb-6">Comments ({comments.length})</h2>

        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} 
                      className="greek-input w-full mb-4" rows={4} placeholder="Share your thoughts..." required />
            <button type="submit" className="greek-button">Post Comment</button>
          </form>
        ) : (
          <div className="border-2 border-navy bg-cream p-6 mb-8 text-center">
            <p className="font-serif italic text-navy text-lg mb-4">Login to join the discussion</p>
            <button onClick={() => navigate('/login')} className="greek-button inline-block">Login</button>
          </div>
        )}

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-navy/60 font-serif italic">No comments yet</p>
          ) : (
            comments.map(c => (
              <div key={c._id} className="border-l-3 border-navy pl-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full border-2 border-navy bg-cream flex items-center justify-center">
                    <span className="text-navy text-sm">{c.author?.username?.[0]?.toUpperCase() || 'A'}</span>
                  </div>
                  <span className="font-serif italic text-navy">{c.author?.username || 'Anonymous'}</span>
                  <span className="text-navy/40 text-sm">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-navy/80">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
