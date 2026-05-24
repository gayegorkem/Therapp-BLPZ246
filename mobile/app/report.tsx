import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';
import { useCreateReport } from '@/hooks/useReport';
import { toApiError } from '@/api/client';
import type { ReportReason, ReportTargetType } from '@/api/reports.api';

type ReasonOption = { value: ReportReason; label: string; description?: string };

const REASONS: ReasonOption[] = [
  { value: 0, label: 'Spam', description: 'Tekrarlı veya reklam içeriği' },
  { value: 1, label: 'Taciz / Zorbalık', description: 'Hakaret, tehdit, kişisel saldırı' },
  { value: 2, label: 'Kendine zarar verme', description: 'Acil destek gerektiren içerik' },
  { value: 3, label: 'Yanlış bilgi', description: 'Yanıltıcı tıbbi/sağlık bilgisi' },
  { value: 4, label: 'Nefret söylemi', description: 'Ayrımcı ya da damgalayıcı dil' },
  { value: 5, label: 'Cinsel içerik', description: 'Uygunsuz cinsel içerik' },
  { value: 99, label: 'Diğer', description: 'Açıklama bırak' },
];

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; id?: string }>();
  const targetType = (Number(params.type ?? '0') as ReportTargetType);
  const targetId = params.id ?? '';

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateReport();

  const canSubmit = reason !== null && targetId.length > 0 && !create.isPending;

  const onSubmit = async () => {
    if (!canSubmit || reason === null) return;
    setError(null);
    try {
      await create.mutateAsync({
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      setSent(true);
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      setError(toApiError(e).message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <X size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>İçeriği bildir</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>
            Bu içerik neden topluluk kurallarımıza aykırı? Bildirimin moderatör ekibimize iletilir.
          </Text>

          <View style={styles.list}>
            {REASONS.map((r) => {
              const active = reason === r.value;
              return (
                <Pressable
                  key={r.value}
                  onPress={() => setReason(r.value)}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionLabel, active && { color: colors.primaryDark }]}>
                      {r.label}
                    </Text>
                    {r.description && <Text style={styles.optionDesc}>{r.description}</Text>}
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <Check size={14} color={colors.textOnPrimary} strokeWidth={3} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {reason === 99 && (
            <View style={styles.textareaWrap}>
              <TextInput
                value={description}
                onChangeText={(t) => setDescription(t.length > 500 ? t.slice(0, 500) : t)}
                placeholder="Lütfen açıkla..."
                placeholderTextColor={colors.textMuted}
                multiline
                style={styles.textarea}
                textAlignVertical="top"
              />
              <Text style={styles.helper}>{description.length}/500</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {sent && (
            <View style={styles.sentBox}>
              <Text style={styles.sentText}>
                Bildirimin alındı. Moderasyon ekibi inceleyecek.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={sent ? 'Gönderildi' : 'Bildirimi gönder'}
            onPress={onSubmit}
            loading={create.isPending}
            disabled={!canSubmit || sent}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textareaWrap: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  textarea: {
    ...typography.body,
    color: colors.text,
    minHeight: 100,
    padding: 0,
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  sentBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  sentText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
