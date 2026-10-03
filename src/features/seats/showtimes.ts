export type ShowDate = {
  id: string;
  day: string;
  month: string;
};

export type Hall = {
  id: string;
  time: string;
  name: string;
  priceFrom: number;
  bonus: number;
};

export const showDates: ShowDate[] = [
  { id: 'mar-5', day: '5', month: 'Mar' },
  { id: 'mar-6', day: '6', month: 'Mar' },
  { id: 'mar-7', day: '7', month: 'Mar' },
  { id: 'mar-8', day: '8', month: 'Mar' },
  { id: 'mar-9', day: '9', month: 'Mar' },
];

export const halls: Hall[] = [
  { id: 'hall-1', time: '12:30', name: 'Cinetech + Hall 1', priceFrom: 50, bonus: 2500 },
  { id: 'hall-2', time: '13:30', name: 'Cinetech + Hall 2', priceFrom: 75, bonus: 3000 },
];

export type SeatKind = 'regular' | 'vip' | 'unavailable';

export type Seat = {
  id: string;
  row: number;
  number: number;
  kind: SeatKind;
};

const BLOCKED = new Set(['2-3', '5-7', '7-1', '7-2', '4-8']);

export function buildSeats(): Seat[] {
  const seats: Seat[] = [];

  for (let row = 1; row <= 10; row += 1) {
    for (let number = 1; number <= 8; number += 1) {
      const id = `${row}-${number}`;
      let kind: SeatKind = 'regular';

      if (BLOCKED.has(id)) {
        kind = 'unavailable';
      } else if (row >= 9) {
        kind = 'vip';
      }

      seats.push({ id, row, number, kind });
    }
  }

  return seats;
}

export const SEAT_PRICE = {
  regular: 50,
  vip: 150,
} as const;

export function seatPrice(kind: SeatKind): number {
  if (kind === 'vip') {
    return SEAT_PRICE.vip;
  }
  if (kind === 'regular') {
    return SEAT_PRICE.regular;
  }
  return 0;
}
