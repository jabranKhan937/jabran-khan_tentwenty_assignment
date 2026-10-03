import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, fonts, spacing } from '@/constants/theme';

export default function WatchScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Watch</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 18,
  },
});
