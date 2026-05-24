import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { CategoryCard } from '@/components/category/CategoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, spacing, typography } from '@/theme';
import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/types/category.types';

export default function CategoriesScreen() {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useCategories();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Kategoriler</Text>
        <Text style={styles.subtitle}>İlgilendiğin konuya göre keşfet</Text>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(c: Category) => c.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CategoryCard category={item} onPress={() => router.push(`/category/${item.slug}`)} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState />
          ) : (
            <EmptyState title="Kategori bulunamadı" />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
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
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
});
