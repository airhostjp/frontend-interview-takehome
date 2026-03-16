import type { NextApiRequest, NextApiResponse } from 'next'
import { TICKETS } from '@/lib/mockData'
import { Ticket } from '@/types'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ticket[]>
) {
  setTimeout(() => {
    res.status(200).json(TICKETS)
  }, 200)
}
