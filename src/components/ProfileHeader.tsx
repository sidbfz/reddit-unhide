import React from 'react';
import { RedditUserStats } from '../api/types';

export default function ProfileHeader({ stats }: { stats: RedditUserStats }) {
  const createdDate = new Date(stats.created_utc * 1000).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="profile-header">
      <div className="stat-item">
        <span className="stat-val">{stats.karma.toLocaleString()}</span>
        <span className="stat-label">Karma</span>
      </div>
      <div className="stat-item">
        <span className="stat-val">{stats.post_count.toLocaleString()}</span>
        <span className="stat-label">Posts</span>
      </div>
      <div className="stat-item">
        <span className="stat-val">{stats.comment_count.toLocaleString()}</span>
        <span className="stat-label">Comments</span>
      </div>
      <div className="stat-item">
        <span className="stat-val">{createdDate}</span>
        <span className="stat-label">Active Since</span>
      </div>
    </div>
  );
}
