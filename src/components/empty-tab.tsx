import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, fonts, spacing } from '@/constants/theme';

type EmptyTabProps = {
  title: string;
};

export function EmptyTab({ title }: EmptyTabProps) {
  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 18,
  },
});
