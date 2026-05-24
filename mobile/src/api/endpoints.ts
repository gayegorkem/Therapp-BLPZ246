export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
    byUsername: (username: string) => `/users/${encodeURIComponent(username)}`,
  },
  categories: {
    list: '/categories',
    bySlug: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  },
  posts: {
    feed: '/posts',
    byCategory: (slug: string) => `/posts/category/${encodeURIComponent(slug)}`,
    mine: '/posts/me',
    mySaved: '/posts/me/saved',
    byId: (id: string) => `/posts/${id}`,
    like: (id: string) => `/posts/${id}/like`,
    save: (id: string) => `/posts/${id}/save`,
  },
  comments: {
    byPost: (postId: string) => `/posts/${postId}/comments`,
    replies: (id: string) => `/comments/${id}/replies`,
    byId: (id: string) => `/comments/${id}`,
    like: (id: string) => `/comments/${id}/like`,
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    read: (id: string) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
  },
  reports: {
    create: '/reports',
  },
} as const;
