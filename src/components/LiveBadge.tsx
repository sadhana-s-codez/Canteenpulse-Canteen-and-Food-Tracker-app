import React from 'react';
import { Radio } from 'lucide-react';

interface LiveBadgeProps {
  updatedAt?: Date;
  className?: string;
}

const LiveBadge: React.FC<LiveBadgeProps> = ({ updatedAt, className = '' }) => {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Live</span>
      {updatedAt && (
        <span className="text-xs text-slate-400 ml-1">
          · Updated {getTimeAgo(updatedAt)}
        </span>
      )}
    </div>
  );
};

export default LiveBadge;
