import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AppConfig } from '@/types'

interface HoveredCell {
  rowId: string
  dayIndex: number
}

interface AppContextValue {
  config: AppConfig
  hoveredCell: HoveredCell | null
  setHoveredCell: (cell: HoveredCell | null) => void
}

const defaultConfig: AppConfig = {
  dateRangeStart: new Date().toISOString().split('T')[0],
  dateRangeEnd: (() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })(),
  columnWidthPx: 48,
  visibleColumnsBuffer: 2,
  bookingHeaderBackground: "#e8f4fc"
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)

  const value: AppContextValue = {
    config: defaultConfig,
    hoveredCell,
    setHoveredCell,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
