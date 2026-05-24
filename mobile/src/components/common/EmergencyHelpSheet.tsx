import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Phone, ShieldAlert, X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { EMERGENCY_RESOURCES } from '@/constants/emergencyResources';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function EmergencyHelpSheet({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismiss} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <ShieldAlert size={28} color={colors.warning} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Acil Yardım Kaynakları</Text>
              <Text style={styles.subtitle}>
                Kendine veya çevrendeki birine zarar verme düşüncen varsa lütfen profesyonel
                destek al.
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.list}>
            {EMERGENCY_RESOURCES.map((r) => (
              <Pressable
                key={r.name}
                onPress={() => {
                  if (r.phone) Linking.openURL(`tel:${r.phone}`).catch(() => {});
                  else if (r.url) Linking.openURL(r.url).catch(() => {});
                }}
                style={({ pressed }) => [styles.resource, pressed && styles.pressed]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceName}>{r.name}</Text>
                  <Text style={styles.resourceDesc}>{r.description}</Text>
                </View>
                {r.phone && (
                  <View style={styles.phoneBadge}>
                    <Phone size={14} color={colors.primaryDark} strokeWidth={2} />
                    <Text style={styles.phoneText}>{r.phone}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          <Text style={styles.disclaimer}>
            Therapp tıbbi tavsiye sunmaz. Acil durumlarda lütfen yetkililerle iletişime geçin.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  dismiss: { flex: 1 },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  resourceName: {
    ...typography.label,
    color: colors.text,
    marginBottom: 2,
  },
  resourceDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  phoneText: {
    ...typography.label,
    color: colors.primaryDark,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
