import { useState } from 'react'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function GoalPrompt({ cvAnalysis }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [target, setTarget] = useState('Backend Developer')
    const [deadlineLocal, setDeadlineLocal] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const nowLocal = new Date()
    nowLocal.setMinutes(nowLocal.getMinutes() - nowLocal.getTimezoneOffset())
    const minDateTime = nowLocal.toISOString().slice(0, 16)

    const submit = async () => {
        setError('')
        if (!deadlineLocal) {
            setError('Please select deadline')
            return
        }
        if (new Date(deadlineLocal) < new Date()) {
            setError('Deadline must be today or later')
            return
        }
        setLoading(true)
        try {
            const iso = new Date(deadlineLocal).toISOString().replace('Z', '')

            // const { data } = await axiosClient.post(
            //     `/gemini/plan`,
            //     { cvAnalysis },
            //     {
            //         params: { target, complete_time: iso, userId: user.id },
            //     },
            // )
            // navigate('/goal-form', { state: { plan: data, cvAnalysis } })

            let data = null
            const maxRetries = 5
            const retryDelay = 1000 // 1 giây
            let attempt = 0
            while (attempt < maxRetries) {
                attempt++
                try {
                    const res = await axiosClient.post(
                        `/gemini/plan`,
                        { cvAnalysis },
                        {
                            params: {
                                target,
                                complete_time: iso,
                                userId: user.id,
                            },
                        },
                    )

                    // Nếu trả về đúng format (mảng kế hoạch), dừng retry
                    if (Array.isArray(res.data)) {
                        data = res.data
                        break
                    }

                    // Nếu code 1008 => retry
                    if (res.data?.code === 1008) {
                        console.warn(`Retrying... (${attempt}/${maxRetries})`)
                        await new Promise((r) => setTimeout(r, retryDelay))
                        continue
                    }

                    // Trường hợp lỗi khác thì thoát
                    throw new Error('Unexpected response format')
                } catch (err) {
                    // Nếu request lỗi mạng hoặc lỗi khác, cũng thử lại
                    if (attempt < maxRetries) {
                        console.warn(
                            `Retrying after error... (${attempt}/${maxRetries})`,
                        )
                        await new Promise((r) => setTimeout(r, retryDelay))
                    } else {
                        throw err
                    }
                }
            }

            if (!data) {
                throw new Error('Failed after retries')
            }

            navigate('/goal-form', { state: { plan: data, cvAnalysis } })
        } catch {
            setError('Failed to generate plan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h3 className='font-semibold mb-2'>Set Learning Goal</h3>
            <div className='flex flex-col md:flex-row gap-4 items-start md:items-end'>
                <div className='flex-1 w-full'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Your Goal
                    </label>
                    <input
                        className='w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition'
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder='e.g., Backend Developer'
                    />
                </div>
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Complete by
                    </label>
                    <input
                        type='datetime-local'
                        min={minDateTime}
                        className='border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition'
                        value={deadlineLocal}
                        onChange={(e) => setDeadlineLocal(e.target.value)}
                    />
                </div>
                <button
                    className='bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md px-4 py-2.5 transition-colors'
                    onClick={submit}
                    disabled={loading}
                >
                    {loading ? 'Generating…' : 'Generate Plan'}
                </button>
            </div>
            {error && (
                <div className='text-red-600 text-sm mt-2 bg-red-50 border border-red-200 rounded px-3 py-2'>
                    {error}
                </div>
            )}
        </div>
    )
}
