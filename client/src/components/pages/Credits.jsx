import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/useAppContext'
import toast from 'react-hot-toast'
import Loading from './Loading'

const Credits = () => {
  const { axios } = useAppContext()
  const [plans, setItems] = useState(null)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState(null)

  async function purchase(planId) {
    if (purchasing) return
    setPurchasing(planId)
    try {
      const { data } = await axios.post('/api/credit/purchase', { planId })
      if (!data.success) throw new Error(data.message)
      window.location.assign(data.url)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      setPurchasing(null)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const { data } = await axios.get('/api/credit/plan', {
          signal: controller.signal,
        })
        if (!data.success) throw new Error(data.message)
        setItems(data.plans)
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
  if (!plans) return <Loading />

  return (
    <section className="screen">
      <h1 className="screen-title">Credit plans</h1>
      <div className="plan-grid">
        {plans.map((plan) => (
          <article key={plan._id} className="plan-card">
            <h2 className="text-xl">{plan.name}</h2>
            <p>
              <strong className="text-3xl">${plan.price}</strong> /{' '}
              {plan.credits} credits
            </p>
            <p className="muted">
              Use one credit per text reply or two per generated image.
            </p>
            <button
              className="button ink"
              disabled={Boolean(purchasing)}
              onClick={() => purchase(plan._id)}
            >
              {purchasing === plan._id ? 'Opening checkout…' : 'Buy credits ↗'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Credits
