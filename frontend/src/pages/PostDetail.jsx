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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

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

  const handleReaction = async (reactionType) => {
    if (!user) return navigate('/login');
    try {
      const { data } = await API.post(`/${contentType}/${id}/reaction`, { reactionType });
      setPost(prev => ({ ...prev, insightful: data.insightful, notHelpful: data.notHelpful }));
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
      // Refresh comments to get the nested structure
      const queryParam = isEssay ? `essayId=${id}` : `postId=${id}`;
      const commentsRes = await API.get(`/comments?${queryParam}`);
      setComments(commentsRes.data);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (parentCommentId) => {
    if (!user) return navigate('/login');
    if (!replyContent.trim()) return;
    
    try {
      const commentData = {
        content: replyContent,
        parentComment: parentCommentId,
        ...(isEssay ? { essayId: id } : { postId: id })
      };
      await API.post('/comments', commentData);
      // Refresh comments
      const queryParam = isEssay ? `essayId=${id}` : `postId=${id}`;
      const commentsRes = await API.get(`/comments?${queryParam}`);
      setComments(commentsRes.data);
      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentReaction = async (commentId, reactionType) => {
    if (!user) return navigate('/login');
    try {
      const { data } = await API.post(`/comments/${commentId}/reaction`, { reactionType });
      // Update the comment in the comments array
      const updateCommentInTree = (comments) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, insightful: data.insightful, notHelpful: data.notHelpful };
          }
          if (comment.replies) {
            return { ...comment, replies: updateCommentInTree(comment.replies) };
          }
          return comment;
        });
      };
      setComments(updateCommentInTree(comments));
    } catch (err) {
      console.error(err);
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const isReplying = replyingTo === comment._id;
    
    return (
      <div className={depth > 0 ? 'ml-8 mt-4 border-l-2 border-navy/30 pl-4' : ''}>
        <div className="border-l-3 border-navy pl-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-full border-2 border-navy bg-cream flex items-center justify-center">
              <span className="text-navy text-sm">{comment.author?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <span className="font-serif italic text-navy">{comment.author?.username || 'Anonymous'}</span>
            <span className="text-navy/40 text-sm">{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-navy/80 mb-3">{comment.content}</p>
          
          {/* Insightful/Not Helpful buttons */}
          <div className="flex items-center space-x-4 mb-3">
            <button
              onClick={() => handleCommentReaction(comment._id, 'insightful')}
              className="flex items-center space-x-1 px-3 py-1 border-2 border-navy hover:bg-navy hover:text-cream transition-colors text-sm"
            >
              <span>💡</span>
              <span className="font-serif italic">Insightful ({comment.insightful || 0})</span>
            </button>
            <button
              onClick={() => handleCommentReaction(comment._id, 'notHelpful')}
              className="flex items-center space-x-1 px-3 py-1 border-2 border-navy hover:bg-navy hover:text-cream transition-colors text-sm"
            >
              <span>❌</span>
              <span className="font-serif italic">Not Helpful ({comment.notHelpful || 0})</span>
            </button>
            <button
              onClick={() => setReplyingTo(isReplying ? null : comment._id)}
              className="px-3 py-1 border-2 border-navy hover:bg-navy hover:text-cream transition-colors text-sm font-serif italic"
            >
              Reply
            </button>
          </div>

          {/* Reply form */}
          {isReplying && user && (
            <div className="mb-4 mt-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="greek-input w-full mb-2"
                rows={3}
                placeholder="Write a reply..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleReply(comment._id)}
                  className="greek-button text-sm"
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="greek-button-outline text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!post) return (
    <div className="flex justify-center py-12">
      <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Calculate total comments including replies
  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="greek-card p-8 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => handleReaction('insightful')} 
                    className="flex items-center space-x-2 px-4 py-2 border-3 border-navy hover:bg-navy hover:text-cream transition-colors"
                    title="Mark as insightful">
              <span>💡</span>
              <span className="font-serif italic">Insightful ({post.insightful || 0})</span>
            </button>
            <button onClick={() => handleReaction('notHelpful')} 
                    className="flex items-center space-x-2 px-4 py-2 border-3 border-navy hover:bg-navy hover:text-cream transition-colors"
                    title="Mark as not helpful">
              <span>❌</span>
              <span className="font-serif italic">Not Helpful ({post.notHelpful || 0})</span>
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
        <h2 className="text-3xl font-serif italic text-navy mb-6">Comments ({totalComments})</h2>

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
            comments.map(comment => (
              <CommentItem key={comment._id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
