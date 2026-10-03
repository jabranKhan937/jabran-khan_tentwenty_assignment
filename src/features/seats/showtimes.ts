export type ShowDate = {
  id: string;
  day: string;
  month: string;
};

export type Hall = {
  id: string;
  time: string;
  name: string;
  shortName: string;
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
  {
    id: 'hall-1',
    time: '12:30',
    name: 'Cinetech + Hall 1',
    shortName: 'Hall 1',
    priceFrom: 50,
    bonus: 2500,
  },
  {
    id: 'hall-2',
    time: '13:30',
    name: 'Cinetech + Hall 2',
    shortName: 'Hall 2',
    priceFrom: 75,
    bonus: 3000,
  },
];

export const SEAT_ROWS = 10;
export const SEATS_PER_SIDE = 8;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function showtimeLabel(date: ShowDate, hall: Hall, releaseDate: string): string {
  const year = releaseDate.slice(0, 4) || '2021';
  const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(
    date.month.slice(0, 3),
  );
  const month = monthIndex >= 0 ? MONTHS[monthIndex] : date.month;

  return `${month} ${date.day}, ${year}  |  ${hall.time} ${hall.shortName}`;
}

export type SeatKind = 'regular' | 'vip' | 'unavailable';

export type Seat = {
  id: string;
  row: number;
  number: number;
  kind: SeatKind;
};

const BLOCKED = new Set([
  '1-6',
  '2-3',
  '2-12',
  '3-8',
  '4-2',
  '4-11',
  '4-15',
  '5-5',
  '5-9',
  '5-14',
  '6-7',
  '6-13',
  '7-1',
  '7-4',
  '7-10',
  '8-6',
  '8-12',
  '8-16',
]);

export function buildSeats(): Seat[] {
  const seats: Seat[] = [];

  for (let row = 1; row <= SEAT_ROWS; row += 1) {
    for (let number = 1; number <= SEATS_PER_SIDE * 2; number += 1) {
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
