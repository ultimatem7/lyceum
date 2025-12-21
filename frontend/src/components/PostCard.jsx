import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  return (
    <Link to={`/post/${post._id}`} className="block greek-card p-6 mb-4">
      <div className="flex items-start space-x-4">
        <div className="flex flex-col items-center space-y-1">
          <button className="w-8 h-8 border-2 border-navy flex items-center justify-center hover:bg-navy hover:text-cream transition-colors">
            ▲
          </button>
          <span className="font-serif italic text-lg">{post.votes || 0}</span>
          <button className="w-8 h-8 border-2 border-navy flex items-center justify-center hover:bg-navy hover:text-cream transition-colors">
            ▼
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 border-2 border-navy text-xs font-serif italic">{post.category}</span>
            <span className="px-3 py-1 bg-navy text-cream text-xs font-serif italic">{post.type}</span>
          </div>

          <h3 className="text-2xl font-serif italic text-navy mb-2 hover:underline">{post.title}</h3>
          <p className="text-navy/80 mb-3 line-clamp-2">{post.content}</p>

          <div className="flex items-center space-x-4 text-sm text-navy/60">
            <span className="font-serif italic">by {post.author?.username || 'Anonymous'}</span>
            <span>•</span>
            <span>{post.commentCount || 0} comments</span>
            <span>•</span>
            <span>{post.views || 0} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;