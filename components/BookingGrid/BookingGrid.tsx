import React from 'react'
import { Booking, RoomUnit } from '@/types'
import { useVisibleRange } from '@/hooks/useVisibleRange'
import { RoomRow } from './RoomRow'
import {useAppContext} from "@/context/AppContext";

const COLUMN_WIDTH_PX = 48
const TOTAL_DAYS = 30

interface BookingGridProps {
  roomUnits: RoomUnit[]
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
}

function getDayLabels(startDate: string, totalDays: number): string[] {
  return Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
}

export function BookingGrid({ roomUnits, bookings, onBookingClick }: BookingGridProps) {
  const { visibleRange, handleScroll } = useVisibleRange()
  const { config } = useAppContext()

  const startDate = new Date().toISOString().split('T')[0]
  const dayLabels = getDayLabels(startDate, TOTAL_DAYS)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', background: '#fafafa' }}>
        <div style={{ width: 140, minWidth: 140, padding: '8px 12px', fontWeight: 600, fontSize: 13, borderRight: '1px solid #eee', background: config.bookingHeaderBackground }}>
          Room
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            background: config.bookingHeaderBackground
          }}
        >
          {Array.from({ length: visibleRange.endIndex - visibleRange.startIndex + 1 }, (_, i) => {
            const dayIndex = visibleRange.startIndex + i
            if (dayIndex >= TOTAL_DAYS) return null
            return (
              <div
                key={dayIndex}
                style={{
                  width: COLUMN_WIDTH_PX,
                  minWidth: COLUMN_WIDTH_PX,
                  padding: '8px 4px',
                  fontSize: 11,
                  textAlign: 'center',
                  borderRight: '1px solid #eee',
                  color: '#666',
                }}
              >
                {dayLabels[dayIndex]}
              </div>
            )
          })}
        </div>
      </div>

      {/* Scrollable grid body */}
      <div
        style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        <div style={{ minWidth: TOTAL_DAYS * COLUMN_WIDTH_PX + 140 }}>
          {roomUnits.map(room => {
            const roomBookings = bookings.filter(
              b => b.roomUnit.roomId === room.id
            )
            return (
              <RoomRow
                key={room.id}
                rowId={room.id}
                rowName={room.name}
                bookings={roomBookings}
                visibleStartIndex={visibleRange.startIndex}
                visibleEndIndex={visibleRange.endIndex}
                totalDays={TOTAL_DAYS}
                onBookingClick={onBookingClick}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
