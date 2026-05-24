import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  Info,
  LogOut,
  ShieldAlert,
  Trash2,
  UserCog,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmergencyHelpSheet } from '@/components/common/EmergencyHelpSheet';
import { colors, radius, spacing, typography } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useMe, useUpdateMe, useDeleteMe } from '@/hooks/useUser';
import { toApiError } from '@/api/client';
import { DISCLAIMER_BODY, DISCLAIMER_TITLE } from '@/constants/disclaimer';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { data: me } = useMe();
  const updateMe = useUpdateMe();
  const deleteMe = useDeleteMe();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  useEffect(() => {
    if (me) {
      setDisplayName(me.displayName);
      setBio(me.bio ?? '');
      setAvatarUrl(me.avatarUrl ?? '');
    }
  }, [me]);

  const onSave = async () => {
    if (displayName.trim().length < 2) {
      setEditError('Görünen ad en az 2 karakter olmalı.');
      return;
    }
    setEditError(null);
    try {
      await updateMe.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setEditError(toApiError(e).message);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Hesabını sil',
      'Bu işlem geri alınamaz. Tüm paylaşımların ve yorumların gizlenir, oturumların kapatılır. Devam etmek istiyor musun?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMe.mutateAsync();
              await logout();
              router.replace('/(auth)/login');
            } catch (e) {
              Alert.alert('Hata', toApiError(e).message);
            }
          },
        },
      ]
    );
  };

  const confirmLogout = () => {
    Alert.alert('Çıkış yap', 'Hesabından çıkış yapmak istediğinden emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Section icon={<UserCog size={18} color={colors.primaryDark} />} title="Profil">
          <Input
            label="Görünen ad"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Adın"
          />
          <Input
            label="Hakkımda"
            value={bio}
            onChangeText={setBio}
            placeholder="Kısa bir tanıtım (opsiyonel)"
            multiline
            numberOfLines={3}
            helper={`${bio.length}/280`}
          />
          <Input
            label="Avatar URL"
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https:// (opsiyonel)"
            autoCapitalize="none"
          />
          {editError && <Text style={styles.errorText}>{editError}</Text>}
          <Button
            label={saved ? 'Kaydedildi' : 'Değişiklikleri kaydet'}
            onPress={onSave}
            loading={updateMe.isPending}
            fullWidth
          />
        </Section>

        <Section icon={<Info size={18} color={colors.primaryDark} />} title="Bilgi & Destek">
          <Row label="Disclaimer'ı tekrar göster" onPress={() => setDisclaimerOpen(true)} />
          <Row
            label="Acil destek kaynakları"
            onPress={() => setEmergencyOpen(true)}
            danger
            icon={<ShieldAlert size={18} color={colors.warning} />}
          />
        </Section>

        <Section icon={<LogOut size={18} color={colors.primaryDark} />} title="Hesap">
          <Row label="Çıkış yap" onPress={confirmLogout} />
          <Row
            label="Hesabımı sil"
            onPress={confirmDelete}
            danger
            icon={<Trash2 size={18} color={colors.danger} />}
          />
        </Section>

        <Text style={styles.versionText}>Therapp v1.0.0</Text>
      </ScrollView>

      <EmergencyHelpSheet visible={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <DisclaimerModal visible={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
    </SafeAreaView>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  label,
  onPress,
  danger,
  icon,
}: {
  label: string;
  onPress?: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function DisclaimerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <View style={styles.disclaimerBackdrop}>
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>{DISCLAIMER_TITLE}</Text>
        <Text style={styles.disclaimerBody}>{DISCLAIMER_BODY}</Text>
        <Button label="Anladım" onPress={onClose} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  disclaimerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  disclaimerCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    width: '100%',
    maxWidth: 480,
  },
  disclaimerTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  disclaimerBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
