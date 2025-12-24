// frontend/src/components/CommentThread.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../utils/api';

const CommentThread = ({ comment, depth = 0, onReplyClick, postId, isEssay }) => {
  const { user } = useAuth();
  const [votes, setVotes] = React.useState(comment.votes || 0);
  const [myVote, setMyVote] = React.useState(0);

  const handleVote = async (voteType) => {
    if (!user) return;
    try {
      await API.post(`/comments/${comment._id}/vote`, { voteType });
      setVotes(prev => prev + (myVote === voteType ? -voteType * 2 : voteType * (myVote === -voteType ? 2 : 1)));
      setMyVote(prev => prev === voteType ? 0 : voteType);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mb-4" style={{ marginLeft: depth * 16, paddingLeft: 8, borderLeft: depth > 0 ? '2px solid #e5e7eb' : 'none' }}>
      <div className="bg-white/90 border border-stone/60 rounded p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-navy bg-cream flex items-center justify-center">
              <span className="text-navy text-xs font-bold">
                {comment.author?.username?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <span className="font-serif italic text-navy font-medium">
              {comment.author?.username || 'Anonymous'}
            </span>
          </div>
          <span className="text-xs text-navy/40">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-navy/80 mb-3 leading-relaxed">{comment.content}</p>

        <div className="flex items-center space-x-4">
          {/* LIGHTBULB VOTING */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleVote(1)}
              className={`flex items-center px-2 py-1 rounded text-xs transition-all ${
                myVote === 1 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                  : 'text-navy/60 hover:text-navy hover:bg-navy/10'
              }`}
            >
              <span className="mr-1">💡</span>
              Insightful
            </button>
            <button
              onClick={() => handleVote(-1)}
              className={`flex items-center px-2 py-1 rounded text-xs transition-all ${
                myVote === -1 
                  ? 'bg-slate-100 text-slate-700 border border-slate-300' 
                  : 'text-navy/40 hover:text-navy hover:bg-navy/10'
              }`}
            >
              <span className="mr-1">💡</span>
              Not helpful
            </button>
            <span className="text-sm text-navy/70 font-serif italic ml-2">
              {votes} lightbulb{votes !== 1 ? 's' : ''}
            </span>
          </div>

          {/* REPLY BUTTON */}
          <button
            onClick={() => onReplyClick(comment)}
            className="text-xs text-navy/60 font-serif italic hover:underline ml-auto"
          >
            Reply
          </button>
        </div>
      </div>

      {/* RECURSIVE REPLIES */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              onReplyClick={onReplyClick}
              postId={comment.postId || comment.post?._id}
              isEssay={!!comment.essayId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
