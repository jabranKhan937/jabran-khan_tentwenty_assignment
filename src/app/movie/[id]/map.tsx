import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/constants/theme';
import { useMovieDetail } from '@/features/movies/use-movie-detail';
import { useOrientation } from '@/hooks/use-orientation';
import {
  buildSeats,
  halls,
  SEAT_ROWS,
  SEATS_PER_SIDE,
  seatPrice,
  showDates,
  showtimeLabel,
  type Seat,
  type SeatKind,
} from '@/features/seats/showtimes';

export default function SeatMapScreen() {
  const { id: rawId, date: dateId, hall: hallId } = useLocalSearchParams<{
    id: string;
    date?: string;
    hall?: string;
  }>();
  const id = Number(rawId);
  const insets = useSafeAreaInsets();
  const { width, isLandscape } = useOrientation();
  const query = useMovieDetail(id);
  const seats = useMemo(() => buildSeats(), []);
  const [selected, setSelected] = useState<string[]>(['3-4']);
  const [scale, setScale] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);

  const date = showDates.find((item) => item.id === dateId) ?? showDates[0];
  const hall = halls.find((item) => item.id === hallId) ?? halls[0];
  const title = query.data?.movie.title ?? 'Select seats';
  const chosen = seats.filter((seat) => selected.includes(seat.id));
  const total = chosen.reduce((sum, seat) => sum + seatPrice(seat.kind), 0);
  const mapWidth = isLandscape ? width * 0.58 : width - insets.left - insets.right;
  const seatSize = Math.max(
    8,
    Math.min(15, Math.floor((mapWidth - 70) / (SEATS_PER_SIDE * 2) - 3)),
  );

  function toggle(seat: Seat) {
    if (seat.kind === 'unavailable') {
      return;
    }

    setSelected((current) =>
      current.includes(seat.id) ? current.filter((item) => item !== seat.id) : [...current, seat.id],
    );
  }

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
        <View style={styles.heading}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{showtimeLabel(date, hall, query.data?.movie.releaseDate ?? '')}</Text>
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={isLandscape ? styles.landscape : styles.stacked}>
      <View style={styles.mapWrap}>
        <View style={styles.screenCurve} />
        <Text style={styles.screenLabel}>SCREEN</Text>
        <ScrollView contentContainerStyle={styles.mapContent} showsVerticalScrollIndicator={false}>
          <View style={{ transform: [{ scale }] }}>
            {Array.from({ length: SEAT_ROWS }, (_, index) => index + 1).map((row) => (
              <View key={row} style={styles.row}>
                <Text style={styles.rowLabel}>{row}</Text>
                <View style={styles.side}>
                  {seats
                    .filter((seat) => seat.row === row && seat.number <= SEATS_PER_SIDE)
                    .map((seat) => (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        size={seatSize}
                        selected={selected.includes(seat.id)}
                        onPress={() => toggle(seat)}
                      />
                    ))}
                </View>
                <View style={styles.aisle} />
                <View style={styles.side}>
                  {seats
                    .filter((seat) => seat.row === row && seat.number > SEATS_PER_SIDE)
                    .map((seat) => (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        size={seatSize}
                        selected={selected.includes(seat.id)}
                        onPress={() => toggle(seat)}
                      />
                    ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.zoom}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
            onPress={() => setScale((value) => Math.min(1.35, Number((value + 0.08).toFixed(2))))}
            style={styles.zoomButton}
          >
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
            onPress={() => setScale((value) => Math.max(0.85, Number((value - 0.08).toFixed(2))))}
            style={styles.zoomButton}
          >
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <View
        style={[
          styles.footer,
          isLandscape && styles.footerLandscape,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <View style={styles.legend}>
          <Legend swatch={colors.seatSelected} label="Selected" />
          <Legend swatch={colors.seatUnavailable} label="Not available" />
          <Legend swatch={colors.seatVip} label="VIP (150$)" />
          <Legend swatch={colors.seatRegular} label="Regular (50$)" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chosen.map((seat) => (
            <Pressable
              key={seat.id}
              accessibilityRole="button"
              accessibilityLabel={`Remove seat ${seat.number} row ${seat.row}`}
              onPress={() => toggle(seat)}
              style={styles.chip}
            >
              <Text style={styles.chipLabel}>
                {seat.number} / {seat.row} row
              </Text>
              <Ionicons name="close" size={14} color={colors.text} />
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.payRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.total}>$ {total}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={chosen.length === 0}
            onPress={() => setPreviewOpen(true)}
            style={[styles.pay, chosen.length === 0 && styles.payDisabled]}
          >
            <Text style={styles.payLabel}>Proceed to pay</Text>
          </Pressable>
        </View>
      </View>
      </View>
      <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Preview only</Text>
            <Text style={styles.modalBody}>
              {chosen.length} {chosen.length === 1 ? 'seat' : 'seats'} selected for ${total}. Nothing is booked and no
              payment is taken.
            </Text>
            <Pressable accessibilityRole="button" onPress={() => setPreviewOpen(false)} style={styles.modalButton}>
              <Text style={styles.payLabel}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function seatColor(kind: SeatKind, selected: boolean): string {
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

function SeatButton({
  seat,
  size,
  selected,
  onPress,
}: {
  seat: Seat;
  size: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Row ${seat.row} seat ${seat.number}`}
      accessibilityState={{ selected, disabled: seat.kind === 'unavailable' }}
      disabled={seat.kind === 'unavailable'}
      hitSlop={2}
      onPress={onPress}
      style={[styles.seat, { width: size, height: size, backgroundColor: seatColor(seat.kind, selected) }]}
    />
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: swatch }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
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
    paddingBottom: spacing.sm,
  },
  heading: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  subtitle: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  spacer: {
    width: 22,
  },
  stacked: {
    flex: 1,
  },
  landscape: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  mapWrap: {
    flex: 1,
  },
  screenCurve: {
    alignSelf: 'center',
    width: '72%',
    height: 18,
    borderTopWidth: 2,
    borderColor: colors.primary,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    marginTop: spacing.sm,
  },
  screenLabel: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: -10,
    marginBottom: spacing.md,
  },
  mapContent: {
    alignItems: 'center',
    paddingBottom: 56,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rowLabel: {
    width: 16,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 9,
    textAlign: 'center',
  },
  side: {
    flexDirection: 'row',
    gap: 3,
  },
  aisle: {
    width: 14,
  },
  seat: {
    borderRadius: 2,
  },
  zoom: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  footer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  footerLandscape: {
    width: 320,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    justifyContent: 'flex-end',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  legendItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  chips: {
    gap: spacing.sm,
    minHeight: 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  totalBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    minWidth: 108,
  },
  totalLabel: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  total: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  pay: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payDisabled: {
    opacity: 0.5,
  },
  payLabel: {
    color: colors.tabActive,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 18,
  },
  modalBody: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
