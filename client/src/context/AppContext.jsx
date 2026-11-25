import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AppContext } from './useAppContext'

export function AppContextProvider({ children }) {
    const [token, updateToken] = useState(() => localStorage.getItem('token'))
    const setToken = useCallback(value => {
        if (value) localStorage.setItem('token', value)
        else localStorage.removeItem('token')
        updateToken(value)
    }, [])
    return <Session key={token} token={token} setToken={setToken}>{children}</Session>
}

function Session({ children, token, setToken }) {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [chats, setChats] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
    const [loadingUser, setLoadingUser] = useState(Boolean(token))
    const [loadError, setLoadError] = useState('')
    const api = useMemo(() => axios.create({
        baseURL: import.meta.env.VITE_SERVER_URL || undefined,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }), [token])

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (!token) return
        const controller = new AbortController()
        const handler = api.interceptors.response.use(undefined, error => {
            if (error.response?.status === 401 && !controller.signal.aborted) setToken(null)
            return Promise.reject(error)
        })
        async function initialize() {
            try {
                const options = { signal: controller.signal }
                const { data: profile } = await api.get('/api/user/data', options)
                if (!profile.success) throw new Error(profile.message)
                const { data } = await api.get('/api/chats/get', options)
                if (!data.success) throw new Error(data.message)
                setUser(profile.user)
                setChats(data.chats)
                setSelectedId(data.chats[0]?._id)
            } catch (error) {
                if (!controller.signal.aborted) setLoadError(error.response?.data?.message || error.message)
            } finally {
                if (!controller.signal.aborted) setLoadingUser(false)
            }
        }
        initialize()
        return () => {
            controller.abort()
            api.interceptors.response.eject(handler)
        }
    }, [token, api, setToken])

    async function createNewChat() {
        const { data } = await api.post('/api/chats/create')
        if (!data.success) throw new Error(data.message)
        setChats(prev => [data.chat, ...prev])
        setSelectedId(data.chat._id)
        return data.chat
    }

    const selectedChat = chats.find(chat => chat._id === selectedId) || chats[0] || null
    function logout() {
        setToken(null)
        navigate('/')
        toast.success('Logged out successfully')
    }

    const value = {
        navigate, user, setUser, chats, setChats, selectedChat,
        setSelectedChat: chat => setSelectedId(chat?._id), theme, setTheme,
        token, setToken, loadingUser, loadError, createNewChat, axios: api, logout,
    }
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
