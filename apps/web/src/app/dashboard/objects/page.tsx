'use client'

import { useQuery, gql } from '@apollo/client'

const GET_OBJECTS = gql`
  query GetObjects {
    objects {
      id
      type
      keywords
      shortDesc
      description
      level
      weight
      cost
      zoneId
    }
    objectsCount
  }
`

export default function ObjectsPage() {
  const { loading, error, data } = useQuery(GET_OBJECTS)

  if (loading) return <div className="p-4">Loading objects...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Objects</h1>
        <div className="text-sm text-gray-500">
          Total: {data?.objectsCount || 0} objects
        </div>
      </div>

      {data?.objects?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No objects found</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Object
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.objects?.map((object: any) => (
            <div key={object.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">{object.shortDesc}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full uppercase">
                      {object.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Keywords: {object.keywords}</p>
                  <p className="text-gray-700 mb-2 line-clamp-2">{object.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Level {object.level}</span>
                    <span>{object.weight} lbs</span>
                    <span>{object.cost} coins</span>
                    <span>Zone {object.zoneId}</span>
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