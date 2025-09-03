'use client'

import { useState, useEffect } from 'react'

interface Mob {
  id: number
  keywords: string
  shortDesc: string
  detailedDesc: string
  level: number
  hitpointsMax: number
  zoneId: number
}

export default function MobsPage() {
  const [mobs, setMobs] = useState<Mob[]>([])
  const [mobsCount, setMobsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMobs = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                mobs {
                  id
                  keywords
                  shortDesc
                  detailedDesc
                  level
                  hitpointsMax
                  zoneId
                }
                mobsCount
              }
            `
          })
        })

        const result = await response.json()
        if (result.errors) {
          throw new Error(result.errors[0].message)
        }

        setMobs(result.data.mobs)
        setMobsCount(result.data.mobsCount)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mobs')
      } finally {
        setLoading(false)
      }
    }

    fetchMobs()
  }, [])

  if (loading) return <div className="p-4">Loading mobs...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mobs</h1>
        <div className="text-sm text-gray-500">
          Total: {mobsCount} mobs
        </div>
      </div>

      {mobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No mobs found</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Mob
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {mobs.map((mob) => (
            <div key={mob.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{mob.shortDesc}</h3>
                  <p className="text-sm text-gray-600 mb-2">Keywords: {mob.keywords}</p>
                  <p className="text-gray-700 mb-2 line-clamp-2">{mob.detailedDesc}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Level {mob.level}</span>
                    <span>{mob.hitpointsMax} HP</span>
                    <span>Zone {mob.zoneId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 px-3 py-1 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}