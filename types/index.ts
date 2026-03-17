export interface RoomUnit {
  id: string
  name: string
  roomTypeId: string
  roomTypeName: string
}

export type BookingStatus = 'confirmed' | 'pending' | 'in_house' | 'checked_out' | 'cancelled'

export interface Booking {
  id: string
  roomUnit: {
    roomId: string
    name: string
  }
  guestName: string
  checkIn: string
  checkOut: string
  status: BookingStatus
  totalAmount: number
  notes?: string
}

export interface BookingDetail extends Booking {
  guestEmail: string
  guestPhone: string
  source: string
  specialRequests: string
  paymentStatus: string
  createdAt: string
}

export interface Ticket {
  id: string
  subject: string
  guestName: string
  houseId: string
  houseName: string
  unread: boolean
  lastMessage: string
  updatedAt: string
}

export interface AppConfig {
  dateRangeStart: string
  dateRangeEnd: string
  columnWidthPx: number
  visibleColumnsBuffer: number
  bookingHeaderBackground: string
}
