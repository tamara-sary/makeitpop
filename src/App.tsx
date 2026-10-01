import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { MenuBar, PrototypeNote, ToastProvider } from './components/ui'
import DayPage from './pages/DayPage'
import Archive from './pages/Archive'
import SteamRoom from './pages/SteamRoom'
import HowItWorks from './pages/HowItWorks'

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
            <Route path="/" element={<DayPage />} />
            <Route path="/day/:n" element={<DayPage />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/steam-room" element={<SteamRoom />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="*" element={<DayPage />} />
          </Routes>
          <PrototypeNote />
        </main>
      </ToastProvider>
    </BrowserRouter>
  )
}
