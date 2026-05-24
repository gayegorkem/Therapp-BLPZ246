import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { PagedResult } from '@/types/api.types';
import type { Post, PostListItem, FeedSort } from '@/types/post.types';

type FeedParams = {
  sort?: FeedSort;
  page?: number;
  pageSize?: number;
};

function feedQuery(params?: FeedParams) {
  const sortMap: Record<FeedSort, number> = { new: 0, popular: 1 };
  return {
    sort: sortMap[params?.sort ?? 'new'],
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  };
}

export type CreatePostPayload = {
  categoryId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
};

export type UpdatePostPayload = {
  title: string;
  content: string;
};

export const postsApi = {
  feed: async (params?: FeedParams) => {
    const { data } = await apiClient.get<PagedResult<PostListItem>>(endpoints.posts.feed, {
      params: feedQuery(params),
    });
    return data;
  },
  byCategory: async (slug: string, params?: FeedParams) => {
    const { data } = await apiClient.get<PagedResult<PostListItem>>(endpoints.posts.byCategory(slug), {
      params: feedQuery(params),
    });
    return data;
  },
  mine: async (params?: FeedParams) => {
    const { data } = await apiClient.get<PagedResult<PostListItem>>(endpoints.posts.mine, {
      params: feedQuery(params),
    });
    return data;
  },
  mySaved: async (params?: FeedParams) => {
    const { data } = await apiClient.get<PagedResult<PostListItem>>(endpoints.posts.mySaved, {
      params: feedQuery(params),
    });
    return data;
  },
  byId: async (id: string) => {
    const { data } = await apiClient.get<Post>(endpoints.posts.byId(id));
    return data;
  },
  create: async (payload: CreatePostPayload) => {
    const { data } = await apiClient.post<Post>(endpoints.posts.feed, payload);
    return data;
  },
  update: async (id: string, payload: UpdatePostPayload) => {
    const { data } = await apiClient.patch<Post>(endpoints.posts.byId(id), payload);
    return data;
  },
  delete: async (id: string) => {
    await apiClient.delete(endpoints.posts.byId(id));
  },
  like: async (id: string) => {
    await apiClient.post(endpoints.posts.like(id));
  },
  unlike: async (id: string) => {
    await apiClient.delete(endpoints.posts.like(id));
  },
  save: async (id: string) => {
    await apiClient.post(endpoints.posts.save(id));
  },
  unsave: async (id: string) => {
    await apiClient.delete(endpoints.posts.save(id));
  },
};
