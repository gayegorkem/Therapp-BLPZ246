import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, radius, spacing, typography } from '@/theme';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { toApiError } from '@/api/client';
import { DISCLAIMER_SHORT } from '@/constants/disclaimer';

const schema = z.object({
  displayName: z
    .string()
    .min(2, 'Görünen ad en az 2 karakter olmalı.')
    .max(64, 'Görünen ad çok uzun.'),
  username: z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalı.')
    .max(32, 'Kullanıcı adı çok uzun.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Yalnızca harf, rakam ve _ kullanılabilir.'),
  email: z.string().email('Geçerli bir e-posta girin.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı.'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', username: '', email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    setTopError(null);
    try {
      const data = await authApi.register(values);
      await setSession(data);
      router.replace('/(tabs)/home');
    } catch (e) {
      const err = toApiError(e);
      setTopError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Leaf size={28} color={colors.primaryDark} />
        </View>
        <Text style={styles.title}>Therapp'e katıl</Text>
        <Text style={styles.subtitle}>
          Birkaç adımda hesabını oluştur, deneyim paylaşmaya başla.
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="displayName"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Görünen ad"
              placeholder="Örn. Ayşe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.displayName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="username"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Kullanıcı adı"
              placeholder="ornek_kullanici"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.username?.message}
              helper="Sadece harf, rakam ve _ kullanabilirsin."
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="E-posta"
              placeholder="ornek@mail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Şifre"
              placeholder="En az 8 karakter"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        {topError && (
          <View style={styles.topError}>
            <Text style={styles.topErrorText}>{topError}</Text>
          </View>
        )}

        <Text style={styles.disclaimer}>{DISCLAIMER_SHORT}</Text>

        <Button
          label="Hesap oluştur"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          fullWidth
          size="lg"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable hitSlop={8}>
              <Text style={styles.footerLink}>Giriş yap</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'flex-start',
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.lg,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  topError: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  topErrorText: {
    ...typography.caption,
    color: colors.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  footerLink: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
});
