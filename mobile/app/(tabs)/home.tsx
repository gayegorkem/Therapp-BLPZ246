import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Sparkles } from 'lucide-react-native';
import { PostCard } from '@/components/post/PostCard';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, radius, spacing, typography } from '@/theme';
import { useFeed } from '@/hooks/usePosts';
import type { FeedSort, PostListItem } from '@/types/post.types';

export default function HomeScreen() {
  const [sort, setSort] = useState<FeedSort>('new');
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed(sort);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Therapp</Text>
          <Sparkles size={22} color={colors.primaryDark} />
        </View>
        <SortToggle value={sort} onChange={setSort} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(p: PostListItem) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.disclaimer}>
            <DisclaimerBanner />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState
              title="Henüz gönderi yok"
              description="İlk paylaşımı sen yap, alttaki + ikonuna dokun."
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
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
    </SafeAreaView>
  );
}

function SortToggle({ value, onChange }: { value: FeedSort; onChange: (v: FeedSort) => void }) {
  return (
    <View style={styles.toggleWrap}>
      {(['new', 'popular'] as const).map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.toggleBtn, active && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
              {opt === 'new' ? 'En Yeni' : 'Popüler'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  toggleLabelActive: {
    color: colors.textOnPrimary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  disclaimer: {
    marginBottom: spacing.md,
  },
});
