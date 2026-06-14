import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './components/pages/Credits'
import Community from './components/pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './components/pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './components/pages/Login'
import {Toaster} from 'react-hot-toast'

const App = () => {

  const {user, loadingUser} = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {pathname} = useLocation()
  if(pathname === '/loading' || loadingUser) return <Loading />
  return (
    <>
    <Toaster />
    {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert'
    onClick={()=>setIsMenuOpen(true)}/>}


    {user ? (
      <div className='dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white h-3 w-5'>
      <div className='flex h-screen w-screen'>
  <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
  <div className='flex-1 h-screen overflow-hidden dark:bg-gradient-to-b dark:from-[#242124] dark:to-[#000000] dark:text-white'>
    <Routes>
      <Route path='/' element={<ChatBox />} />
      <Route path='/credits' element={<Credits />} />
      <Route path='/community' element={<Community />} />
      <Route path='/' element={<Login />} />
    </Routes>
  </div>
</div>
      
    
    </div>
    ) : (
      <div className='bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen'>
        <Login />
      </div>
    )}


    
      
    </>
  )
}

export default App
