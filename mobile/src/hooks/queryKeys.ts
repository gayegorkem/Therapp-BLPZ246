import type { FeedSort } from '@/types/post.types';

export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    bySlug: (slug: string) => ['categories', slug] as const,
  },
  posts: {
    root: ['posts'] as const,
    feed: (sort: FeedSort) => ['posts', 'feed', sort] as const,
    byCategory: (slug: string, sort: FeedSort) => ['posts', 'category', slug, sort] as const,
    byId: (id: string) => ['posts', 'detail', id] as const,
    mine: (sort: FeedSort) => ['posts', 'me', sort] as const,
    saved: (sort: FeedSort) => ['posts', 'me', 'saved', sort] as const,
  },
  comments: {
    byPost: (postId: string) => ['comments', 'post', postId] as const,
    replies: (id: string) => ['comments', id, 'replies'] as const,
  },
  notifications: {
    list: ['notifications'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  users: {
    me: ['users', 'me'] as const,
    byUsername: (username: string) => ['users', username] as const,
  },
} as const;
