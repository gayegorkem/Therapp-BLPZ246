import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { colors, radius, spacing, typography } from '@/theme';
import type { Category } from '@/types/category.types';

type Props = {
  category: Category;
  onPress?: () => void;
};

export function CategoryCard({ category, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: hexToSoft(category.color) }]}>
        <CategoryIcon name={category.icon} color={category.color} size={26} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
      <Text style={styles.count}>
        {category.postCount} {category.postCount === 1 ? 'gönderi' : 'gönderi'}
      </Text>
    </Pressable>
  );
}

function hexToSoft(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return colors.primarySoft;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.78);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 2,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
