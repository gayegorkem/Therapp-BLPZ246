import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { CategoryChip } from '@/components/category/CategoryChip';
import { PostActions } from './PostActions';
import { colors, radius, spacing, typography } from '@/theme';
import { relativeTime } from '@/utils/formatDate';
import { useLikePost, useSavePost } from '@/hooks/usePosts';
import type { PostListItem } from '@/types/post.types';

type Props = {
  post: PostListItem;
};

export function PostCard({ post }: Props) {
  const router = useRouter();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  const onOpen = () => router.push(`/post/${post.id}`);
  const onLike = () => likeMutation.mutate({ id: post.id, liked: post.isLikedByMe });
  const onSave = () => saveMutation.mutate({ id: post.id, saved: post.isSavedByMe });

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
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
            <Avatar uri={post.author.avatarUrl} name={post.author.displayName} size={28} />
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author.displayName}
            </Text>
          </>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      {post.excerpt ? (
        <Text style={styles.excerpt} numberOfLines={3}>
          {post.excerpt}
        </Text>
      ) : null}

      <PostActions
        likeCount={post.likeCount}
        isLiked={post.isLikedByMe}
        onLike={onLike}
        commentCount={post.commentCount}
        onComment={onOpen}
        saveCount={post.saveCount}
        isSaved={post.isSavedByMe}
        onSave={onSave}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.95 },
  headerRow: {
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
    marginBottom: spacing.md,
  },
  anonymousAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonymousInitial: {
    ...typography.label,
    color: colors.textMuted,
  },
  authorName: {
    ...typography.label,
    color: colors.textSecondary,
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  excerpt: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
