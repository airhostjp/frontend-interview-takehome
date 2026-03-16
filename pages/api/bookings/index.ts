import type { NextApiRequest, NextApiResponse } from 'next'
import { BOOKINGS } from '@/lib/mockData'
import { Booking } from '@/types'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Booking[]>
) {
  // Simulate network delay
  setTimeout(() => {
    res.status(200).json(BOOKINGS)
  }, 300)
}
