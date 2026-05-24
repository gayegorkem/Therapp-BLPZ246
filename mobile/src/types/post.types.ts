export type PostAuthor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type PostCategory = {
  id: string;
  slug: string;
  name: string;
  color: string;
  icon: string;
};

export type PostListItem = {
  id: string;
  title: string;
  excerpt: string;
  isAnonymous: boolean;
  category: PostCategory;
  author: PostAuthor | null;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  createdAt: string;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  category: PostCategory;
  author: PostAuthor | null;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
  isMine: boolean;
};

export type CommentAuthor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type Comment = {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  author: CommentAuthor;
  likeCount: number;
  replyCount: number;
  isLikedByMe: boolean;
  isMine: boolean;
  createdAt: string;
};

export type FeedSort = 'new' | 'popular';
