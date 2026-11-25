import { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import '../assets/prism.css'

export default function Message({ message }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) Prism.highlightAllUnder(ref.current)
  }, [message.content])
  const user = message.role === 'user'
  return (
    <div className={'flex my-4 ' + (user ? 'justify-end' : 'justify-start')}>
      <article className={'bubble ' + (user ? 'user-bubble' : '')}>
        {user ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : message.isImage ? (
          <img
            className="rounded-lg max-w-full"
            src={message.content}
            alt="Generated image"
          />
        ) : (
          <div className="markdown" ref={ref}>
            <Markdown>{message.content}</Markdown>
          </div>
        )}
        <time dateTime={new Date(message.timestamp).toISOString()}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </article>
    </div>
  )
}
