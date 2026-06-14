import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const {selectedChat, setSelectedChat, theme, user, axios, token, setUser, createNewChat} = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmit = async (e) => {
    try {
      e.preventDefault()
      if(!user) return toast('Login to send message')

      let chat = selectedChat
      if(!chat){
        chat = await createNewChat()
        if(!chat) return
        setSelectedChat(chat)
      }

      setLoading(true)
      const promptCopy = prompt
      setPrompt('')
      setMessages(prev => [...prev, {role: 'user', content: prompt, timestamp: Date.now(), isImage: false}])

      const {data} = await axios.post(`/api/message/${mode}`,
  {chatId: chat._id, prompt, isPublished},
  {headers: {Authorization: `Bearer ${token}`}})

console.log("API Response:", data)

      if(data.success){
        console.log("Reply: ", data.reply);
        setMessages(prev => [...prev, data.reply])
        if(mode === 'image'){
          setUser(prev => ({...prev, credits: prev.credits - 2}))
        } else {
          setUser(prev => ({...prev, credits: prev.credits - 1}))
        }
      } else {
        toast.error(data.message)
        setPrompt(promptCopy)
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setPrompt('')
      setLoading(false)
    }
  }

  useEffect(() => {
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(() => {
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  return (
    <div className='h-screen flex flex-col'>

      {/* Chat Messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-auto min-h-0'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} className='w-full max-w-56 sm:max-w-68' alt="" />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-600 dark:text-white'>Ask me anything.</p>
          </div>
        )}

        {messages.map((message, index) => <Message key={index} message={message} />)}

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
          <p className='text-xs justify-center items-center ml-90 text-slate-900'>Publish Generated Image to Community</p>
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
        <button disabled={loading}>
          <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="" />
        </button>
      </form>
      </div>

  )
}

export default ChatBox