import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import ChatBox from './components/ChatBox'
import Credits from './components/pages/Credits'
import Community from './components/pages/Community'
import Loading from './components/pages/Loading'
import PurchaseReturn from './components/pages/PurchaseReturn'
import Login from './components/pages/Login'
import { useAppContext } from './context/useAppContext'
import { assets } from './assets/assets'
import './assets/prism.css'

export default function App() {
  const {user, loadingUser, loadError, logout} = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  if (loadingUser) return <Loading />
  if (loadError) return <div className="p-6" role="alert">
    <p>{loadError}</p>
    <button className="underline mr-4" onClick={() => window.location.reload()}>Retry</button>
    <button className="underline" onClick={logout}>Sign out</button>
  </div>

  return <>
    <Toaster />
    {user ? (
      <div className="flex h-screen w-full dark:bg-gradient-to-b dark:from-[#242124] dark:to-black dark:text-white">
        {!isMenuOpen && <button aria-label="Open menu" className="absolute z-10 top-3 left-3 md:hidden" onClick={() => setIsMenuOpen(true)}>
          <img src={assets.menu_icon} className="w-8 h-8 not-dark:invert" alt="" />
        </button>}
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="flex-1 min-w-0 h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<ChatBox />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
            <Route path="/loading" element={<PurchaseReturn />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    ) : (
      <div className="bg-gradient-to-b from-[#242124] to-black flex items-center justify-center h-screen w-full">
        <Login />
      </div>
    )}
  </>
}
