import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { RedditPost, RedditComment } from '../api/types';
import PostCard from './PostCard';
import CommentCard from './CommentCard';

type TabType = 'Overview' | 'Posts' | 'Comments';

function getTabFromPath(path: string): TabType {
  if (path.includes('/submitted')) return 'Posts';
  if (path.includes('/comments')) return 'Comments';
  return 'Overview';
}

export default function HiddenProfileFeed({ username }: { username: string }) {
  const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromPath(window.location.pathname));

  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [comments, setComments] = useState<RedditComment[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [postsBefore, setPostsBefore] = useState<number | undefined>();
  const [commentsBefore, setCommentsBefore] = useState<number | undefined>();

  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  // Keep activeTab in sync if user clicks Reddit's own native tabs (SPA navigation)
  useEffect(() => {
    const syncTab = () => {
      const newTab = getTabFromPath(window.location.pathname);
      setActiveTab(newTab);
    };
    window.addEventListener('popstate', syncTab);
    // Reddit uses pushState for SPA navigation — patch it once
    const origPushState = history.pushState.bind(history);
    history.pushState = (...args) => {
      origPushState(...args);
      syncTab();
    };
    return () => {
      window.removeEventListener('popstate', syncTab);
      history.pushState = origPushState;
    };
  }, []);

  const fetchPosts = async (before?: number) => {
    if (!hasMorePosts && before) return;
    try {
      const data = await apiClient.getPosts(username, before);
      if (data.length === 0) setHasMorePosts(false);
      setPosts(prev => before ? [...prev, ...data] : data);
      if (data.length > 0) setPostsBefore(data[data.length - 1].created_utc);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchComments = async (before?: number) => {
    if (!hasMoreComments && before) return;
    try {
      const data = await apiClient.getComments(username, before);
      if (data.length === 0) setHasMoreComments(false);

      const fetchParentIds = data.map(c => c.parent_id).filter(id => id && id.startsWith('t1_'));
      const uniqueParentIds = Array.from(new Set(fetchParentIds));
      if (uniqueParentIds.length > 0) {
        try {
          const parentData = await apiClient.getInfo(uniqueParentIds);
          const authorMap: Record<string, string> = {};
          parentData.forEach((p: any) => {
             authorMap[p.name] = p.author;
          });
          
          data.forEach(c => {
             if (c.parent_id && authorMap[c.parent_id]) {
                c.parent_author = authorMap[c.parent_id];
             }
          });
        } catch (e) { console.error('Failed to fetch parent authors', e); }
      }

      setComments(prev => before ? [...prev, ...data] : data);
      if (data.length > 0) setCommentsBefore(data[data.length - 1].created_utc);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadData = async (tab: TabType, isLoadMore = false) => {
    setLoading(true);
    setError(null);
    if (!isLoadMore) {
      if (tab === 'Posts') {
        await fetchPosts();
      } else if (tab === 'Comments') {
        await fetchComments();
      } else {
        await Promise.all([fetchPosts(), fetchComments()]);
      }
    } else {
      const promises = [];
      if (tab === 'Posts' || tab === 'Overview') {
        if (hasMorePosts) promises.push(fetchPosts(postsBefore));
      }
      if (tab === 'Comments' || tab === 'Overview') {
        if (hasMoreComments) promises.push(fetchComments(commentsBefore));
      }
      await Promise.all(promises);
    }
    setLoading(false);
  };

  // Initial fetch based on URL-derived tab
  useEffect(() => {
    loadData(activeTab);
  }, [username]);

  // When tab changes due to URL navigation, fetch missing data
  useEffect(() => {
    const needsPosts = activeTab === 'Posts' || activeTab === 'Overview';
    const needsComments = activeTab === 'Comments' || activeTab === 'Overview';
    const missingPosts = needsPosts && posts.length === 0 && hasMorePosts;
    const missingComments = needsComments && comments.length === 0 && hasMoreComments;

    if (missingPosts || missingComments) {
      loadData(activeTab);
    }
  }, [activeTab]);

  const allItems = [...posts, ...comments].sort((a, b) => b.created_utc - a.created_utc);

  let displayItems: Array<RedditPost | RedditComment> = [];
  if (activeTab === 'Posts') displayItems = posts;
  else if (activeTab === 'Comments') displayItems = comments;
  else displayItems = allItems;

  const canLoadMore =
    activeTab === 'Posts' ? hasMorePosts :
    activeTab === 'Comments' ? hasMoreComments :
    (hasMorePosts || hasMoreComments);

  return (
    <div>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--color-neutral-border-weak)', backgroundColor: 'var(--color-neutral-background-weak)'
      }}>
        <h2 style={{ color: 'var(--color-neutral-content-strong)', margin: 0, fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg style={{ color: '#ff4500' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <span>Hidden profile activity shown by <span style={{ color: '#ff4500' }}>Unhider for Reddit</span></span>
        </h2>
      </div>

      {error && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--color-neutral-content-strong)', marginTop: '24px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-neutral-content-weak)' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>{error}</span>
        </div>
      )}

      {!loading && !error && displayItems.length === 0 && (
        <div style={{ padding: '24px', color: 'var(--color-neutral-content-weak)' }}>No activity found.</div>
      )}

      {displayItems.map(item => {
        if ('title' in item) {
          return <PostCard key={`post-${item.id}`} post={item as RedditPost} username={username} />;
        } else {
          return <CommentCard key={`comment-${item.id}`} comment={item as RedditComment} username={username} />;
        }
      })}

      {loading && (
        <div style={{ padding: '24px', color: 'var(--color-neutral-content-weak)' }}>Loading...</div>
      )}

      {!loading && !error && canLoadMore && displayItems.length > 0 && (
        <button className="unhider-load-more" onClick={() => loadData(activeTab, true)}>
          Load More
        </button>
      )}
    </div>
  );
}
