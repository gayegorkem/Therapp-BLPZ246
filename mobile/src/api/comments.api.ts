import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { PagedResult } from '@/types/api.types';
import type { Comment } from '@/types/post.types';

type PageParams = { page?: number; pageSize?: number };

export const commentsApi = {
  byPost: async (postId: string, params?: PageParams) => {
    const { data } = await apiClient.get<PagedResult<Comment>>(endpoints.comments.byPost(postId), {
      params: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 },
    });
    return data;
  },
  replies: async (id: string, params?: PageParams) => {
    const { data } = await apiClient.get<PagedResult<Comment>>(endpoints.comments.replies(id), {
      params: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 },
    });
    return data;
  },
  create: async (postId: string, content: string) => {
    const { data } = await apiClient.post<Comment>(endpoints.comments.byPost(postId), { content });
    return data;
  },
  reply: async (commentId: string, content: string) => {
    const { data } = await apiClient.post<Comment>(endpoints.comments.replies(commentId), { content });
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(endpoints.comments.byId(id));
  },
  like: async (id: string) => {
    await apiClient.post(endpoints.comments.like(id));
  },
  unlike: async (id: string) => {
    await apiClient.delete(endpoints.comments.like(id));
  },
};
