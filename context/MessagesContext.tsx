import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter } from 'next/router'
import { Ticket } from '@/types'

interface House {
  id: string
  name: string
}

const HOUSES: House[] = [
  { id: 'h1', name: 'Orchard House' },
  { id: 'h2', name: 'Marina Suite' },
  { id: 'h3', name: 'Sentosa Villa' },
]

interface MessagesContextValue {
  currentHouse: House | null
  setCurrentHouse: (house: House | null) => void
  activeTicketId: string | null
  setActiveTicketId: (id: string | null) => void
  unreadCount: number
  setUnreadCount: (n: number) => void
}

const MessagesContext = createContext<MessagesContextValue | null>(null)

export function MessagesProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [currentHouse, setCurrentHouse] = useState<House | null>(null)
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const houseId = router.query.houseId as string
    const ticketId = router.query.ticketId as string

    if (ticketId) {
      setActiveTicketId(ticketId)
    }

    if (houseId) {
      const house = HOUSES.find(h => h.id === houseId)
      if (house) {
        setCurrentHouse(house)
      }
    }
  }, [router.query])

  return (
    <MessagesContext.Provider
      value={{
        currentHouse,
        setCurrentHouse,
        activeTicketId,
        setActiveTicketId,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessagesContext() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessagesContext must be used within MessagesProvider')
  return ctx
}

export { HOUSES }
export type { House, Ticket }
