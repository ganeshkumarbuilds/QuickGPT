import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Brand from './Brand'
import { useAppContext } from '../context/useAppContext'
import toast from 'react-hot-toast'

export default function Sidebar({ isMenuOpen, setIsMenuOpen }) {
  const {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    user,
    navigate,
    createNewChat,
    axios,
    logout,
  } = useAppContext()
  const [search, setSearch] = useState('')
  const close = () => setIsMenuOpen(false)
  async function create() {
    try {
      await createNewChat()
      navigate('/')
      close()
    } catch (error) {
      toast.error(error.message)
    }
  }
  async function remove(id) {
    if (!window.confirm('Delete this conversation?')) return
    try {
      const { data } = await axios.post('/api/chats/delete', { chatId: id })
      if (!data.success) throw new Error(data.message)
      setChats((prev) => prev.filter((chat) => chat._id !== id))
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <aside className={'side ' + (isMenuOpen ? '' : 'closed')}>
      <Brand />
      <button className="close-menu" aria-label="Close menu" onClick={close}>
        ✕
      </button>
      <button className="button ink" onClick={create}>
        ＋ New conversation
      </button>
      <input
        className="search-field"
        aria-label="Search conversations"
        placeholder="Search conversations"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="history">
        {chats.map((chat) => {
          const title = chat.messages[0]?.content || chat.name
          return (
            title.toLowerCase().includes(search.toLowerCase()) && (
              <div
                className={
                  'history-row ' +
                  (selectedChat?._id === chat._id ? 'active-row' : '')
                }
                key={chat._id}
              >
                <button
                  onClick={() => {
                    setSelectedChat(chat)
                    navigate('/')
                    close()
                  }}
                >
                  {title}
                </button>
                <button
                  aria-label={'Delete ' + title.slice(0, 40)}
                  onClick={() => remove(chat._id)}
                >
                  ×
                </button>
              </div>
            )
          )
        })}
      </div>
      <nav>
        <NavLink to="/community" onClick={close}>
          ▧ Community gallery
        </NavLink>
        <NavLink to="/credits" onClick={close}>
          ◇ Credits · {user.credits}
        </NavLink>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          ◐ {theme === 'dark' ? 'Light' : 'Dark'} theme
        </button>
      </nav>
      <div className="side-bottom">
        <span>{user.name}</span>
        <button onClick={logout}>Log out ↗</button>
      </div>
    </aside>
  )
}
