import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
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

// Day pages are a full-screen editor, so they skip the centred column.
function Main({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const editor = pathname === '/today' || pathname.startsWith('/day/')
  return <main className={editor ? 'grid gap-12 pb-8' : 'mx-auto grid max-w-7xl gap-12 px-4 py-8 sm:py-10'}>{children}</main>
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollTop />
        <MenuBar />
        <Main>
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
        </Main>
      </ToastProvider>
    </BrowserRouter>
  )
}
