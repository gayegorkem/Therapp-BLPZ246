import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Flag, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { CategoryChip } from '@/components/category/CategoryChip';
import { PostActions } from '@/components/post/PostActions';
import { CommentItem } from '@/components/comment/CommentItem';
import { CommentComposer } from '@/components/comment/CommentComposer';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, spacing, typography } from '@/theme';
import { relativeTime } from '@/utils/formatDate';
import { usePost, useLikePost, useSavePost, useDeletePost } from '@/hooks/usePosts';
import {
  useComments,
  useCreateComment,
  useCreateReply,
  useLikeComment,
} from '@/hooks/useComments';
import type { Comment } from '@/types/post.types';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: post, isLoading } = usePost(id);
  const {
    data: commentsData,
    isLoading: commentsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useComments(id);

  const comments = commentsData?.pages.flatMap((p) => p.items) ?? [];

  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment(id as string);
  const createReplyMutation = useCreateReply(id as string);
  const likeCommentMutation = useLikeComment(id as string);

  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  if (isLoading || !post) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  const onSubmit = async (content: string) => {
    if (replyTo) {
      await createReplyMutation.mutateAsync({ parentCommentId: replyTo.id, content });
      setReplyTo(null);
    } else {
      await createCommentMutation.mutateAsync(content);
    }
  };

  const onDeletePost = async () => {
    await deletePostMutation.mutateAsync(post.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Gönderi</Text>
        <Pressable
          onPress={() =>
            post.isMine
              ? onDeletePost()
              : router.push(`/report?type=0&id=${post.id}`)
          }
          hitSlop={8}
          style={styles.iconBtn}
        >
          {post.isMine ? (
            <Trash2 size={20} color={colors.danger} />
          ) : (
            <MoreHorizontal size={22} color={colors.text} />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          data={comments}
          keyExtractor={(c: Comment) => c.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.postBlock}>
              <View style={styles.metaRow}>
                <CategoryChip name={post.category.name} color={post.category.color} />
                <Text style={styles.time}>{relativeTime(post.createdAt)}</Text>
              </View>

              <View style={styles.authorRow}>
                {post.isAnonymous || !post.author ? (
                  <>
                    <View style={styles.anonymousAvatar}>
                      <Text style={styles.anonymousInitial}>?</Text>
                    </View>
                    <Text style={styles.authorName}>Anonim</Text>
                  </>
                ) : (
                  <>
                    <Avatar uri={post.author.avatarUrl} name={post.author.displayName} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.authorName}>{post.author.displayName}</Text>
                      <Text style={styles.authorHandle}>@{post.author.username}</Text>
                    </View>
                  </>
                )}
              </View>

              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.content}>{post.content}</Text>

              <PostActions
                likeCount={post.likeCount}
                isLiked={post.isLikedByMe}
                onLike={() => likeMutation.mutate({ id: post.id, liked: post.isLikedByMe })}
                commentCount={post.commentCount}
                saveCount={post.saveCount}
                isSaved={post.isSavedByMe}
                onSave={() => saveMutation.mutate({ id: post.id, saved: post.isSavedByMe })}
              />

              <View style={styles.divider} />
              <Text style={styles.commentsHeader}>
                {post.commentCount > 0 ? `${post.commentCount} yorum` : 'Henüz yorum yok'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              onLike={() => likeCommentMutation.mutate({ id: item.id, liked: item.isLikedByMe })}
              onReply={() => setReplyTo({ id: item.id, name: item.author.displayName })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.commentDivider} />}
          ListEmptyComponent={
            commentsLoading ? (
              <View style={{ paddingVertical: spacing.xl }}>
                <LoadingState size="small" />
              </View>
            ) : (
              <EmptyState title="İlk yorumu sen yap" />
            )
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: spacing.lg }}>
                <LoadingState size="small" />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />

        <CommentComposer
          replyingTo={replyTo?.name ?? null}
          onCancelReply={() => setReplyTo(null)}
          submitting={createCommentMutation.isPending || createReplyMutation.isPending}
          onSubmit={onSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  postBlock: {
    paddingVertical: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  anonymousAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonymousInitial: {
    ...typography.subtitle,
    color: colors.textMuted,
  },
  authorName: {
    ...typography.label,
    color: colors.text,
  },
  authorHandle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
  },
  content: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  commentsHeader: {
    ...typography.subtitle,
    color: colors.text,
  },
  commentDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.xxl,
  },
});
