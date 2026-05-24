import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';
import { DISCLAIMER_BODY, DISCLAIMER_TITLE } from '@/constants/disclaimer';
import { useUiStore } from '@/store/uiStore';

type Slide = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const slides: Slide[] = [
  {
    icon: <Heart size={56} color={colors.primary} strokeWidth={1.5} />,
    title: 'Hislerini paylaşmak iyi gelir',
    body:
      'Therapp, aynı şeyleri yaşayan insanlarla deneyimlerini paylaşabileceğin güvenli ve sakin bir alandır.',
  },
  {
    icon: <MessageCircle size={56} color={colors.primary} strokeWidth={1.5} />,
    title: 'Yalnız değilsin',
    body:
      'Anksiyete, depresyon, yalnızlık, stres — kategorilere göre konuşmalara katıl, başkalarının hikâyelerinden güç al.',
  },
  {
    icon: <ShieldCheck size={56} color={colors.primary} strokeWidth={1.5} />,
    title: 'Sınırları bilelim',
    body: DISCLAIMER_BODY,
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const setOnboarded = useUiStore((s) => s.setOnboarded);

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  const next = async () => {
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    await setOnboarded(true);
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.iconWrap}>{slide.icon}</View>
        {isLast && <Text style={styles.eyebrow}>{DISCLAIMER_TITLE}</Text>}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          label={isLast ? 'Anladım, devam et' : 'Devam'}
          onPress={next}
          fullWidth
          size="lg"
        />
        {!isLast && (
          <Pressable onPress={() => setStep(slides.length - 1)} style={styles.skip}>
            <Text style={styles.skipText}>Atla</Text>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  actions: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  skip: {
    alignSelf: 'center',
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
