import { RedditUserStats, RedditPost, RedditComment, ApiMessageRequest } from './types';

function extractData(resp: any) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (resp.data && Array.isArray(resp.data)) return resp.data;
  return [];
}

export const apiClient = {
  getUser: (username: string): Promise<RedditUserStats | null> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'GET_USER', username }, (response) => {
        if (response?.success) resolve(response.data);
        else reject(new Error(response?.error || 'Unknown error'));
      });
    });
  },
  getPosts: (username: string, before?: number): Promise<RedditPost[]> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'GET_POSTS', username, before }, (response) => {
         if (response?.success) resolve(extractData(response.data));
         else reject(new Error(response?.error || 'Unknown error'));
      });
    });
  },
  getComments: (username: string, before?: number): Promise<RedditComment[]> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'GET_COMMENTS', username, before }, (response) => {
         if (response?.success) resolve(extractData(response.data));
         else reject(new Error(response?.error || 'Unknown error'));
      });
    });
  },
  getInfo: (ids: string[]): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'GET_INFO', username: '', ids }, (response) => {
         if (response?.success) resolve(extractData(response.data));
         else reject(new Error(response?.error || 'Unknown error'));
      });
    });
  }
};
