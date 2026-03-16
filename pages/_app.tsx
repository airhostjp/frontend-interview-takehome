import type { AppProps } from 'next/app'
import { AppProvider } from '@/context/AppContext'
import { MessagesProvider } from '@/context/MessagesContext'
import { Sidebar } from '@/components/Sidebar/Sidebar'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <MessagesProvider>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Component {...pageProps} />
          </main>
        </div>
      </MessagesProvider>
    </AppProvider>
  )
}
