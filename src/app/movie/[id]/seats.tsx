import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/constants/theme';
import { formatInTheaters } from '@/features/movies/format-release';
import { useMovieDetail } from '@/features/movies/use-movie-detail';
import { halls, showDates, type Hall, type ShowDate } from '@/features/seats/showtimes';

export default function SeatTimesScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const insets = useSafeAreaInsets();
  const query = useMovieDetail(id);
  const [dateId, setDateId] = useState(showDates[0].id);
  const [hallId, setHallId] = useState(halls[0].id);
  const title = query.data?.movie.title ?? 'Select seats';
  const release = query.data ? formatInTheaters(query.data.movie.releaseDate) : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.spacer} />
      </View>
      {release ? <Text style={styles.release}>{release}</Text> : null}
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
          {showDates.map((date) => (
            <DateChip key={date.id} date={date} selected={date.id === dateId} onPress={() => setDateId(date.id)} />
          ))}
        </ScrollView>
        <View style={styles.halls}>
          {halls.map((hall) => (
            <HallCard key={hall.id} hall={hall} selected={hall.id === hallId} onPress={() => setHallId(hall.id)} />
          ))}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/movie/[id]/map',
              params: { id: String(id), date: dateId, hall: hallId },
            })
          }
          style={styles.select}
        >
          <Text style={styles.selectLabel}>Select Seats</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DateChip({
  date,
  selected,
  onPress,
}: {
  date: ShowDate;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.date, selected && styles.dateSelected]}
    >
      <Text style={[styles.dateDay, selected && styles.dateTextSelected]}>{date.day}</Text>
      <Text style={[styles.dateMonth, selected && styles.dateTextSelected]}>{date.month}</Text>
    </Pressable>
  );
}

function HallCard({
  hall,
  selected,
  onPress,
}: {
  hall: Hall;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.hall, selected && styles.hallSelected]}
    >
      <Text style={styles.hallTime}>{hall.time}</Text>
      <Text style={styles.hallName}>{hall.name}</Text>
      <View style={styles.preview} accessibilityElementsHidden>
        {Array.from({ length: 24 }, (_, index) => (
          <View key={index} style={styles.previewSeat} />
        ))}
      </View>
      <Text style={styles.hallPrice}>
        From {hall.priceFrom}$ or {hall.bonus} bonus
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  spacer: {
    width: 24,
  },
  release: {
    textAlign: 'center',
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  dates: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  date: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelected: {
    backgroundColor: colors.primary,
  },
  dateDay: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  dateMonth: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  dateTextSelected: {
    color: colors.tabActive,
  },
  halls: {
    gap: spacing.md,
  },
  hall: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.background,
  },
  hallSelected: {
    borderColor: colors.primary,
  },
  hallTime: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  hallName: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  preview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: spacing.sm,
    maxWidth: 160,
  },
  previewSeat: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.seatRegular,
  },
  hallPrice: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  select: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectLabel: {
    color: colors.tabActive,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
