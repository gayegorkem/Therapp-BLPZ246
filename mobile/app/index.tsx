import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { LoadingState } from '@/components/ui/LoadingState';

// Bootstrap is handled in _layout.tsx (AuthGate). This screen renders briefly
// while the router resolves the initial redirect.
export default function Index() {
  return (
    <View style={styles.container}>
      <LoadingState />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
