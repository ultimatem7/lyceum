import React from 'react';
import { Link } from 'react-router-dom';

const EssayCard = ({ essay }) => {
  return (
    <Link to={`/essay/${essay._id}`} className="block greek-card p-6 mb-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="px-3 py-1 border-2 border-navy text-xs font-serif italic">{essay.category}</span>
        <span className="px-3 py-1 bg-cream border-2 border-navy text-xs font-serif italic">{essay.type}</span>
      </div>

      <h2 className="text-3xl font-serif italic text-navy mb-3 hover:underline">{essay.title}</h2>
      <p className="text-navy/80 mb-4 line-clamp-3">{essay.content.substring(0, 200)}...</p>

      <div className="flex items-center justify-between pt-4 border-t-2 border-stone">
        <span className="font-serif italic text-navy">{essay.author?.username || 'Anonymous'}</span>
        <div className="flex items-center space-x-4 text-sm text-navy/60">
          <span>💡 {essay.lightbulbs || 0}</span>
          <span>{essay.views || 0} views</span>
        </div>
      </div>
    </Link>
  );
};

export default EssayCard;