import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Settings as SettingsIcon } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { PostCard } from '@/components/post/PostCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, radius, spacing, typography } from '@/theme';
import { useMe } from '@/hooks/useUser';
import { useMyPosts, useMySaved } from '@/hooks/usePosts';
import type { PostListItem } from '@/types/post.types';

type Tab = 'posts' | 'saved';

export default function ProfileScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('posts');
  const { data: me, isLoading: meLoading } = useMe();

  const postsQuery = useMyPosts();
  const savedQuery = useMySaved();
  const active = tab === 'posts' ? postsQuery : savedQuery;

  const items = active.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <FlatList
        data={items}
        keyExtractor={(p: PostListItem) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.topRow}>
              <Text style={styles.title}>Profil</Text>
              <Pressable
                onPress={() => router.push('/settings')}
                hitSlop={8}
                style={styles.iconBtn}
              >
                <SettingsIcon size={22} color={colors.text} />
              </Pressable>
            </View>

            {meLoading || !me ? (
              <LoadingState size="small" />
            ) : (
              <View style={styles.profileCard}>
                <Avatar uri={me.avatarUrl} name={me.displayName} size={72} />
                <Text style={styles.displayName}>{me.displayName}</Text>
                <Text style={styles.username}>@{me.username}</Text>
                {me.bio ? <Text style={styles.bio}>{me.bio}</Text> : null}

                <View style={styles.statsRow}>
                  <Stat value={me.postCount} label="Gönderi" />
                  <View style={styles.statDivider} />
                  <Stat value={me.savedCount} label="Kaydedilen" />
                </View>
              </View>
            )}

            <View style={styles.tabsRow}>
              <TabBtn label="Paylaşımlarım" active={tab === 'posts'} onPress={() => setTab('posts')} />
              <TabBtn label="Kaydettiklerim" active={tab === 'saved'} onPress={() => setTab('saved')} />
            </View>
          </View>
        }
        ListEmptyComponent={
          active.isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState
              title={tab === 'posts' ? 'Henüz paylaşımın yok' : 'Henüz kaydettiğin gönderi yok'}
              description={
                tab === 'posts'
                  ? '+ ikonuna dokunup ilk paylaşımını yap.'
                  : 'Beğendiğin gönderileri kaydederek burada saklayabilirsin.'
              }
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={active.isRefetching && !active.isFetchingNextPage}
            onRefresh={active.refetch}
            tintColor={colors.primary}
          />
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (active.hasNextPage && !active.isFetchingNextPage) active.fetchNextPage();
        }}
        ListFooterComponent={
          active.isFetchingNextPage ? (
            <View style={{ paddingVertical: spacing.lg }}>
              <LoadingState size="small" />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabBtnLabel, active && styles.tabBtnLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  headerBlock: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  displayName: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: spacing.md,
  },
  username: {
    ...typography.body,
    color: colors.textMuted,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.subtitle,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabBtnLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  tabBtnLabelActive: {
    color: colors.textOnPrimary,
  },
});
