import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function htmlToPlainText(input: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  return (doc.body.textContent || '').trim();
}

function getPostIdFromUrl() {
  const match = window.location.pathname.match(/\/comments\/([a-zA-Z0-9]+)\//);
  return match ? match[1] : null;
}

const authorAvatarMap = new Map<string, number>();
let nextAvatarId = 0;

function getAvatarIndex(str: string) {
  if (!str) return 0;
  if (!authorAvatarMap.has(str)) {
    authorAvatarMap.set(str, nextAvatarId);
    nextAvatarId = (nextAvatarId + 1) % 8; // Cycles 0 through 7 for diverse colors
  }
  return authorAvatarMap.get(str);
}



function CommentNode({ node }: { node: any }) {
  const [collapsed, setCollapsed] = useState(false);
  const avatarIndex = getAvatarIndex(node.author);
  const plainBody = node.body_html
    ? htmlToPlainText(node.body_html)
    : (node.body || '');
  // Dynamic reddit avatar based on username hash
  const avatarUrl = `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarIndex}.png`;

  return (
    <div style={{ display: 'flex', flexDirection: 'row', marginTop: '16px' }}>
      {/* Left Gutter */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '8px', minWidth: '32px' }}>
        {collapsed ? (
          <div 
            onClick={() => setCollapsed(false)}
            style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-neutral-background-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-content-strong)', cursor: 'pointer', fontSize: '18px', lineHeight: '1' }}
            title="Expand"
          >
            +
          </div>
        ) : (
          <img src={avatarUrl} style={{ width: '32px', height: '32px', borderRadius: '50%', zIndex: 1 }} alt="avatar" />
        )}
        {!collapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, width: '100%', marginTop: '4px' }}>
             <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--color-neutral-border-weak)' }} />
             <div 
               onClick={() => setCollapsed(true)} 
               style={{ 
                 cursor: 'pointer', 
                 width: '16px', 
                 height: '16px', 
                 borderRadius: '50%', 
                 border: '1px solid var(--color-neutral-border-weak)', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 backgroundColor: 'var(--color-neutral-background)',
                 color: 'var(--color-neutral-content-strong)',
                 zIndex: 1
               }}
               title="Collapse"
             >
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
             </div>
             <div style={{ 
               flexGrow: 1, 
               width: '2px', 
               backgroundColor: 'var(--color-neutral-border-weak)',
               cursor: 'pointer',
               transition: 'background-color 0.2s',
               marginTop: '-1px'
             }} 
             onClick={() => setCollapsed(true)}
             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-content-strong)')}
             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-border-weak)')}
             />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ fontSize: '12px', color: 'var(--color-neutral-content-weak)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <a 
            href={node.author === '[deleted]' ? undefined : `https://reddit.com/user/${node.author}`} 
            style={{ 
              fontWeight: 'bold', 
              color: 'var(--color-neutral-content-strong)', 
              textDecoration: 'none',
              cursor: node.author === '[deleted]' ? 'default' : 'pointer'
            }}
            onMouseEnter={e => { if (node.author !== '[deleted]') e.currentTarget.style.color = '#24a0ed'; }}
            onMouseLeave={e => { if (node.author !== '[deleted]') e.currentTarget.style.color = 'var(--color-neutral-content-strong)'; }}
            target={node.author === '[deleted]' ? undefined : "_blank"}
            rel="noreferrer"
          >
            {node.author}
          </a> 
          <span>•</span>
          <span>{new Date(node.created_utc * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}</span>
        </div>

        {!collapsed && (
          <>
            {/* Body */}
            <div style={{ color: 'var(--color-neutral-content-strong)', fontSize: '14px', lineHeight: '1.4', marginBottom: '8px', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
              {plainBody}
            </div>
            
            {/* Children container */}
            <div style={{ marginTop: '0px' }}>
              {node.children && node.children.map((child: any) => (
                <CommentNode key={child.id} node={child} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ArchivedPostBody({ postData }: { postData: any }) {
  if (!postData) return null;
  const plainSelfText = postData.selftext_html
    ? htmlToPlainText(postData.selftext_html)
    : (postData.selftext || '');
  return (
    <div style={{
      margin: '16px 0', padding: '16px', border: '1px solid rgba(255, 69, 0, 0.4)',
      borderRadius: '8px', backgroundColor: 'var(--color-neutral-background-weak)', color: 'var(--color-neutral-content-strong)'
    }}>
      <h2 style={{ color: 'var(--color-neutral-content-strong)', marginTop: 0, fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg style={{ color: '#ff4500' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>Deleted post shown by <span style={{ color: '#ff4500' }}>Unhider for Reddit</span></span>
      </h2>
      <h1 style={{ fontSize: '20px', margin: '0 0 8px 0', color: 'var(--color-neutral-content-strong)' }}>{postData.title}</h1>
      <div style={{ fontSize: '12px', color: 'var(--color-neutral-content-weak)', marginBottom: '12px' }}>
         Posted by <a 
           href={postData.author === '[deleted]' ? undefined : `https://reddit.com/user/${postData.author}`}
           style={{ fontWeight: 'bold', color: 'var(--color-neutral-content-strong)', textDecoration: 'none', cursor: postData.author === '[deleted]' ? 'default' : 'pointer' }}
           onMouseEnter={e => { if (postData.author !== '[deleted]') e.currentTarget.style.color = '#24a0ed'; }}
           onMouseLeave={e => { if (postData.author !== '[deleted]') e.currentTarget.style.color = 'var(--color-neutral-content-strong)'; }}
           target={postData.author === '[deleted]' ? undefined : "_blank"}
           rel="noreferrer"
         >{postData.author}</a> • {new Date(postData.created_utc * 1000).toLocaleString()}
      </div>
      {plainSelfText && (
        <div style={{ fontSize: '14px', lineHeight: '1.4', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
          {plainSelfText}
        </div>
      )}
    </div>
  );
}

function ArchivedCommentsView({ postId, commentsData }: { postId: string, commentsData: any[] }) {
  if (commentsData.length === 0) return null;

  // Build tree
  const commentMap = new Map();
  const roots: any[] = [];
  commentsData.forEach(c => {
    commentMap.set('t1_' + c.id, { ...c, children: [] });
  });
  commentsData.forEach(c => {
    const parent = commentMap.get(c.parent_id);
    if (parent) {
      parent.children.push(commentMap.get('t1_' + c.id));
    } else {
      roots.push(commentMap.get('t1_' + c.id));
    }
  });

  return (
    <div style={{
      margin: '16px 0', padding: '16px', border: '1px solid rgba(255, 69, 0, 0.4)',
      borderRadius: '8px', backgroundColor: 'var(--color-neutral-background-weak)', color: 'var(--color-neutral-content-strong)'
    }}>
      <h2 style={{ color: 'var(--color-neutral-content-strong)', margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg style={{ color: '#ff4500' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        <span>{commentsData.length} deleted comments shown by <span style={{ color: '#ff4500' }}>Unhider for Reddit</span></span>
      </h2>
      {roots.map(root => <CommentNode key={root.id} node={root} />)}
    </div>
  );
}

function MainInjectorController({ postId }: { postId: string }) {
  const [postData, setPostData] = useState<any>(null);
  const [commentsData, setCommentsData] = useState<any[]>([]);

  useEffect(() => {
    try {
      const localStr = window.localStorage.getItem(`unhide_post_${postId}`);
      if (localStr) setPostData(JSON.parse(localStr));
    } catch(e) {}

    chrome.runtime.sendMessage({ action: 'GET_COMMENTS', postId }, (response: any) => {
      if (response && response.success && response.data) {
        const arr = Array.isArray(response.data) ? response.data : (response.data.data || []);
        setCommentsData(arr);
      }
    });
  }, [postId]);

  useEffect(() => {
    // Render Post Body
    if (postData) {
      let postContainer = document.getElementById('reddit-unhide-post-container');
      if (!postContainer) {
        postContainer = document.createElement('div');
        postContainer.id = 'reddit-unhide-post-container';
        const shredditPost = document.querySelector('shreddit-post');
        const main = document.querySelector('main');
        const target = shredditPost || main;
        if (target && target.firstChild) {
          target.insertBefore(postContainer, target.firstChild);
        }
      }
      const postRoot = createRoot(postContainer);
      postRoot.render(<ArchivedPostBody postData={postData} />);
    }

    // Render Comments
    if (commentsData.length > 0) {
      let commentsContainer = document.getElementById('reddit-unhide-comments-container');
      if (!commentsContainer) {
        commentsContainer = document.createElement('div');
        commentsContainer.id = 'reddit-unhide-comments-container';
        const nativeTree = document.querySelector('shreddit-comment-tree');
        if (nativeTree && nativeTree.parentNode) {
          nativeTree.parentNode.insertBefore(commentsContainer, nativeTree.nextSibling);
        } else {
          // Fallback if no native tree
          const main = document.querySelector('main');
          if (main) main.appendChild(commentsContainer);
        }
      }
      const commentsRoot = createRoot(commentsContainer);
      commentsRoot.render(<ArchivedCommentsView postId={postId} commentsData={commentsData} />);
    }
  }, [postData, commentsData]);

  return null;
}

function initInjector() {
  // We want to insert the view right above the official Reddit post body or comments
  // Reddit uses a shadow DOM or complex tree, but we can just prepend to the main container.
  
  const injectTarget = () => {
    const shredditPost = document.querySelector('shreddit-post');
    if (shredditPost) return shredditPost;

    const main = document.querySelector('main');
    if (main) return main;

    return document.body;
  };

  const isTargetPostDeletedOrHidden = () => {
    // 1. Is the native post visibly deleted/removed?
    const shredditPost = document.querySelector('shreddit-post');
    if (shredditPost) {

      const html = shredditPost.innerHTML || '';
      if (html.includes('Removed by moderator') || 
          html.includes('deleted by the person who originally posted it') ||
          html.includes('Sorry, this post was removed by Reddit\'s filters') ||
          html.includes('Sorry, this post was removed by the moderators')) {
          return true;
      }
    }

    return false;
  };

  let currentPostId: string | null = null;
  let root: any = null;

  const clearInjectedUi = () => {
    ['reddit-unhide-post-container', 'reddit-unhide-comments-container', 'reddit-unhide-archived-root'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    if (root) {
      root.unmount();
      root = null;
    }
    currentPostId = null;
  };

  const setNativeCommentsVisible = (visible: boolean) => {
    const nativeTree = document.querySelector('shreddit-comment-tree') as HTMLElement | null;
    if (!nativeTree) return;
    nativeTree.style.display = visible ? '' : 'none';
  };

  const attemptInjection = () => {
    const postId = getPostIdFromUrl();
    
    // If we navigated away from a post page, remove the injector
    if (!postId) {
      clearInjectedUi();
      setNativeCommentsVisible(true);
      return;
    }

    // Only operate if the post is actually hidden or deleted!
    if (!isTargetPostDeletedOrHidden()) {
      clearInjectedUi();
      setNativeCommentsVisible(true);
      return;
    }

    // Hide native reddit comments tree if we are taking over
    setNativeCommentsVisible(false);

    // If already injected for this specific post, do nothing
    if (document.getElementById('reddit-unhide-archived-root') && currentPostId === postId) return;

    // If ID changed (SPA navigation between posts), remove old ones
    clearInjectedUi();

    currentPostId = postId;
    const container = document.createElement('div');
    container.id = 'reddit-unhide-archived-root';
    document.body.appendChild(container);

    root = createRoot(container);
    root.render(<MainInjectorController postId={postId} />);
  };

  setTimeout(attemptInjection, 500);
  
  const observer = new MutationObserver(() => attemptInjection());
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Listen to background script for SPA navigation events
  chrome.runtime.onMessage.addListener((request: any) => {
    if (request.action === 'SPA_NAVIGATED') {
      setTimeout(attemptInjection, 200);
    }
  });

  // Also hook popstate just as a safety net
  window.addEventListener('popstate', () => setTimeout(attemptInjection, 200));
}

initInjector();
