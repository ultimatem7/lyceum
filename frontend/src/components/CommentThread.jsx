// frontend/src/components/CommentThread.jsx
import React from 'react';

const CommentThread = ({ comment, depth = 0, onReplyClick }) => {
  return (
    <div className="mb-3" style={{ marginLeft: depth * 16 }}>
      <div className="p-3 bg-white/90 border border-stone/60 rounded">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-navy/70 font-serif italic">
            {comment.author?.username || 'Anonymous'}
          </span>
          <span className="text-xs text-navy/40">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="text-navy text-sm mb-2">{comment.content}</p>
        <button
          onClick={() => onReplyClick(comment)}
          className="text-xs text-navy/60 font-serif italic hover:underline"
        >
          Reply
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((child) => (
            <CommentThread
              key={child._id}
              comment={child}
              depth={depth + 1}
              onReplyClick={onReplyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
