import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/useAppContext'
import Loading from './Loading'

const Community = () => {
  const { axios } = useAppContext()
  const [images, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const { data } = await axios.get('/api/user/published-images', {
          signal: controller.signal,
        })
        if (!data.success) throw new Error(data.message)
        setItems(data.images)
      } catch (error) {
        if (!controller.signal.aborted)
          setError(error.response?.data?.message || error.message)
      }
    }
    load()
    return () => controller.abort()
  }, [axios])
  if (error)
    return (
      <p className="p-6" role="alert">
        {error}
      </p>
    )
  if (!images) return <Loading />

  return (
    <section className="screen">
      <h1 className="screen-title">Community gallery</h1>
      {images.length ? (
        <div className="gallery-grid">
          {images.map((item, index) => (
            <a
              key={index}
              href={item.imageUrl}
              download={
                item.imageUrl.startsWith('data:') ? 'quickgpt-image' : undefined
              }
              target="_blank"
              rel="noreferrer"
            >
              <img
                loading="lazy"
                src={item.imageUrl}
                alt={`Image by ${item.userName}`}
              />
              <p>Created by {item.userName}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="muted">Published images will appear here.</p>
      )}
    </section>
  )
}

export default Community
