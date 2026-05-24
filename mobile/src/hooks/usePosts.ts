import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { postsApi, type CreatePostPayload, type UpdatePostPayload } from '@/api/posts.api';
import type { PagedResult } from '@/types/api.types';
import type { FeedSort, Post, PostListItem } from '@/types/post.types';
import { queryKeys } from './queryKeys';

type InfiniteFeed = { pages: PagedResult<PostListItem>[]; pageParams: number[] };

// ---------- Reads ----------

export function useFeed(sort: FeedSort) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.feed(sort),
    queryFn: ({ pageParam }) => postsApi.feed({ sort, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useCategoryFeed(slug: string | undefined, sort: FeedSort) {
  return useInfiniteQuery({
    queryKey: slug ? queryKeys.posts.byCategory(slug, sort) : ['posts', 'category', 'noop'],
    queryFn: ({ pageParam }) =>
      postsApi.byCategory(slug as string, { sort, page: pageParam, pageSize: 20 }),
    enabled: !!slug,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useMyPosts(sort: FeedSort = 'new') {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.mine(sort),
    queryFn: ({ pageParam }) => postsApi.mine({ sort, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useMySaved(sort: FeedSort = 'new') {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.saved(sort),
    queryFn: ({ pageParam }) => postsApi.mySaved({ sort, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.posts.byId(id) : ['posts', 'detail', 'noop'],
    queryFn: () => postsApi.byId(id as string),
    enabled: !!id,
  });
}

// ---------- Optimistic helpers ----------

type ListPatch = (item: PostListItem) => PostListItem;
type DetailPatch = (item: Post) => Post;

function patchListsAndDetail(qc: QueryClient, postId: string, listPatch: ListPatch, detailPatch: DetailPatch) {
  // Detail
  qc.setQueryData<Post>(queryKeys.posts.byId(postId), (old) => (old ? detailPatch(old) : old));

  // All infinite lists under ['posts']
  qc.setQueriesData<InfiniteFeed>({ queryKey: queryKeys.posts.root }, (data) => {
    if (!data?.pages) return data;
    return {
      ...data,
      pages: data.pages.map((p) => ({
        ...p,
        items: p.items.map((item) => (item.id === postId ? listPatch(item) : item)),
      })),
    };
  });
}

// ---------- Mutations ----------

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }) => {
      if (liked) await postsApi.unlike(id);
      else await postsApi.like(id);
    },
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: queryKeys.posts.root });
      const delta = liked ? -1 : 1;
      const next = !liked;
      patchListsAndDetail(
        qc,
        id,
        (item) => ({ ...item, isLikedByMe: next, likeCount: Math.max(0, item.likeCount + delta) }),
        (item) => ({ ...item, isLikedByMe: next, likeCount: Math.max(0, item.likeCount + delta) })
      );
    },
    onError: () => {
      // Roll back by refetching — simpler than snapshotting many caches
      qc.invalidateQueries({ queryKey: queryKeys.posts.root });
    },
  });
}

export function useSavePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, saved }: { id: string; saved: boolean }) => {
      if (saved) await postsApi.unsave(id);
      else await postsApi.save(id);
    },
    onMutate: async ({ id, saved }) => {
      await qc.cancelQueries({ queryKey: queryKeys.posts.root });
      const delta = saved ? -1 : 1;
      const next = !saved;
      patchListsAndDetail(
        qc,
        id,
        (item) => ({ ...item, isSavedByMe: next, saveCount: Math.max(0, item.saveCount + delta) }),
        (item) => ({ ...item, isSavedByMe: next, saveCount: Math.max(0, item.saveCount + delta) })
      );
    },
    onSettled: (_d, _e, { id }) => {
      // Saved list might need refresh when toggled
      qc.invalidateQueries({ queryKey: ['posts', 'me', 'saved'] });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.root });
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.root });
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) =>
      postsApi.update(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.posts.byId(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.posts.root });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.root });
    },
  });
}

// Called from comment hooks to bump count without refetch
export function bumpCommentCount(qc: QueryClient, postId: string, delta: number) {
  qc.setQueryData<Post>(queryKeys.posts.byId(postId), (old) =>
    old ? { ...old, commentCount: Math.max(0, old.commentCount + delta) } : old
  );
  qc.setQueriesData<InfiniteFeed>({ queryKey: queryKeys.posts.root }, (data) => {
    if (!data?.pages) return data;
    return {
      ...data,
      pages: data.pages.map((p) => ({
        ...p,
        items: p.items.map((item) =>
          item.id === postId
            ? { ...item, commentCount: Math.max(0, item.commentCount + delta) }
            : item
        ),
      })),
    };
  });
}
