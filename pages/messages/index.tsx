import React, { useEffect } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Ticket } from '@/types'
import { useMessagesContext } from '@/context/MessagesContext'

interface MessagesPageProps {
  initialTicketId: string | null
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const MessagesPage: NextPage<MessagesPageProps> = ({ initialTicketId }) => {
  const router = useRouter()
  const { activeTicketId, setActiveTicketId, setUnreadCount } = useMessagesContext()
  const { data: tickets } = useSWR<Ticket[]>('/api/tickets', fetcher)

  // Sync unread count into context
  useEffect(() => {
    if (tickets) {
      setUnreadCount(tickets.filter(t => t.unread).length)
    }
  }, [tickets, setUnreadCount])

  // Use ticketId from URL or prop
  const currentTicketId = (router.query.ticketId as string) ?? initialTicketId ?? activeTicketId

  const handleTicketClick = (ticket: Ticket) => {
    router.push(`/messages?ticketId=${ticket.id}&houseId=${ticket.houseId}`)
  }

  const activeTicket = tickets?.find(t => t.id === currentTicketId)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Ticket list */}
      <div style={{
        width: 320,
        minWidth: 320,
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto',
        background: 'white',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 15 }}>
          Messages
        </div>

        {tickets?.map(ticket => {
          const isActive = ticket.id === currentTicketId
          return (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: isActive ? '#f0f7ff' : 'white',
                borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ fontWeight: ticket.unread ? 600 : 400, fontSize: 13 }}>
                  {ticket.guestName}
                </span>
                {ticket.unread && (
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#6c63ff',
                    flexShrink: 0,
                    marginTop: 4,
                  }} />
                )}
              </div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 3, fontWeight: ticket.unread ? 500 : 400 }}>
                {ticket.subject}
              </div>
              <div style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ticket.lastMessage}
              </div>
              <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>
                {ticket.houseName}
              </div>
            </div>
          )
        })}
      </div>

      {/* Message view */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTicket ? (
          <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{activeTicket.subject}</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
              {activeTicket.guestName} · {activeTicket.houseName}
            </p>
            <div style={{
              padding: '12px 16px',
              background: '#f8f8f8',
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 520,
            }}>
              {activeTicket.lastMessage}
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bbb',
            fontSize: 14,
          }}>
            Select a message to view
          </div>
        )}
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ticketId = (context.query.ticketId as string) ?? null
  return {
    props: {
      initialTicketId: ticketId,
    },
  }
}

export default MessagesPage
