import React from 'react'
import Sidebar from './Sidebar'

/**
 * AppShell — wrapper yang menambahkan sidebar di kiri dan offset konten di kanan.
 * Props: { user, navigate, currentScreen, onLogout, children }
 *
 * Di mobile (< 1024px): Sidebar otomatis tersembunyi (handled oleh Sidebar.jsx),
 * tidak ada offset, tampilan mobile normal.
 */
export default function AppShell({ user, navigate, currentScreen, onLogout, children }) {
  return (
    <>
      <Sidebar
        user={user}
        navigate={navigate}
        currentScreen={currentScreen}
        onLogout={onLogout}
      />
      <div className="with-sidebar">
        {children}
      </div>
    </>
  )
}
