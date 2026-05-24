import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Bell, CheckCheck } from 'lucide-react-native';
import { NotificationItem } from '@/components/notification/NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, spacing, typography } from '@/theme';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/useNotifications';
import type { AppNotification } from '@/types/notification.types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const { data: unread = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  const handleTap = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.postId) router.push(`/post/${n.postId}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Bildirimler</Text>
        {unread > 0 && (
          <Pressable
            onPress={() => markAllRead.mutate()}
            hitSlop={8}
            style={({ pressed }) => [styles.markAllBtn, pressed && { opacity: 0.7 }]}
          >
            <CheckCheck size={16} color={colors.primaryDark} />
            <Text style={styles.markAllText}>Tümünü okundu işaretle</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => handleTap(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={<Bell size={48} color={colors.textMuted} strokeWidth={1.4} />}
              title="Henüz bildirimin yok"
              description="Birisi gönderine etkileşim verdiğinde burada görürsün."
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={refetch} tintColor={colors.primary} />
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  markAllText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
});
