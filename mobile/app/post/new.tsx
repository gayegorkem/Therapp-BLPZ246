import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, radius, spacing, typography } from '@/theme';
import { useCategories } from '@/hooks/useCategories';
import { useCreatePost } from '@/hooks/usePosts';
import { toApiError } from '@/api/client';

const TITLE_MAX = 150;
const CONTENT_MAX = 5000;
const CONTENT_MIN = 10;

export default function NewPostScreen() {
  const router = useRouter();
  const { data: categories, isLoading: catsLoading } = useCategories();
  const createMutation = useCreatePost();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const titleTrim = title.trim();
  const contentTrim = content.trim();
  const canSubmit =
    !!categoryId &&
    titleTrim.length >= 3 &&
    contentTrim.length >= CONTENT_MIN &&
    !createMutation.isPending;

  const onSubmit = async () => {
    if (!canSubmit || !categoryId) return;
    setTopError(null);
    try {
      const post = await createMutation.mutateAsync({
        categoryId,
        title: titleTrim,
        content: contentTrim,
        isAnonymous,
      });
      router.replace(`/post/${post.id}`);
    } catch (e) {
      setTopError(toApiError(e).message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <X size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Paylaş</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Kategori</Text>
          {catsLoading ? (
            <LoadingState size="small" />
          ) : (
            <View style={styles.chips}>
              {categories?.map((c) => {
                const active = c.id === categoryId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={{ height: spacing.lg }} />

          <Input
            label="Başlık"
            placeholder="Kısa bir başlık yaz"
            value={title}
            onChangeText={(t) => setTitle(t.length > TITLE_MAX ? t.slice(0, TITLE_MAX) : t)}
            helper={`${titleTrim.length}/${TITLE_MAX}`}
          />

          <View style={{ height: spacing.lg }} />

          <Text style={styles.sectionLabel}>İçerik</Text>
          <View style={styles.textareaWrap}>
            <TextInput
              value={content}
              onChangeText={(t) => setContent(t.length > CONTENT_MAX ? t.slice(0, CONTENT_MAX) : t)}
              placeholder="Bugün nasıl hissediyorsun? Yaşadıklarını paylaşmak iyi gelir..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={styles.textarea}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.helper}>
            {contentTrim.length}/{CONTENT_MAX} {contentTrim.length < CONTENT_MIN ? `(en az ${CONTENT_MIN})` : ''}
          </Text>

          <View style={{ height: spacing.lg }} />

          <View style={styles.anonRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.anonTitle}>Anonim paylaş</Text>
              <Text style={styles.anonDesc}>İsmin görünmez, sadece "Anonim" yazar.</Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: colors.divider, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {topError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{topError}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Paylaş"
            onPress={onSubmit}
            loading={createMutation.isPending}
            disabled={!canSubmit}
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
    paddingBottom: spacing.xxxl,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.primaryDark,
  },
  textareaWrap: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    minHeight: 180,
  },
  textarea: {
    ...typography.body,
    color: colors.text,
    minHeight: 160,
    padding: 0,
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  anonTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  anonDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  errorBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
});
