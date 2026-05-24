import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, MessageCircle, MessageSquare, Sparkles } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, typography } from '@/theme';
import { relativeTime } from '@/utils/formatDate';
import type { AppNotification, NotificationType } from '@/types/notification.types';

type Props = {
  notification: AppNotification;
  onPress?: () => void;
};

export function NotificationItem({ notification, onPress }: Props) {
  const meta = describe(notification);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !notification.isRead && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      {notification.actor ? (
        <Avatar
          uri={notification.actor.avatarUrl}
          name={notification.actor.displayName}
          size={40}
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
          <Sparkles size={20} color={colors.primaryDark} />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.text}>
          {notification.actor && (
            <Text style={styles.actor}>{notification.actor.displayName} </Text>
          )}
          <Text style={styles.action}>{meta.text}</Text>
        </Text>
        <Text style={styles.time}>{relativeTime(notification.createdAt)}</Text>
      </View>

      <View style={[styles.iconBadge, { backgroundColor: meta.color + '22' }]}>
        {meta.icon}
      </View>

      {!notification.isRead && <View style={styles.dot} />}
    </Pressable>
  );
}

function describe(n: AppNotification): { text: string; icon: React.ReactNode; color: string } {
  const type = n.type as NotificationType;
  switch (type) {
    case 0:
      return {
        text: 'gönderini beğendi.',
        icon: <Heart size={16} color={colors.like} strokeWidth={2} />,
        color: colors.like,
      };
    case 1:
      return {
        text: 'gönderine yorum yaptı.',
        icon: <MessageCircle size={16} color={colors.primaryDark} strokeWidth={2} />,
        color: colors.primary,
      };
    case 2:
      return {
        text: 'yorumuna yanıt verdi.',
        icon: <MessageSquare size={16} color={colors.primaryDark} strokeWidth={2} />,
        color: colors.primary,
      };
    case 3:
      return {
        text: 'yorumunu beğendi.',
        icon: <Heart size={16} color={colors.like} strokeWidth={2} />,
        color: colors.like,
      };
    case 4:
    default:
      return {
        text: n.message ?? 'Yeni bir bildirim.',
        icon: <Sparkles size={16} color={colors.primaryDark} strokeWidth={2} />,
        color: colors.primary,
      };
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  unread: {
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.85 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
  actor: {
    fontWeight: '600',
  },
  action: {
    color: colors.textSecondary,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
});
