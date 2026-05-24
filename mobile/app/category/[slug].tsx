import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { PostCard } from '@/components/post/PostCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, radius, spacing, typography } from '@/theme';
import { useCategory } from '@/hooks/useCategories';
import { useCategoryFeed } from '@/hooks/usePosts';
import type { FeedSort, PostListItem } from '@/types/post.types';

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [sort, setSort] = useState<FeedSort>('new');

  const { data: category } = useCategory(slug);
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCategoryFeed(slug, sort);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(p: PostListItem) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.hero}>
            {category && (
              <View style={[styles.iconWrap, { backgroundColor: hexToSoft(category.color) }]}>
                <CategoryIcon name={category.icon} color={category.color} size={32} />
              </View>
            )}
            <Text style={styles.title}>{category?.name ?? 'Kategori'}</Text>
            {category?.description && (
              <Text style={styles.description}>{category.description}</Text>
            )}
            <View style={styles.toggleWrap}>
              {(['new', 'popular'] as const).map((opt) => {
                const active = sort === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setSort(opt)}
                    style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
                      {opt === 'new' ? 'En Yeni' : 'Popüler'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState
              title="Bu kategoride henüz gönderi yok"
              description="İlk paylaşımı sen yap."
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
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function hexToSoft(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return colors.primarySoft;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.8);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  hero: {
    paddingVertical: spacing.lg,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
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
});
