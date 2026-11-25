import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/useAppContext'
import toast from 'react-hot-toast'
import Loading from './Loading'

const Credits = () => {
  const {axios} = useAppContext()
  const [plans, setItems] = useState(null)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState(null)

  async function purchase(planId) {
    if (purchasing) return
    setPurchasing(planId)
    try {
      const {data} = await axios.post('/api/credit/purchase', {planId})
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
        const {data} = await axios.get('/api/credit/plan', {signal: controller.signal})
        if (!data.success) throw new Error(data.message)
        setItems(data.plans)
      } catch (error) {
        if (!controller.signal.aborted) setError(error.response?.data?.message || error.message)
      }
    }
    load()
    return () => controller.abort()
  }, [axios])
  if (error) return <p className="p-6" role="alert">{error}</p>
  if (!plans) return <Loading />

  return (
    <div className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h2 className='text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white'>Credit plans</h2>
      <div className='flex flex-wrap justify-center gap-8'>
        {plans.map((plan)=>(
          <div key={plan._id} className={`border border-gray-200  text-purple-700 dark:border-purple-700 rounded-lg shadow
          hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${plan._id === "pro" ? "bg-purple-50 dark:bg-purple-900"
          : "bg-white dark:bg-transparent"}`}>
            <div className='flex-1'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>{plan.name}</h3>
              <p>${plan.price}
                <span className='text-base font-normal text-gray-600 dark:text-purple-200'>{' '}/ {plan.credits} credits</span>
              </p>
              <ul className='list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1'>
                {plan.features.map((feature, index)=>(
                  <li key={index}>{feature}</li>
                ))}
              </ul>

            </div>
            <button disabled={Boolean(purchasing)} onClick={() => purchase(plan._id)} className='mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded
            transition-colors cursor-pointer'>{purchasing === plan._id ? 'Opening checkout…' : 'Buy Now'}</button>

          </div>
        ))}

      </div>
    </div>
  )
}

export default Credits
