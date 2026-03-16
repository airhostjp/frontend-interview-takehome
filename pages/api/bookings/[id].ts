import type { NextApiRequest, NextApiResponse } from 'next'
import { BOOKING_DETAILS } from '@/lib/mockData'
import { BookingDetail } from '@/types'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookingDetail | { error: string }>
) {
  const { id } = req.query
  const detail = BOOKING_DETAILS[id as string]

  if (!detail) {
    return res.status(404).json({ error: 'Booking not found' })
  }

  // Simulate network delay
  setTimeout(() => {
    res.status(200).json(detail)
  }, 300)
}
