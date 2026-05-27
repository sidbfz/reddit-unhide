import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../components/App';
import styleContent from './index.css?inline';

function getUsername() {
  const match = window.location.pathname.match(/\/user\/([^\/]+)/);
  return match ? match[1] : null;
}

function mountReactApp(targetElement: Element) {
  if (document.getElementById('reddit-unhide-root')) return;

  const username = getUsername();
  if (!username) return;

  let emptyStateWrapper: HTMLElement | null = targetElement as HTMLElement;
  for (let i = 0; i < 4; i++) {
    if (emptyStateWrapper?.parentElement && emptyStateWrapper.parentElement.tagName.toLowerCase() !== 'body') {
      emptyStateWrapper = emptyStateWrapper.parentElement;
    }
  }

  let insertPoint = targetElement;
  if (emptyStateWrapper) {
    emptyStateWrapper.style.display = 'none';
    insertPoint = emptyStateWrapper;
  }

  const container = document.createElement('div');
  container.id = 'reddit-unhide-root';
  container.style.width = '100%';
  // Reddit puts a lot of native padding/margins on that empty state container's parent
  // We can offset it with a negative margin to pull the feed higher up! 
  container.style.marginTop = '-100px'; 
  
  insertPoint.parentNode?.insertBefore(container, insertPoint.nextSibling);

  const root = createRoot(container);
  root.render(<App username={username} />);
}

function findDeepestNodeWithText(searchStr: string): Element | null {
  const allElements = document.querySelectorAll('body *');
  let deepestMatch: Element | null = null;
  for (const el of Array.from(allElements)) {
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'script' || tagName === 'style' || tagName === 'noscript' || tagName === 'template') {
      continue;
    }

    const htmlEl = el as HTMLElement;
    const text = (htmlEl.textContent || '').toLowerCase();
    if (text.includes(searchStr)) {
      deepestMatch = el;
    }
  }
  return deepestMatch;
}

function checkForHiddenMessage() {
  if (document.getElementById('reddit-unhide-root')) return;

  console.log('[Unhider for Reddit] Scanning for hidden profile message...');

  const triggerPhrases = [
    'likes to keep their',
    'comment deleted by user',
    'comments deleted by user'
  ];
  const targetNode = triggerPhrases
    .map((phrase) => findDeepestNodeWithText(phrase))
    .find((node) => node !== null) || null;
  
  if (targetNode) {
     console.log('[Unhider for Reddit] Found hidden message element!', targetNode);
     mountReactApp(targetNode);
     return;
  }
}

// Check frequently because Reddit is a Single Page Application (SPA)
// MutationObserver might miss it if it's very deeply nested or if we attach it before body exists
let scanningInterval = setInterval(() => {
  checkForHiddenMessage();
}, 2000);

const evaluateProfileMounting = () => {
  // If not on user profile, remove root
  if (!window.location.pathname.includes('/user/')) {
    const root = document.getElementById('reddit-unhide-root');
    if (root) root.remove();
    return;
  }
  
  checkForHiddenMessage();
};

function nukeNativeSortAndFeedOptions() {
  // Only nuke if we are currently overriding the feed
  if (!document.getElementById('reddit-unhide-root')) return;

  const selectors = [
    'shreddit-feed-options',
    'shreddit-sort-dropdown',
    'shreddit-async-loader[bundlename="shreddit_sort_dropdown"]',
    'shreddit-async-loader[bundlename="shreddit_feed_options"]',
    '#profile-feed-options-container',
    '#sort-dropdown-container',
    'faceplate-tracker[data-testid="post-sort-button"]',
    'faceplate-tracker[data-testid="feed-options-button"]',
    'button[aria-controls*="feed-options"]',
    'button[aria-controls*="sort-dropdown"]',
    '[data-testid="post-sort-button"]',
    '[data-testid="feed-options-button"]',
    'shreddit-layout-event-setter rpl-dropdown',
    'div[data-faceplate-tracking-context*="feed_options"]',
    'rpl-dropdown[data-faceplate-tracking-context*="feed_options"]'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el: any) => {
      // Find the outermost padding container to clean up the space completely
      let targetElement = el;
      if (el.tagName.toLowerCase() === 'rpl-dropdown' && el.parentElement && el.parentElement.parentElement) {
          targetElement = el.parentElement.parentElement;
      }
      
      if (targetElement.style.display !== 'none') {
        targetElement.style.display = 'none';
      }
    });
  });
}

// Observe the DOM for the hidden message or SPA navigation
const observer = new MutationObserver(() => {
  evaluateProfileMounting();
  nukeNativeSortAndFeedOptions();
});

// Chrome extension SPA listener
chrome.runtime.onMessage.addListener((request: any) => {
  if (request.action === 'SPA_NAVIGATED') {
    setTimeout(evaluateProfileMounting, 200);
  }
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

checkForHiddenMessage();
