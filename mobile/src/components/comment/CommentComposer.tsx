import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Send, X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  placeholder?: string;
  replyingTo?: string | null;
  onCancelReply?: () => void;
  submitting?: boolean;
  onSubmit: (content: string) => Promise<void> | void;
};

const MAX_LEN = 1000;

export function CommentComposer({
  placeholder = 'Yorumunu yaz...',
  replyingTo,
  onCancelReply,
  submitting = false,
  onSubmit,
}: Props) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();
  const canSubmit = trimmed.length >= 2 && trimmed.length <= MAX_LEN && !submitting;

  const handle = async () => {
    if (!canSubmit) return;
    await onSubmit(trimmed);
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      {replyingTo && (
        <View style={styles.replyBar}>
          <Text style={styles.replyText} numberOfLines={1}>
            {replyingTo} kullanıcısına yanıt veriyorsun
          </Text>
          <Pressable onPress={onCancelReply} hitSlop={8}>
            <X size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.length > MAX_LEN ? t.slice(0, MAX_LEN) : t)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.input}
        />
        <Pressable
          onPress={handle}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.sendBtn,
            !canSubmit && styles.sendBtnDisabled,
            pressed && canSubmit && { opacity: 0.85 },
          ]}
        >
          <Send size={18} color={canSubmit ? colors.textOnPrimary : colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.sm,
  },
  replyText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.divider,
  },
});
