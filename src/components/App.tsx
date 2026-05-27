import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { RedditUserStats } from '../api/types';
import HiddenProfileFeed from './HiddenProfileFeed';

export default function App({ username }: { username: string }) {
  const [stats, setStats] = useState<RedditUserStats | null>(null);

  useEffect(() => {
    apiClient.getUser(username).then(setStats).catch(console.error);
  }, [username]);

  return (
    <>
      <style>{`
        .unhider-feed-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 0px;
          border-bottom: 1px solid var(--color-neutral-border-weak);
          padding-bottom: 12px;
          margin-top: 12px;
        }
        .unhider-pill {
          background: transparent;
          border: none;
          color: var(--color-neutral-content-weak);
          padding: 8px 16px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.1s, color 0.1s;
        }
        .unhider-pill:hover {
          background: var(--color-neutral-background-hover);
        }
        .unhider-pill.active {
          background: var(--color-neutral-background-selected);
          color: var(--color-neutral-content-strong);
        }
        .unhider-load-more {
          width: calc(100% - 32px);
          padding: 12px;
          margin: 24px 16px;
          border-radius: 999px;
          background: var(--color-neutral-background-hover);
          color: var(--color-neutral-content-strong);
          border: none;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 40px;
          line-height: 1;
        }
        .unhider-load-more:hover {
          background: var(--color-neutral-background-selected);
        }

        /* Hide Reddit's native sorting and feed options on hidden profiles */
        shreddit-feed-options,
        shreddit-sort-dropdown,
        shreddit-async-loader[bundlename="shreddit_sort_dropdown"],
        shreddit-async-loader[bundlename="shreddit_feed_options"],
        #profile-feed-options-container,
        #sort-dropdown-container,
        faceplate-dropdown-menu[id*="sort"],
        faceplate-dropdown-menu[id*="feed_options"],
        div:has(> shreddit-feed-options),
        div:has(> shreddit-sort-dropdown),
        button[aria-controls*="feed-options"],
        button[aria-controls*="sort-dropdown"] {
          display: none !important;
        }
      `}</style>
      <div style={{ width: '100%' }}>
        <HiddenProfileFeed username={username} />
      </div>
    </>
  );
}
