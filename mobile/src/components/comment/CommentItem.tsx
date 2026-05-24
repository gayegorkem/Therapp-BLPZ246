import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, MessageSquare } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, typography } from '@/theme';
import { relativeTime } from '@/utils/formatDate';
import type { Comment } from '@/types/post.types';

type Props = {
  comment: Comment;
  onLike?: () => void;
  onReply?: () => void;
  isReply?: boolean;
};

export function CommentItem({ comment, onLike, onReply, isReply = false }: Props) {
  return (
    <View style={[styles.row, isReply && styles.reply]}>
      <Avatar uri={comment.author.avatarUrl} name={comment.author.displayName} size={32} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {comment.author.displayName}
          </Text>
          <Text style={styles.time}>{relativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.content}>{comment.content}</Text>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={onLike}
            hitSlop={8}
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
          >
            <Heart
              size={14}
              color={comment.isLikedByMe ? colors.like : colors.textMuted}
              fill={comment.isLikedByMe ? colors.like : 'transparent'}
              strokeWidth={1.8}
            />
            <Text
              style={[
                styles.actionLabel,
                comment.isLikedByMe && { color: colors.like, fontWeight: '600' },
              ]}
            >
              {comment.likeCount > 0 ? comment.likeCount : 'Beğen'}
            </Text>
          </Pressable>

          {!isReply && (
            <Pressable
              onPress={onReply}
              hitSlop={8}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}
            >
              <MessageSquare size={14} color={colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.actionLabel}>
                {comment.replyCount > 0 ? `${comment.replyCount} yanıt` : 'Yanıtla'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  reply: {
    marginLeft: spacing.xxl,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    ...typography.label,
    color: colors.text,
    flex: 1,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  content: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
