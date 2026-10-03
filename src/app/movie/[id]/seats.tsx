import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/constants/theme';
import { formatInTheaters } from '@/features/movies/format-release';
import { useMovieDetail } from '@/features/movies/use-movie-detail';
import { useOrientation } from '@/hooks/use-orientation';
import {
  buildSeats,
  halls,
  SEATS_PER_SIDE,
  showDates,
  type Hall,
  type SeatKind,
  type ShowDate,
} from '@/features/seats/showtimes';

export default function SeatTimesScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const insets = useSafeAreaInsets();
  const { width, isLandscape } = useOrientation();
  const query = useMovieDetail(id);
  const [dateId, setDateId] = useState(showDates[0].id);
  const [hallId, setHallId] = useState(halls[0].id);
  const title = query.data?.movie.title ?? 'Select seats';
  const release = query.data ? formatInTheaters(query.data.movie.releaseDate) : null;
  const contentWidth = width - insets.left - insets.right;
  const cardWidth = isLandscape ? Math.min(contentWidth * 0.42, 340) : Math.min(contentWidth * 0.72, 280);

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.spacer} />
      </View>
      {release ? <Text style={styles.release}>{release}</Text> : null}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
          {showDates.map((date) => (
            <DateChip key={date.id} date={date} selected={date.id === dateId} onPress={() => setDateId(date.id)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.halls}>
          {halls.map((hall) => (
            <HallCard
              key={hall.id}
              hall={hall}
              selected={hall.id === hallId}
              width={cardWidth}
              onPress={() => setHallId(hall.id)}
            />
          ))}
        </ScrollView>
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
      <Text style={[styles.dateLabel, selected && styles.dateLabelSelected]}>
        {date.day} {date.month}
      </Text>
    </Pressable>
  );
}

function HallCard({
  hall,
  selected,
  width,
  onPress,
}: {
  hall: Hall;
  selected: boolean;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={{ width }}>
      <View style={styles.hallHeading}>
        <Text style={styles.hallTime}>{hall.time}</Text>
        <Text style={styles.hallName}>{hall.name}</Text>
      </View>
      <View style={[styles.preview, selected && styles.previewSelected]}>
        <MiniSeatMap />
      </View>
      <Text style={styles.hallPrice}>
        From <Text style={styles.hallPriceStrong}>{hall.priceFrom}$</Text> or{' '}
        <Text style={styles.hallPriceStrong}>{hall.bonus} bonus</Text>
      </Text>
    </Pressable>
  );
}

function MiniSeatMap() {
  const seats = useMemo(() => buildSeats(), []);

  return (
    <View style={styles.mini}>
      {Array.from({ length: 10 }, (_, index) => index + 1).map((row) => (
        <View key={row} style={[styles.miniRow, { paddingHorizontal: (10 - row) * 2 }]}>
          <View style={styles.miniSide}>
            {seats
              .filter((seat) => seat.row === row && seat.number <= SEATS_PER_SIDE)
              .map((seat) => (
                <View
                  key={seat.id}
                  style={[styles.miniSeat, { backgroundColor: miniColor(seat.kind, seat.id === '3-4') }]}
                />
              ))}
          </View>
          <View style={styles.miniAisle} />
          <View style={styles.miniSide}>
            {seats
              .filter((seat) => seat.row === row && seat.number > SEATS_PER_SIDE)
              .map((seat) => (
                <View key={seat.id} style={[styles.miniSeat, { backgroundColor: miniColor(seat.kind, false) }]} />
              ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function miniColor(kind: SeatKind, selected: boolean): string {
  if (selected) {
    return colors.seatSelected;
  }
  if (kind === 'vip') {
    return colors.seatVip;
  }
  if (kind === 'unavailable') {
    return colors.seatUnavailable;
  }
  return colors.seatRegular;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  spacer: {
    width: 22,
  },
  release: {
    textAlign: 'center',
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  content: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  section: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
    paddingHorizontal: spacing.lg,
  },
  dates: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  date: {
    borderRadius: 10,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dateSelected: {
    backgroundColor: colors.primary,
  },
  dateLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  dateLabelSelected: {
    color: colors.tabActive,
  },
  halls: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  hallHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
    flexShrink: 1,
  },
  preview: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8ED',
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewSelected: {
    borderColor: colors.primary,
  },
  mini: {
    gap: 2,
    alignItems: 'center',
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniSide: {
    flexDirection: 'row',
    gap: 2,
  },
  miniAisle: {
    width: 8,
  },
  miniSeat: {
    width: 4,
    height: 4,
    borderRadius: 1,
  },
  hallPrice: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  hallPriceStrong: {
    fontFamily: fonts.semibold,
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
