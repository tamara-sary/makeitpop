import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { MenuBar, PrototypeNote, ToastProvider } from './components/ui'
import DayPage from './pages/DayPage'
import Archive from './pages/Archive'
import SteamRoom from './pages/SteamRoom'
import Home from './pages/Home'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollTop />
        <MenuBar />
        <main className="mx-auto grid max-w-7xl gap-12 px-4 py-8 sm:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/today" element={<DayPage />} />
            <Route path="/day/:n" element={<DayPage />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/steam-room" element={<SteamRoom />} />
            <Route path="/how-it-works" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PrototypeNote />
        </main>
      </ToastProvider>
    </BrowserRouter>
  )
}
