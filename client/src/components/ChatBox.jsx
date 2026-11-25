import { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/useAppContext'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const {selectedChat, setChats, axios, setUser, createNewChat} = useAppContext()
  const [pending, setPending] = useState(null)
  const [sending, setSending] = useState(false)
  const [drafts, setDrafts] = useState({})
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)
  const draftId = selectedChat?._id || 'new'
  const prompt = drafts[draftId] || ''
  const setPrompt = value => setDrafts(previous => ({...previous, [draftId]: value}))
  const messages = selectedChat?.messages
  const loading = pending && pending.chatId === selectedChat?._id

  const onSubmit = async (event) => {
    event.preventDefault()
    const content = prompt.trim()
    if (sending || !content) return
    setSending(true)
    let id = draftId
    try {
      const chat = selectedChat || await createNewChat()
      id = chat._id
      const optimistic = {role: 'user', content, timestamp: Date.now(), isImage: false}
      setPending({chatId: id, message: optimistic})
      setPrompt('')
      const {data} = await axios.post(`/api/message/${mode}`, {chatId: id, prompt: content, isPublished})
      if (!data.success) throw new Error(data.message)
      setChats(previous => {
        const current = previous.find(item => item._id === id)
        if (!current) return previous
        const updated = {...current, messages: [...current.messages, data.message || optimistic, data.reply],
          updatedAt: new Date(data.reply.timestamp).toISOString()}
        return [updated, ...previous.filter(item => item._id !== id)]
      })
      setUser(previous => ({...previous, credits: previous.credits - (mode === 'image' ? 2 : 1)}))
    } catch (error) {
      setDrafts(previous => ({...previous, [id]: previous[id] || prompt}))
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setPending(null)
      setSending(false)
    }
  }

  useEffect(() => {
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, loading])

  return (
    <div className='chat-shell'>

      {/* Chat Messages */}
      <div ref={containerRef} className='chat-feed'>
        {!messages?.length && !loading && (
          <div className="chat-welcome"><span className="brand-mark">✳</span><h1>What’s on your mind?</h1><p className="muted">Start a conversation or switch to image mode.</p></div>
        )}

        {messages?.map((message, index) => <Message key={index} message={message} />)}

        {loading && <Message message={pending.message} />}
        {loading && (
          <div className='loader flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-white animate-bounce'></div>
          </div>
        )}
        </div>

      {mode === 'image' && (
        <label className="publish-option"><input type="checkbox" checked={isPublished} onChange={e=>setIsPublished(e.target.checked)}/> Publish this image to the community</label>
      )}
      <form onSubmit={onSubmit} className="composer">
        <select aria-label="Generation mode" value={mode} onChange={e=>setMode(e.target.value)}><option value="text">Text</option><option value="image">Image</option></select>
        <input aria-label="Prompt" placeholder="Write a prompt…" value={prompt} onChange={e=>setPrompt(e.target.value)} required/>
        <button disabled={sending || !prompt.trim()} aria-label="Send prompt">↑</button>
      </form>
      </div>

  )
}

export default ChatBox
