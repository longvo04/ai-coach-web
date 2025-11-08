import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createProcess } from '../api/processes'

export default function GoalForm() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const initial = useMemo(
        () => location.state?.plan || [],
        [location.state?.plan],
    )
    const initialGoalSummary = useMemo(() => {
        if (!initial || initial.length === 0) return ''
        return initial[0]?.goal || ''
    }, [initial])
    const [goalSummary] = useState(initialGoalSummary)
    const [groups, setGroups] = useState(() =>
        initial.map((g) => ({
            goal: g.goal || '',
            big_title: g.big_title || '',
            route: (g.route || []).map((r) => ({
                small_title: r.small_title || '',
                percentage: Number(r.percentage || r.weight) || 0,
                description: r.description || '',
                deadline: r.deadline || '',
                done: r.done || false,
            })),
        })),
    )
    const [error, setError] = useState('')
    const totalPercentage = useMemo(() => {
        return groups.reduce((total, g) => {
            return (
                total +
                g.route.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0)
            )
        }, 0)
    }, [groups])
    const valid = useMemo(() => totalPercentage === 100, [totalPercentage])

    useEffect(() => {
        if (!initial || initial.length === 0) navigate('/upload')
    }, [initial, navigate])

    const save = async () => {
        setError('')
        if (!valid) {
            setError('Total percentages must add up to 100%')
            return
        }
        const payload = {
            goal: goalSummary,
            metadata: groups.map((g) => ({
                ...(g.goal ? { goal: g.goal } : {}),
                big_title: g.big_title,
                route: g.route.map((r) => ({
                    small_title: r.small_title,
                    percentage: Number(r.percentage) || 0,
                    description: r.description,
                    deadline: r.deadline,
                    done: false,
                })),
            })),
        }
        try {
            await createProcess(user.id, payload)
            navigate('/goals')
        } catch {
            setError('Failed to save')
        }
    }

    const updateRoute = (gi, ri, key, value) => {
        setGroups((prev) =>
            prev.map((g, i) =>
                i !== gi
                    ? g
                    : {
                          ...g,
                          route: g.route.map((r, j) =>
                              j !== ri
                                  ? r
                                  : {
                                        ...r,
                                        [key]:
                                            key === 'percentage'
                                                ? Number(value)
                                                : value,
                                    },
                          ),
                      },
            ),
        )
    }

    const updateGroupTitle = (gi, value) => {
        setGroups((prev) =>
            prev.map((g, i) => (i !== gi ? g : { ...g, big_title: value })),
        )
    }

    const addBigTitle = () => {
        setGroups((prev) => [
            ...prev,
            {
                goal: '',
                big_title: '',
                route: [
                    {
                        small_title: '',
                        percentage: 0,
                        description: '',
                        deadline: '',
                        done: false,
                    },
                ],
            },
        ])
    }

    const removeBigTitle = (gi) => {
        setGroups((prev) => prev.filter((_, i) => i !== gi))
    }

    const addSmallTitle = (gi) => {
        setGroups((prev) =>
            prev.map((g, i) =>
                i !== gi
                    ? g
                    : {
                          ...g,
                          route: [
                              ...g.route,
                              {
                                  small_title: '',
                                  percentage: 0,
                                  description: '',
                                  deadline: '',
                                  done: false,
                              },
                          ],
                      },
            ),
        )
    }

    const removeSmallTitle = (gi, ri) => {
        setGroups((prev) =>
            prev.map((g, i) =>
                i !== gi
                    ? g
                    : {
                          ...g,
                          route: g.route.filter((_, j) => j !== ri),
                      },
            ),
        )
    }

    return (
        <div className='max-w-5xl mx-auto p-6 space-y-4'>
            <h1 className='text-2xl font-semibold'>Review & Edit Plan</h1>
            {goalSummary && (
                <div className='bg-white border border-blue-200 rounded-xl p-5 shadow-sm'>
                    <h2 className='text-lg font-semibold text-blue-900 mb-2'>
                        Goal Summary
                    </h2>
                    <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line'>
                        {goalSummary}
                    </p>
                </div>
            )}
            {error && (
                <div className='text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm'>
                    {error}
                </div>
            )}
            <div className='bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4'>
                <div className='text-sm font-medium text-blue-900'>
                    Total Percentage:{' '}
                    <span
                        className={
                            valid ? 'text-green-700' : 'text-red-700 font-bold'
                        }
                    >
                        {totalPercentage}%
                    </span>
                    {!valid && (
                        <span className='text-red-700 ml-2'>
                            (Must equal 100%)
                        </span>
                    )}
                </div>
            </div>
            <div className='space-y-6'>
                {groups.map((g, gi) => (
                    <div
                        key={gi}
                        className='bg-white rounded-xl shadow ring-1 ring-gray-100 p-6'
                    >
                        <div className='mb-4 flex items-center gap-3'>
                            <input
                                className='flex-1 text-lg font-semibold bg-blue-50 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-4 py-2 outline-none transition'
                                placeholder='Big Title'
                                value={g.big_title}
                                onChange={(e) =>
                                    updateGroupTitle(gi, e.target.value)
                                }
                            />
                            <button
                                onClick={() => removeBigTitle(gi)}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-300 rounded-md px-3 py-2 transition-colors'
                                disabled={groups.length === 1}
                            >
                                Remove
                            </button>
                        </div>
                        <div className='space-y-4'>
                            {g.route.map((r, ri) => (
                                <div
                                    key={ri}
                                    className='border-l-4 border-green-400 pl-4 py-3 bg-gray-50 rounded-r-md'
                                >
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                                        <div>
                                            <input
                                                className='w-full font-medium bg-green-50 border-2 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-md px-3 py-2 outline-none transition'
                                                placeholder='Small Title'
                                                value={r.small_title}
                                                onChange={(e) =>
                                                    updateRoute(
                                                        gi,
                                                        ri,
                                                        'small_title',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className='flex gap-2'>
                                            <input
                                                type='number'
                                                className='flex-1 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition'
                                                placeholder='Percentage'
                                                value={r.percentage}
                                                onChange={(e) =>
                                                    updateRoute(
                                                        gi,
                                                        ri,
                                                        'percentage',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <button
                                                onClick={() =>
                                                    removeSmallTitle(gi, ri)
                                                }
                                                className='text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-300 rounded-md px-3 py-2 transition-colors text-sm'
                                                disabled={g.route.length === 1}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div className='md:col-span-2 mb-3'>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Description
                                        </label>
                                        <textarea
                                            className='w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition'
                                            value={r.description}
                                            onChange={(e) =>
                                                updateRoute(
                                                    gi,
                                                    ri,
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Deadline
                                        </label>
                                        <input
                                            type='datetime-local'
                                            className='w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition'
                                            value={
                                                r.deadline?.slice(0, 16) || ''
                                            }
                                            min={new Date()
                                                .toISOString()
                                                .slice(0, 16)}
                                            onChange={(e) => {
                                                const iso = new Date(
                                                    e.target.value,
                                                )
                                                    .toISOString()
                                                    .replace('Z', '')
                                                updateRoute(
                                                    gi,
                                                    ri,
                                                    'deadline',
                                                    iso,
                                                )
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addSmallTitle(gi)}
                                className='w-full border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-md px-4 py-2 transition-colors text-sm font-medium'
                            >
                                + Add Small Title
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={addBigTitle}
                    className='w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-xl px-4 py-3 transition-colors font-medium'
                >
                    + Add Big Title
                </button>
            </div>
            <div className='flex gap-2'>
                <button
                    className='bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 transition-colors'
                    disabled={!valid}
                    onClick={save}
                >
                    Save Goal
                </button>
                <button
                    className='border border-gray-300 hover:bg-gray-50 rounded-md px-4 py-2 transition-colors'
                    onClick={() => navigate('/upload')}
                >
                    Back
                </button>
            </div>
        </div>
    )
}
