import React, { useMemo } from 'react'
import { Booking, BookingStatus } from '@/types'
import { useAppContext } from '@/context/AppContext'

const COLUMN_WIDTH_PX = 48

interface RoomRowProps {
  rowId: string
  rowName: string
  bookings: Booking[]
  visibleStartIndex: number
  visibleEndIndex: number
  totalDays: number
  onBookingClick: (booking: Booking) => void
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: '#4CAF50',
  pending: '#FF9800',
  in_house: '#2196F3',
  checked_out: '#9E9E9E',
  cancelled: '#F44336',
}

export function RoomRow({
  rowId,
  rowName,
  bookings,
  visibleStartIndex,
  visibleEndIndex,
  totalDays,
  onBookingClick,
}: RoomRowProps) {
  console.log('render', rowId)

  const { hoveredCell, setHoveredCell, config } = useAppContext()

  const visibleBookings = useMemo(() => {
    return bookings.filter(b => {
      const startDay = Math.floor(
        (new Date(b.checkIn).getTime() - new Date(config.dateRangeStart).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const endDay = Math.floor(
        (new Date(b.checkOut).getTime() - new Date(config.dateRangeStart).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      return endDay >= visibleStartIndex && startDay <= visibleEndIndex
    }).map(b => {
      const startDay = Math.floor(
        (new Date(b.checkIn).getTime() - new Date(config.dateRangeStart).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const endDay = Math.floor(
        (new Date(b.checkOut).getTime() - new Date(config.dateRangeStart).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      const color = getBookingStatus(b.status)
      return { booking: b, startDay, endDay, color }
    })
  }, [bookings, visibleStartIndex, visibleEndIndex, config.dateRangeStart])

  const getBookingStatus = (status: BookingStatus): string => {
    return STATUS_COLORS[status] ?? '#ccc'
  }

  const isHovered = hoveredCell?.rowId === rowId

  return (
    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', background: isHovered ? '#f0f7ff' : 'white' }}>
      <div style={{
        width: 140,
        minWidth: 140,
        padding: '8px 12px',
        fontWeight: 500,
        fontSize: 13,
        borderRight: '1px solid #eee',
        background: 'white',
        zIndex: 1,
      }}>
        {rowName}
      </div>

      <div style={{ position: 'relative', height: 40, flex: 1 }}>
        {/* Day cell backgrounds */}
        {Array.from({ length: visibleEndIndex - visibleStartIndex + 1 }, (_, i) => {
          const dayIndex = visibleStartIndex + i
          const isCellHovered = hoveredCell?.rowId === rowId && hoveredCell?.dayIndex === dayIndex
          return (
            <div
              key={dayIndex}
              style={{
                position: 'absolute',
                left: (dayIndex - visibleStartIndex) * COLUMN_WIDTH_PX,
                width: COLUMN_WIDTH_PX,
                height: 40,
                background: isCellHovered ? '#e3f2fd' : 'transparent',
                borderRight: '1px solid #f0f0f0',
                cursor: 'default',
              }}
              onMouseEnter={() => setHoveredCell({ rowId, dayIndex })}
              onMouseLeave={() => setHoveredCell(null)}
            />
          )
        })}

        {/* Booking bars */}
        {visibleBookings.map(({ booking, startDay, endDay, color }) => {
          const left = Math.max(0, (startDay - visibleStartIndex) * COLUMN_WIDTH_PX)
          const width = (Math.min(endDay, visibleEndIndex) - Math.max(startDay, visibleStartIndex) + 1) * COLUMN_WIDTH_PX
          return (
            <div
              key={booking.id}
              title={`${booking.guestName} (${booking.status})`}
              onClick={() => onBookingClick(booking)}
              style={{
                position: 'absolute',
                left,
                width: width - 2,
                height: 28,
                top: 6,
                background: color,
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 6,
                fontSize: 11,
                color: 'white',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}
            >
              {booking.guestName}
            </div>
          )
        })}
      </div>
    </div>
  )
}
