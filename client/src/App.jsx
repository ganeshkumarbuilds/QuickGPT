import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './components/pages/Home'
import Login from './components/pages/Login'
import Loading from './components/pages/Loading'
import { useAppContext } from './context/useAppContext'
const Sidebar = lazy(() => import('./components/Sidebar'))
const ChatBox = lazy(() => import('./components/ChatBox'))
const Credits = lazy(() => import('./components/pages/Credits'))
const Community = lazy(() => import('./components/pages/Community'))
const PurchaseReturn = lazy(() => import('./components/pages/PurchaseReturn'))

export default function App() {
  const { user, loadingUser, loadError, logout } = useAppContext()
  const location = useLocation()
  const [menu, setMenu] = useState(false)
  if (loadingUser) return <Loading />
  if (loadError)
    return (
      <main className="auth-page" role="alert">
        <p>{loadError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={logout}>Sign out</button>
      </main>
    )
  const from = location.state?.from
  const destination =
    typeof from === 'string' &&
    ['/credits', '/community', '/loading'].includes(from.split('?')[0])
      ? from
      : '/'
  return (
    <>
      <Toaster />
      {user ? (
        <Suspense fallback={<Loading />}>
          <div className="workspace">
            <button
              className="menu-toggle"
              aria-label="Open menu"
              onClick={() => setMenu(true)}
            >
              ☰
            </button>
            <Sidebar isMenuOpen={menu} setIsMenuOpen={setMenu} />
            <main className="work-main">
              <Routes>
                <Route path="/" element={<ChatBox />} />
                <Route path="/credits" element={<Credits />} />
                <Route path="/community" element={<Community />} />
                <Route path="/loading" element={<PurchaseReturn />} />
                <Route
                  path="*"
                  element={<Navigate to={destination} replace />}
                />
              </Routes>
            </main>
          </div>
        </Suspense>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login key="login" />} />
          <Route path="/signup" element={<Login register key="signup" />} />
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
                state={{ from: location.pathname + location.search }}
              />
            }
          />
        </Routes>
      )}
    </>
  )
}
