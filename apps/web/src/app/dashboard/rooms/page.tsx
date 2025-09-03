'use client'

import { useQuery, gql } from '@apollo/client'
import Link from 'next/link'

const GET_ROOMS = gql`
  query GetRooms($take: Int) {
    rooms(take: $take) {
      id
      name
      description
      sector
      roomFlags
      zoneId
    }
    roomsCount
  }
`

export default function RoomsPage() {
  const { loading, error, data } = useQuery(GET_ROOMS, {
    variables: { take: 50 } // Limit to first 50 rooms for performance
  })

  if (loading) return <div className="p-4">Loading rooms...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {data?.rooms?.length || 0} of {data?.roomsCount || 0} rooms
          </div>
          <Link 
            href="/dashboard/zones/editor?zone=511"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Visual Zone Editor
          </Link>
        </div>
      </div>

      {data?.rooms?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No rooms found</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Room
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.rooms?.map((room: any) => (
            <div key={room.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">{room.name}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full uppercase">
                      {room.sector}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2 line-clamp-2">{room.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Room #{room.id}</span>
                    <span>Zone {room.zoneId}</span>
                    {room.roomFlags && room.roomFlags.length > 0 && (
                      <span>Flags: {room.roomFlags.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link 
                    href={`/dashboard/zones/editor?zone=${room.zoneId}&room=${room.id}`}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm"
                  >
                    Edit
                  </Link>
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