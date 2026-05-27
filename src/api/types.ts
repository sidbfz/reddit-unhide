export interface RedditUserStats {
  karma: number;
  post_count: number;
  comment_count: number;
  created_utc: number;
}

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  permalink: string;
  selftext?: string;
}

export interface RedditComment {
  id: string;
  body_html: string;
  subreddit: string;
  score: number;
  created_utc: number;
  link_id: string;
  permalink: string;
  parent_id: string;
  parent_author?: string;
}

// Request and Response formats for messages
export type ApiAction = 'GET_USER' | 'GET_POSTS' | 'GET_COMMENTS' | 'GET_INFO' | 'GET_POST_CACHE' | 'SAVE_POST_CACHE';

export interface ApiMessageRequest {
  action: ApiAction;
  username?: string;
  before?: number;
  ids?: string[];
  postId?: string;
  postData?: any;
}
