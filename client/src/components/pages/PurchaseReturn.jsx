import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../../context/useAppContext'

export default function PurchaseReturn() {
  const [params] = useSearchParams()
  const id = params.get('purchase')
  const { axios, setUser, navigate } = useAppContext()
  const [message, setMessage] = useState('Confirming your credit purchase…')
  useEffect(() => {
    let timer
    let attempts = 0
    const controller = new AbortController()
    const options = {signal: controller.signal}
    async function check() {
      try {
        if (id) {
          const {data} = await axios.get(`/api/credit/purchase/${encodeURIComponent(id)}`, options)
          if (!data.success) throw new Error(data.message)
          if (!data.isPaid) {
            if (++attempts < 15) timer = setTimeout(check, 2000)
            else setMessage('Payment confirmation is still pending. Refresh this page to check again.')
            return
          }
        }
        const {data} = await axios.get('/api/user/data', options)
        if (!data.success) throw new Error(data.message)
        setUser(data.user)
        navigate('/', {replace: true})
      } catch (error) {
        if (!controller.signal.aborted) setMessage(error.response?.data?.message || error.message)
      }
    }
    check()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [id, axios, navigate, setUser])
  return <div className="p-8" role="status"><p>{message}</p><Link className="underline" to="/">Return to chat</Link></div>
}
