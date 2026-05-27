import { ApiMessageRequest } from '../api/types';

const API_BASE = 'https://arctic-shift.photon-reddit.com';

let rateLimitRemaining = 100;
let rateLimitResetTime = 0;

async function fetchWithRateLimit(url: string) {
  if (rateLimitRemaining < 5 && Date.now() < rateLimitResetTime) {
    throw new Error('Unhider for Reddit: Servers are currently busy, please try again later.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Unhider for Reddit: Servers are currently busy, please try again later.');
    }
    throw new Error('Unhider for Reddit: Servers are currently busy, please try again later.');
  } finally {
    clearTimeout(timeoutId);
  }
  
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (remaining !== null) rateLimitRemaining = parseInt(remaining, 10);
  if (reset !== null) rateLimitResetTime = Date.now() + parseInt(reset, 10) * 1000;

  if (!response.ok) {
    if (response.status === 429 || response.status >= 500) {
      throw new Error('Unhider for Reddit: Servers are currently busy, please try again later.');
    }
    throw new Error('Unhider for Reddit: Servers are currently busy, please try again later.');
  }

  return response.json();
}

const postCache: Record<string, any> = {};

chrome.runtime.onMessage.addListener((request: ApiMessageRequest, sender, sendResponse) => {
  const handleRequest = async () => {
    try {
      const { action, username, before } = request;
      let url = '';
      
      if (action === 'SAVE_POST_CACHE') {
        if (request.postId && request.postData) {
          postCache[request.postId] = request.postData;
        }
        sendResponse({ success: true });
        return;
      }
      
      if (action === 'GET_POST_CACHE') {
        sendResponse({ success: true, data: request.postId ? postCache[request.postId] : null });
        return;
      }

      if (action === 'GET_USER') {
        url = `${API_BASE}/api/users/search?author=${encodeURIComponent(username || '')}`;
        const resp = await fetchWithRateLimit(url);
        let items = Array.isArray(resp) ? resp : (resp.data && Array.isArray(resp.data) ? resp.data : []);
        const userStats = items.length > 0 ? items[0] : null;
        sendResponse({ success: true, data: userStats });
        return;
      }
      
      if (action === 'GET_INFO') {
        if (!request.ids || request.ids.length === 0) {
          sendResponse({ success: true, data: [] });
          return;
        }
        url = `https://www.reddit.com/api/info.json?id=${request.ids.join(',')}`;
        const resp = await fetch(url).then(r => r.json());
        const children = resp?.data?.children || [];
        const items = children.map((c: any) => c.data);
        sendResponse({ success: true, data: items });
        return;
      }
      
      const beforeParam = before ? `&before=${before}` : '';
      
      if (action === 'GET_POSTS') {
        url = `${API_BASE}/api/posts/search?author=${encodeURIComponent(username || '')}&limit=25&sort=desc&md2html=true${beforeParam}`;
      } else if (action === 'GET_COMMENTS') {
        if (request.postId) {
          url = `${API_BASE}/api/comments/search?link_id=t3_${encodeURIComponent(request.postId)}&limit=100&md2html=true`;
        } else {
          url = `${API_BASE}/api/comments/search?author=${encodeURIComponent(username || '')}&limit=25&sort=desc&md2html=true${beforeParam}`;
        }
      } else {
        throw new Error('Unknown action');
      }

      const data = await fetchWithRateLimit(url);
      sendResponse({ success: true, data });
    } catch (error: any) {
      sendResponse({ success: false, error: error.message });
    }
  };

  handleRequest();
  
  // Return true to indicate asynchronous response
  return true;
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url.includes('.reddit.com')) {
    chrome.tabs.sendMessage(details.tabId, { action: 'SPA_NAVIGATED', url: details.url }).catch(() => {});
  }
});
