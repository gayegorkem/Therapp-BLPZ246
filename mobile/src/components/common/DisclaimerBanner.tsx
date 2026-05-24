import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { DISCLAIMER_SHORT } from '@/constants/disclaimer';

type Props = {
  onPress?: () => void;
};

export function DisclaimerBanner({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <AlertCircle size={18} color={colors.warning} />
      </View>
      <Text style={styles.text} numberOfLines={2}>
        {DISCLAIMER_SHORT}
      </Text>
      {onPress && <ChevronRight size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.85 },
  icon: { marginRight: 2 },
  text: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
});
