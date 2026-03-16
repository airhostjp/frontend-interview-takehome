import React from 'react'
import useSWR from 'swr'
import { Booking, BookingDetail } from '@/types'

interface BookingDrawerProps {
  booking: Booking | null
  onClose: () => void
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  in_house: 'In House',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
}

export function BookingDrawer({ booking, onClose }: BookingDrawerProps) {
  const { data: detail, isLoading } = useSWR<BookingDetail>(
    booking ? `/api/bookings/${booking.id}` : null,
    fetcher
  )

  if (!booking) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 380,
        height: '100vh',
        background: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Booking Detail</h2>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Always show base data immediately (from parent prop) */}
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Guest</h3>
          <p style={{ fontSize: 15, fontWeight: 500 }}>{booking.guestName}</p>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Room</h3>
          <p style={{ fontSize: 14 }}>{booking.roomUnit.name}</p>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dates</h3>
          <p style={{ fontSize: 14 }}>{booking.checkIn} → {booking.checkOut}</p>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</h3>
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 500,
            background: booking.status === 'in_house' ? '#e3f2fd' : booking.status === 'confirmed' ? '#e8f5e9' : '#f5f5f5',
            color: booking.status === 'in_house' ? '#1565c0' : booking.status === 'confirmed' ? '#2e7d32' : '#555',
          }}>
            {STATUS_LABELS[booking.status] ?? booking.status}
          </span>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount</h3>
          <p style={{ fontSize: 14, fontWeight: 500 }}>SGD {booking.totalAmount.toLocaleString()}</p>
        </section>

        <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 4 }}>
          <h3 style={{ fontSize: 13, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Additional Details
            {isLoading && <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>loading...</span>}
          </h3>

          {detail ? (
            <>
              <Row label="Email" value={detail.guestEmail} />
              <Row label="Phone" value={detail.guestPhone} />
              <Row label="Source" value={detail.source} />
              <Row label="Payment" value={detail.paymentStatus} />
              {detail.specialRequests && <Row label="Requests" value={detail.specialRequests} />}
            </>
          ) : !isLoading ? (
            <p style={{ fontSize: 13, color: '#aaa' }}>No additional details available.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: '#888', width: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  )
}
