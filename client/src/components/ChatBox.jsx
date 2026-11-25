import { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/useAppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const {selectedChat, setChats, theme, axios, setUser, createNewChat} = useAppContext()
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
    <div className='h-screen flex flex-col'>

      {/* Chat Messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-auto min-h-0'>
        {!messages?.length && !loading && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} className='w-full max-w-56 sm:max-w-68' alt="" />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-600 dark:text-white'>Ask me anything.</p>
          </div>
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
        <label className='inline-flex items-center gap-2 mb-3  text-sm mx-auto'>
          <p className='text-xs justify-center items-center text-slate-900 dark:text-white'>Publish Generated Image to Community</p>
          <input type="checkbox" className='cursor-pointer' checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)} />
        </label>
      )}

      {/* Prompt Input */}
      <form onSubmit={onSubmit} className='text-slate-900 dark:text-white bg-primary/20 dark:bg-[#583C79] border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e)=>setMode(e.target.value)} value={mode} className='text-sm dark:text-white text-slate-900 pl-3 pr-2 outline-none'>
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Image</option>
        </select>
        <input onChange={(e)=>setPrompt(e.target.value)} value={prompt} type="text" placeholder='Type your prompt here...' className='flex-1 text-slate-900 w-full dark:text-white text-sm outline-none' required />
        <button disabled={sending || !prompt.trim()} aria-label="Send message">
          <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="" />
        </button>
      </form>
      </div>

  )
}

export default ChatBox
