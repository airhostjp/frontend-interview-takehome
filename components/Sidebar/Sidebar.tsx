import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMessagesContext } from '@/context/MessagesContext'

const NAV_ITEMS = [
  { href: '/', label: 'Bookings' },
  { href: '/messages', label: 'Messages' },
]

export function Sidebar() {
  const router = useRouter()
  const { unreadCount } = useMessagesContext()

  return (
    <nav style={{
      width: 200,
      minWidth: 200,
      background: '#1a1a2e',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
    }}>
      <div style={{ padding: '0 20px 24px', fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>
        PMS Demo
      </div>

      {NAV_ITEMS.map(item => {
        const isActive = router.pathname === item.href
        const isMessages = item.href === '/messages'
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 20px',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              fontSize: 14,
              borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <span>{item.label}</span>
            {isMessages && unreadCount > 0 && (
              <span style={{
                background: '#ef5350',
                color: 'white',
                borderRadius: 10,
                padding: '1px 7px',
                fontSize: 11,
                fontWeight: 600,
              }}>
                {unreadCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
