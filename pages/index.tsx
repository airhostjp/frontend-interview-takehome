import React, { useState } from 'react'
import type { NextPage } from 'next'
import useSWR from 'swr'
import { Booking, RoomUnit } from '@/types'
import { BookingGrid } from '@/components/BookingGrid/BookingGrid'
import { BookingDrawer } from '@/components/BookingDrawer/BookingDrawer'
import { ROOM_UNITS } from '@/lib/mockData'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const BookingsPage: NextPage = () => {
  const { data: bookings, isLoading } = useSWR<Booking[]>('/api/bookings', fetcher)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Page header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #e0e0e0',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Booking Calendar</h1>
        {isLoading && <span style={{ fontSize: 13, color: '#888' }}>Loading...</span>}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
        {bookings ? (
          <BookingGrid
            roomUnits={ROOM_UNITS}
            bookings={bookings}
            onBookingClick={setSelectedBooking}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
            {isLoading ? 'Loading bookings...' : 'No bookings found.'}
          </div>
        )}
      </div>

      {/* Booking detail drawer */}
      {selectedBooking && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedBooking(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.2)',
              zIndex: 99,
            }}
          />
          <BookingDrawer
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        </>
      )}
    </div>
  )
}

export default BookingsPage
