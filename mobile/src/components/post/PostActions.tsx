import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bookmark, Heart, MessageCircle } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';

type Props = {
  likeCount: number;
  isLiked: boolean;
  onLike: () => void;

  commentCount: number;
  onComment?: () => void;

  saveCount: number;
  isSaved: boolean;
  onSave: () => void;
};

export function PostActions({
  likeCount,
  isLiked,
  onLike,
  commentCount,
  onComment,
  saveCount,
  isSaved,
  onSave,
}: Props) {
  return (
    <View style={styles.row}>
      <Action
        icon={
          <Heart
            size={20}
            color={isLiked ? colors.like : colors.textMuted}
            fill={isLiked ? colors.like : 'transparent'}
            strokeWidth={1.8}
          />
        }
        count={likeCount}
        active={isLiked}
        activeColor={colors.like}
        onPress={onLike}
      />
      <Action
        icon={<MessageCircle size={20} color={colors.textMuted} strokeWidth={1.8} />}
        count={commentCount}
        onPress={onComment}
      />
      <View style={{ flex: 1 }} />
      <Action
        icon={
          <Bookmark
            size={20}
            color={isSaved ? colors.save : colors.textMuted}
            fill={isSaved ? colors.save : 'transparent'}
            strokeWidth={1.8}
          />
        }
        count={saveCount}
        active={isSaved}
        activeColor={colors.save}
        onPress={onSave}
      />
    </View>
  );
}

function Action({
  icon,
  count,
  onPress,
  active,
  activeColor,
}: {
  icon: React.ReactNode;
  count: number;
  onPress?: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
    >
      {icon}
      <Text
        style={[
          styles.count,
          active && activeColor ? { color: activeColor, fontWeight: '600' } : null,
        ]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '500',
    minWidth: 16,
  },
});
