import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';
import CommentThread from '../components/CommentThread';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);  // NEW: for replies
  const [loading, setLoading] = useState(true);

  // Detect if this is an essay or post based on the URL
  const isEssay = location.pathname.includes('/essay/');
  const contentType = isEssay ? 'essays' : 'posts';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch content (post or essay)
        const contentRes = await API.get(`/${contentType}/${id}`);
        setPost(contentRes.data);

        // Fetch nested comments
        const queryParam = isEssay ? `essayId=${id}` : `postId=${id}`;
        const commentsRes = await API.get(`/comments?${queryParam}`);
        setComments(commentsRes.data);
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const handleReplyClick = (comment) => {
    setReplyTo(comment);
    setNewComment(`Replying to ${comment.author?.username}: `);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const commentData = {
        content: newComment,
        ...(isEssay ? { essayId: id } : { postId: id })
      };

      // NEW: Add parentComment for replies
      if (replyTo) {
        commentData.parentComment = replyTo._id;
      }

      const { data } = await API.post('/comments', commentData);

      // Refresh comments to get updated tree
      const queryParam = isEssay ? `essayId=${id}` : `postId=${id}`;
      const commentsRes = await API.get(`/comments?${queryParam}`);
      setComments(commentsRes.data);

      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!post) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center text-navy/60">
      Content not found
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* POST CONTENT + LIGHTBULB VOTING */}
      <div className="greek-card p-8 mb-8">
        <div className="flex items-start space-x-6">
          <div className="flex flex-col items-center space-y-2 pt-2">
            {/* LIGHTBULB VOTING */}
            <button 
              onClick={() => handleVote(1)} 
              className="w-12 h-12 border-2 border-navy flex items-center justify-center hover:bg-yellow-50 hover:border-yellow-400 transition-all rounded-lg shadow-md"
            >
              <span className="text-xl">💡</span>
            </button>
            <span className="font-serif italic text-2xl text-navy font-bold tracking-wide">
              {post.votes || 0}
            </span>
            <button 
              onClick={() => handleVote(-1)} 
              className="w-12 h-12 border-2 border-navy flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 transition-all rounded-lg shadow-md"
            >
              <span className="text-xl">💡</span>
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 border-2 border-navy text-sm font-serif italic bg-cream rounded">
                {post.category}
              </span>
              <span className="px-3 py-1 bg-navy text-cream text-sm font-serif italic rounded">
                {post.type}
              </span>
            </div>
            <h1 className="text-4xl font-serif italic text-navy mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="text-sm text-navy/60 mb-6 font-serif italic">
              <span>by {post.author?.username}</span> • 
              <span> {new Date(post.createdAt).toLocaleDateString()}</span> • 
              <span> {post.views || 0} views</span>
            </div>
            <div className="prose prose-navy max-w-none">
              <p className="text-navy/90 text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMMENT FORM */}
      {user ? (
        <div className="greek-card p-6 mb-8">
          {replyTo && (
            <div className="mb-4 p-3 bg-slate-50 border-l-4 border-navy rounded-r">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy/80 font-serif italic">
                  Replying to {replyTo.author?.username}
                </span>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="greek-input w-full min-h-[100px] resize-vertical"
              placeholder={replyTo ? "Write your reply..." : "Share your thoughts on this post..."}
              rows={3}
              required
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || loading}
              className="greek-button w-full disabled:opacity-50"
            >
              {loading ? 'Posting...' : replyTo ? 'Post Reply' : 'Post Comment'}
            </button>
          </form>
        </div>
      ) : (
        <div className="greek-card p-8 mb-8 text-center">
          <p className="text-navy/70 text-lg mb-4 font-serif italic">
            Join the discussion
          </p>
          <button 
            onClick={() => navigate('/login')} 
            className="greek-button inline-flex items-center space-x-2"
          >
            <span>Login to comment</span>
          </button>
        </div>
      )}

      {/* NESTED COMMENTS */}
      <div className="greek-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif italic text-navy">
            Discussion ({comments.length})
          </h2>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-navy/60 text-lg font-serif italic mb-4">
              No comments yet
            </p>
            <p className="text-navy/40">
              Be the first to share your thoughts
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentThread
                key={comment._id}
                comment={comment}
                onReplyClick={handleReplyClick}
                postId={id}
                isEssay={isEssay}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
