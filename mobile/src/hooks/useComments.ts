import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { commentsApi } from '@/api/comments.api';
import type { PagedResult } from '@/types/api.types';
import type { Comment } from '@/types/post.types';
import { queryKeys } from './queryKeys';
import { bumpCommentCount } from './usePosts';

type InfiniteComments = { pages: PagedResult<Comment>[]; pageParams: number[] };

// ---------- Reads ----------

export function useComments(postId: string | undefined) {
  return useInfiniteQuery({
    queryKey: postId ? queryKeys.comments.byPost(postId) : ['comments', 'noop'],
    queryFn: ({ pageParam }) =>
      commentsApi.byPost(postId as string, { page: pageParam, pageSize: 20 }),
    enabled: !!postId,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useReplies(commentId: string | undefined, enabled = false) {
  return useInfiniteQuery({
    queryKey: commentId ? queryKeys.comments.replies(commentId) : ['comments', 'replies', 'noop'],
    queryFn: ({ pageParam }) =>
      commentsApi.replies(commentId as string, { page: pageParam, pageSize: 20 }),
    enabled: !!commentId && enabled,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

// ---------- Optimistic helpers ----------

function patchCommentInList(qc: QueryClient, postId: string, commentId: string, patch: (c: Comment) => Comment) {
  qc.setQueryData<InfiniteComments>(queryKeys.comments.byPost(postId), (data) => {
    if (!data?.pages) return data;
    return {
      ...data,
      pages: data.pages.map((p) => ({
        ...p,
        items: p.items.map((c) => (c.id === commentId ? patch(c) : c)),
      })),
    };
  });
}

// ---------- Mutations ----------

export function useCreateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsApi.create(postId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
      bumpCommentCount(qc, postId, 1);
    },
  });
}

export function useCreateReply(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parentCommentId, content }: { parentCommentId: string; content: string }) =>
      commentsApi.reply(parentCommentId, content),
    onSuccess: (_data, { parentCommentId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.replies(parentCommentId) });
      patchCommentInList(qc, postId, parentCommentId, (c) => ({ ...c, replyCount: c.replyCount + 1 }));
      bumpCommentCount(qc, postId, 1);
    },
  });
}

export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
      bumpCommentCount(qc, postId, -1);
    },
  });
}

export function useLikeComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }) => {
      if (liked) await commentsApi.unlike(id);
      else await commentsApi.like(id);
    },
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: queryKeys.comments.byPost(postId) });
      const delta = liked ? -1 : 1;
      const next = !liked;
      patchCommentInList(qc, postId, id, (c) => ({
        ...c,
        isLikedByMe: next,
        likeCount: Math.max(0, c.likeCount + delta),
      }));
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) });
    },
  });
}
