import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/constants/theme';
import { useMovieDetail } from '@/features/movies/use-movie-detail';
import {
  buildSeats,
  halls,
  seatPrice,
  showDates,
  type Seat,
  type SeatKind,
} from '@/features/seats/showtimes';

const ROWS = 10;
const SEATS_PER_SIDE = 4;

export default function SeatMapScreen() {
  const { id: rawId, date: dateId, hall: hallId } = useLocalSearchParams<{
    id: string;
    date?: string;
    hall?: string;
  }>();
  const id = Number(rawId);
  const insets = useSafeAreaInsets();
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

  function toggle(seat: Seat) {
    if (seat.kind === 'unavailable') {
      return;
    }

    setSelected((current) =>
      current.includes(seat.id) ? current.filter((item) => item !== seat.id) : [...current, seat.id],
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {date.month} {date.day} · {hall.time} {hall.name}
          </Text>
        </View>
        <View style={styles.spacer} />
      </View>
      <View style={styles.mapWrap}>
        <Text style={styles.screenLabel}>SCREEN</Text>
        <View style={styles.screenCurve} />
        <ScrollView contentContainerStyle={styles.mapContent} showsVerticalScrollIndicator={false}>
          <View style={{ transform: [{ scale }] }}>
            {Array.from({ length: ROWS }, (_, index) => index + 1).map((row) => (
              <View key={row} style={styles.row}>
                <Text style={styles.rowLabel}>{row}</Text>
                <View style={styles.side}>
                  {seats
                    .filter((seat) => seat.row === row && seat.number <= SEATS_PER_SIDE)
                    .map((seat) => (
                      <SeatButton key={seat.id} seat={seat} selected={selected.includes(seat.id)} onPress={() => toggle(seat)} />
                    ))}
                </View>
                <View style={styles.aisle} />
                <View style={styles.side}>
                  {seats
                    .filter((seat) => seat.row === row && seat.number > SEATS_PER_SIDE)
                    .map((seat) => (
                      <SeatButton key={seat.id} seat={seat} selected={selected.includes(seat.id)} onPress={() => toggle(seat)} />
                    ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.zoom}>
          <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" onPress={() => setScale((value) => Math.max(0.8, value - 0.1))} style={styles.zoomButton}>
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" onPress={() => setScale((value) => Math.min(1.4, value + 0.1))} style={styles.zoomButton}>
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.legend}>
          <Legend swatch={colors.seatSelected} label="Selected" />
          <Legend swatch={colors.seatUnavailable} label="Not available" />
          <Legend swatch={colors.seatVip} label={`VIP $${SEAT_PRICE_LABEL.vip}`} />
          <Legend swatch={colors.seatRegular} label={`Regular $${SEAT_PRICE_LABEL.regular}`} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chosen.length === 0 ? (
            <Text style={styles.emptySelection}>Select a seat</Text>
          ) : (
            chosen.map((seat) => (
              <Pressable key={seat.id} accessibilityRole="button" accessibilityLabel={`Remove seat ${seat.number} row ${seat.row}`} onPress={() => toggle(seat)} style={styles.chip}>
                <Text style={styles.chipLabel}>
                  {seat.number} / {seat.row} row
                </Text>
                <Ionicons name="close" size={14} color={colors.tabActive} />
              </Pressable>
            ))
          )}
        </ScrollView>
        <View style={styles.payRow}>
          <View>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.total}>${total}</Text>
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
      <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Preview only</Text>
            <Text style={styles.modalBody}>
              {chosen.length} {chosen.length === 1 ? 'seat' : 'seats'} selected for ${total}. Nothing is booked and no payment is taken.
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

const SEAT_PRICE_LABEL = { regular: 50, vip: 150 };

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
  selected,
  onPress,
}: {
  seat: Seat;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Row ${seat.row} seat ${seat.number}`}
      accessibilityState={{ selected, disabled: seat.kind === 'unavailable' }}
      disabled={seat.kind === 'unavailable'}
      onPress={onPress}
      style={[styles.seat, { backgroundColor: seatColor(seat.kind, selected) }]}
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
    backgroundColor: colors.background,
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
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  spacer: {
    width: 24,
  },
  mapWrap: {
    flex: 1,
  },
  screenLabel: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
  screenCurve: {
    alignSelf: 'center',
    width: '70%',
    height: 12,
    borderTopWidth: 3,
    borderColor: colors.primary,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    marginBottom: spacing.md,
  },
  mapContent: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowLabel: {
    width: 18,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
  },
  side: {
    flexDirection: 'row',
    gap: 6,
  },
  aisle: {
    width: 18,
  },
  seat: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  zoom: {
    position: 'absolute',
    right: spacing.md,
    top: 48,
    gap: spacing.sm,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  chips: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.seatSelected,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipLabel: {
    color: colors.tabActive,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  emptySelection: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalLabel: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  total: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 18,
  },
  pay: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 50,
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
