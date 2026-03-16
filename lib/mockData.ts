import { Booking, BookingDetail, RoomUnit, Ticket } from '@/types'

export const ROOM_UNITS: RoomUnit[] = Array.from({ length: 30 }, (_, i) => ({
  id: `room-${i + 1}`,
  name: `Room ${i + 1}`,
  roomTypeId: i < 10 ? 'type-a' : i < 20 ? 'type-b' : 'type-c',
  roomTypeName: i < 10 ? 'Deluxe' : i < 20 ? 'Standard' : 'Suite',
}))

const STATUSES = ['confirmed', 'pending', 'in_house', 'checked_out'] as const

function dateStr(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

export const BOOKINGS: Booking[] = [
  { id: 'b1', roomUnit: { roomId: 'room-1', name: 'Room 1' }, guestName: 'Alice Chen', checkIn: dateStr(-2), checkOut: dateStr(3), status: 'in_house', totalAmount: 1200 },
  { id: 'b2', roomUnit: { roomId: 'room-1', name: 'Room 1' }, guestName: 'Bob Kim', checkIn: dateStr(4), checkOut: dateStr(7), status: 'confirmed', totalAmount: 900 },
  { id: 'b3', roomUnit: { roomId: 'room-2', name: 'Room 2' }, guestName: 'Carol Tang', checkIn: dateStr(0), checkOut: dateStr(1), status: 'in_house', totalAmount: 300, notes: 'Single night' },
  { id: 'b4', roomUnit: { roomId: 'room-2', name: 'Room 2' }, guestName: 'David Wu', checkIn: dateStr(2), checkOut: dateStr(9), status: 'confirmed', totalAmount: 2100 },
  { id: 'b5', roomUnit: { roomId: 'room-3', name: 'Room 3' }, guestName: 'Eva Lim', checkIn: dateStr(-5), checkOut: dateStr(-1), status: 'checked_out', totalAmount: 1600 },
  { id: 'b6', roomUnit: { roomId: 'room-3', name: 'Room 3' }, guestName: 'Frank Ho', checkIn: dateStr(1), checkOut: dateStr(5), status: 'confirmed', totalAmount: 1400 },
  { id: 'b7', roomUnit: { roomId: 'room-4', name: 'Room 4' }, guestName: 'Grace Ng', checkIn: dateStr(-1), checkOut: dateStr(6), status: 'in_house', totalAmount: 2450 },
  { id: 'b8', roomUnit: { roomId: 'room-5', name: 'Room 5' }, guestName: 'Henry Tan', checkIn: dateStr(3), checkOut: dateStr(10), status: 'pending', totalAmount: 1750 },
  { id: 'b9', roomUnit: { roomId: 'room-6', name: 'Room 6' }, guestName: 'Iris Zhou', checkIn: dateStr(0), checkOut: dateStr(14), status: 'confirmed', totalAmount: 4200, notes: 'VIP guest' },
  { id: 'b10', roomUnit: { roomId: 'room-7', name: 'Room 7' }, guestName: 'Jack Lee', checkIn: dateStr(-3), checkOut: dateStr(0), status: 'checked_out', totalAmount: 900 },
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `b${i + 11}`,
    roomUnit: { roomId: `room-${(i % 20) + 8}`, name: `Room ${(i % 20) + 8}` },
    guestName: `Guest ${i + 11}`,
    checkIn: dateStr(i % 7),
    checkOut: dateStr((i % 7) + 3),
    status: STATUSES[i % 4],
    totalAmount: 500 + (i * 80),
  })),
]

export const BOOKING_DETAILS: Record<string, BookingDetail> = Object.fromEntries(
  BOOKINGS.map(b => [
    b.id,
    {
      ...b,
      guestEmail: `${b.guestName.toLowerCase().replace(' ', '.')}@example.com`,
      guestPhone: `+65 9${Math.floor(1000000 + Math.random() * 9000000)}`,
      source: ['Airbnb', 'Booking.com', 'Direct', 'Expedia'][Math.floor(Math.random() * 4)],
      specialRequests: b.notes ?? '',
      paymentStatus: b.status === 'pending' ? 'unpaid' : 'paid',
      createdAt: dateStr(-10),
    },
  ])
)

export const TICKETS: Ticket[] = [
  { id: 't1', subject: 'Early check-in request', guestName: 'Alice Chen', houseId: 'h1', houseName: 'Orchard House', unread: true, lastMessage: 'Can I check in at 10am?', updatedAt: '2026-03-16T08:00:00Z' },
  { id: 't2', subject: 'WiFi password', guestName: 'Bob Kim', houseId: 'h2', houseName: 'Marina Suite', unread: true, lastMessage: 'What is the WiFi password?', updatedAt: '2026-03-16T07:30:00Z' },
  { id: 't3', subject: 'Late checkout', guestName: 'Carol Tang', houseId: 'h1', houseName: 'Orchard House', unread: false, lastMessage: 'Thanks for confirming!', updatedAt: '2026-03-15T18:00:00Z' },
  { id: 't4', subject: 'Broken AC', guestName: 'David Wu', houseId: 'h3', houseName: 'Sentosa Villa', unread: true, lastMessage: 'The AC is not cooling.', updatedAt: '2026-03-15T14:00:00Z' },
  { id: 't5', subject: 'Extra towels', guestName: 'Eva Lim', houseId: 'h2', houseName: 'Marina Suite', unread: false, lastMessage: 'Delivered, thank you!', updatedAt: '2026-03-14T11:00:00Z' },
  { id: 't6', subject: 'Parking instructions', guestName: 'Frank Ho', houseId: 'h1', houseName: 'Orchard House', unread: false, lastMessage: 'Use lot B2.', updatedAt: '2026-03-14T09:00:00Z' },
]
