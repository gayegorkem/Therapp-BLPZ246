import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
};

export function Avatar({ uri, name, size = 40 }: Props) {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();
  const fontSize = Math.round(size * 0.42);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primarySoft,
  },
  fallback: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  initial: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
