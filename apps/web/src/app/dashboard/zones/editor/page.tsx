'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

// Types
interface Room {
  id: number
  name: string
  description: string
  sector: string
  zoneId: number
  exits: RoomExit[]
}

interface RoomExit {
  direction: string
  destination: number | null
  description?: string
  keyword?: string
}

interface Zone {
  id: number
  name: string
  climate: string
}

// Custom Room Node Component
const RoomNode = ({ data }: { data: { roomId: number; name: string; sector: string; room: Room } }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border border-gray-300 min-w-[120px]">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-sm font-bold text-gray-900">
            Room {data.roomId}
          </div>
          <div className="text-xs text-gray-600 truncate max-w-[100px]">
            {data.name}
          </div>
          <div className="text-xs text-blue-600">
            {data.sector}
          </div>
        </div>
      </div>
    </div>
  )
}

// Create Room Form Component
const CreateRoomForm = ({ 
  onSubmit, 
  onCancel, 
  creating 
}: { 
  onSubmit: (data: { name: string; description: string; sector: string }) => void;
  onCancel: () => void;
  creating: boolean;
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sector, setSector] = useState('STRUCTURE')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && description.trim()) {
      onSubmit({ name: name.trim(), description: description.trim(), sector })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter room name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter room description"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sector Type
        </label>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="STRUCTURE">Structure</option>
          <option value="FIELD">Field</option>
          <option value="FOREST">Forest</option>
          <option value="HILLS">Hills</option>
          <option value="MOUNTAIN">Mountain</option>
          <option value="WATER">Water</option>
          <option value="SWAMP">Swamp</option>
          <option value="CITY">City</option>
          <option value="ROAD">Road</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={creating || !name.trim() || !description.trim()}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : 'Create Room'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Create Exit Form Component
const CreateExitForm = ({ 
  rooms,
  onSubmit, 
  onCancel, 
  creating 
}: { 
  rooms: Room[];
  onSubmit: (data: { direction: string; destination: number }) => void;
  onCancel: () => void;
  creating: boolean;
}) => {
  const [direction, setDirection] = useState('NORTH')
  const [destination, setDestination] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const destinationId = parseInt(destination)
    if (direction && destinationId && rooms.find(r => r.id === destinationId)) {
      onSubmit({ direction, destination: destinationId })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Direction
        </label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="NORTH">North</option>
          <option value="SOUTH">South</option>
          <option value="EAST">East</option>
          <option value="WEST">West</option>
          <option value="UP">Up</option>
          <option value="DOWN">Down</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destination Room
        </label>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select destination room...</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.id}: {room.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={creating || !direction || !destination}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : 'Create Exit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

const nodeTypes = {
  room: RoomNode,
}

export default function ZoneEditorPage() {
  const searchParams = useSearchParams()
  const zoneId = searchParams.get('zone') ? parseInt(searchParams.get('zone')!) : null
  
  const [zone, setZone] = useState<Zone | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [editedRoom, setEditedRoom] = useState<Room | null>(null)
  const [saving, setSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingExitId, setEditingExitId] = useState<string | null>(null)
  const [showCreateExit, setShowCreateExit] = useState(false)
  const [managingExits, setManagingExits] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Fetch zone and room data
  useEffect(() => {
    const fetchData = async () => {
      if (!zoneId) return
      
      try {
        setLoading(true)
        
        // Fetch zone data
        const zoneResponse = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetZone($id: Int!) {
                zone(id: $id) {
                  id
                  name
                  climate
                }
              }
            `,
            variables: { id: zoneId }
          })
        })

        const zoneData = await zoneResponse.json()
        if (zoneData.errors) {
          throw new Error(zoneData.errors[0].message)
        }
        
        setZone(zoneData.data.zone)
        
        // Fetch rooms data from API
        const roomsResponse = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetRoomsByZone($zoneId: Int!) {
                roomsByZone(zoneId: $zoneId) {
                  id
                  name
                  description
                  sector
                  exits {
                    id
                    direction
                    destination
                    description
                    keyword
                  }
                }
              }
            `,
            variables: { zoneId: zoneId }
          })
        })

        const roomsData = await roomsResponse.json()
        if (roomsData.errors) {
          console.warn('Rooms query error:', roomsData.errors[0].message)
          // Fallback to empty rooms array if no rooms exist for this zone
          setRooms([])
        } else {
          setRooms(roomsData.data.roomsByZone || [])
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [zoneId])

  // Convert rooms to React Flow nodes and edges
  useEffect(() => {
    if (rooms.length === 0) return

    // Better layout algorithm for room positioning
    const getNodePosition = (index: number, total: number) => {
      const cols = Math.ceil(Math.sqrt(total))
      const col = index % cols
      const row = Math.floor(index / cols)
      
      return {
        x: col * 250 + 100,
        y: row * 180 + 100
      }
    }

    // Create nodes
    const newNodes: Node[] = rooms.map((room, index) => ({
      id: room.id.toString(),
      type: 'room',
      position: getNodePosition(index, rooms.length),
      data: {
        roomId: room.id,
        name: room.name,
        sector: room.sector,
        room: room
      },
    }))

    // Create edges from exits
    const newEdges: Edge[] = []
    rooms.forEach(room => {
      room.exits.forEach(exit => {
        if (exit.destination && rooms.find(r => r.id === exit.destination)) {
          newEdges.push({
            id: `${room.id}-${exit.destination}`,
            source: room.id.toString(),
            target: exit.destination.toString(),
            label: exit.direction.toLowerCase(),
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#374151', strokeWidth: 2 },
            labelStyle: { fontSize: 10, fontWeight: 600 }
          })
        }
      })
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }, [rooms, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const roomId = parseInt(node.id)
    setSelectedRoomId(roomId)
    const room = rooms.find(r => r.id === roomId)
    setEditedRoom(room ? { ...room } : null)
  }, [rooms])

  const selectedRoom = useMemo(() => {
    return editedRoom || null
  }, [editedRoom])

  const handleRoomChange = (field: keyof Room, value: string) => {
    if (editedRoom) {
      setEditedRoom({ ...editedRoom, [field]: value })
    }
  }

  const handleSaveRoom = async () => {
    if (!editedRoom || !selectedRoomId) return
    
    setSaving(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateRoom($id: Int!, $data: UpdateRoomInput!) {
              updateRoom(id: $id, data: $data) {
                id
                name
                description
                sector
              }
            }
          `,
          variables: {
            id: selectedRoomId,
            data: {
              name: editedRoom.name,
              description: editedRoom.description,
              sector: editedRoom.sector
            }
          }
        })
      })

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      // Update the rooms array with the saved changes
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === selectedRoomId 
            ? { ...room, ...editedRoom }
            : room
        )
      )

      console.log('Room saved successfully')
    } catch (err) {
      console.error('Error saving room:', err)
      alert('Error saving room: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const generateNewRoomId = (): number => {
    if (!zoneId) return 0
    
    // Generate room ID based on zone ID and existing rooms
    // Format: ZZRRR (ZZ = zone ID, RRR = room sequence)
    const baseId = zoneId * 100
    const existingIds = rooms.map(r => r.id)
    
    // Find the next available ID in the zone range
    for (let i = 1; i <= 999; i++) {
      const candidateId = baseId + i
      if (!existingIds.includes(candidateId)) {
        return candidateId
      }
    }
    
    return baseId + 1 // fallback
  }

  const handleCreateRoom = async (roomData: { name: string; description: string; sector: string }) => {
    if (!zoneId) return
    
    setCreating(true)
    try {
      const newRoomId = generateNewRoomId()
      
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateRoom($data: CreateRoomInput!) {
              createRoom(data: $data) {
                id
                name
                description
                sector
                exits {
                  id
                  direction
                  destination
                  description
                  keyword
                }
              }
            }
          `,
          variables: {
            data: {
              id: newRoomId,
              name: roomData.name,
              description: roomData.description,
              sector: roomData.sector,
              zoneId: zoneId
            }
          }
        })
      })

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      const newRoom: Room = data.data.createRoom
      setRooms(prevRooms => [...prevRooms, newRoom])
      setShowCreateForm(false)
      
      console.log('Room created successfully:', newRoom)
    } catch (err) {
      console.error('Error creating room:', err)
      alert('Error creating room: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setCreating(false)
    }
  }

  const handleCreateExit = async (exitData: { direction: string; destination: number }) => {
    if (!selectedRoomId) return
    
    setManagingExits(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateRoomExit($data: CreateRoomExitInput!) {
              createRoomExit(data: $data) {
                id
                direction
                destination
                description
                keyword
              }
            }
          `,
          variables: {
            data: {
              roomId: selectedRoomId,
              direction: exitData.direction,
              destination: exitData.destination
            }
          }
        })
      })

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      const newExit = data.data.createRoomExit
      
      // Update the rooms array with the new exit
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === selectedRoomId 
            ? { ...room, exits: [...room.exits, newExit] }
            : room
        )
      )

      // Update edited room if it's the selected room
      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev => prev ? { ...prev, exits: [...prev.exits, newExit] } : null)
      }

      setShowCreateExit(false)
      console.log('Exit created successfully:', newExit)
    } catch (err) {
      console.error('Error creating exit:', err)
      alert('Error creating exit: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setManagingExits(false)
    }
  }

  const handleDeleteExit = async (exitId: string) => {
    if (!selectedRoomId) return
    
    setManagingExits(true)
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation DeleteRoomExit($exitId: String!) {
              deleteRoomExit(exitId: $exitId) {
                id
                direction
                destination
              }
            }
          `,
          variables: {
            exitId: exitId
          }
        })
      })

      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      // Update the rooms array to remove the exit
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === selectedRoomId 
            ? { ...room, exits: room.exits.filter(exit => exit.id !== exitId) }
            : room
        )
      )

      // Update edited room if it's the selected room  
      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev => prev ? { 
          ...prev, 
          exits: prev.exits.filter(exit => exit.id !== exitId) 
        } : null)
      }

      console.log('Exit deleted successfully')
    } catch (err) {
      console.error('Error deleting exit:', err)
      alert('Error deleting exit: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setManagingExits(false)
    }
  }

  if (!zoneId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-yellow-800 font-medium">No Zone Selected</h3>
          <p className="text-yellow-600 text-sm mt-1">
            Please select a zone to edit by adding ?zone=ID to the URL
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Main React Flow Area */}
      <div className="flex-1 relative">
        {rooms.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Rooms Found
              </h3>
              <p className="text-gray-600 mb-4">
                Zone {zoneId} ({zone?.name}) doesn&apos;t have any rooms yet.
              </p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Room
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Controls position="top-left" />
          <MiniMap 
            position="top-right"
            nodeColor="#374151"
            maskColor="rgba(0, 0, 0, 0.2)"
            style={{ backgroundColor: '#f9fafb' }}
          />
          <Background color="#e5e7eb" gap={20} />
          
          <Panel position="top-center" className="bg-white shadow-lg rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {zone?.name} (Zone {zoneId})
                </h2>
                <p className="text-sm text-gray-600">
                  Climate: {zone?.climate} • {rooms.length} rooms
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
              >
                + Add Room
              </button>
            </div>
          </Panel>
        </ReactFlow>
        )}
      </div>

      {/* Room Creation Form */}
      {showCreateForm && (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Room
            </h3>
            <CreateRoomForm 
              onSubmit={handleCreateRoom}
              onCancel={() => setShowCreateForm(false)}
              creating={creating}
            />
          </div>
        </div>
      )}

      {/* Right Sidebar - Room Details */}
      {selectedRoom && !showCreateForm && (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Room {selectedRoom.id}
            </h3>
            <input
              type="text"
              value={selectedRoom.name}
              onChange={(e) => handleRoomChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Room name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={selectedRoom.description}
              onChange={(e) => handleRoomChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Room description"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector Type
            </label>
            <select
              value={selectedRoom.sector}
              onChange={(e) => handleRoomChange('sector', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STRUCTURE">Structure</option>
              <option value="FIELD">Field</option>
              <option value="FOREST">Forest</option>
              <option value="HILLS">Hills</option>
              <option value="MOUNTAIN">Mountain</option>
              <option value="WATER">Water</option>
              <option value="SWAMP">Swamp</option>
              <option value="CITY">City</option>
              <option value="ROAD">Road</option>
            </select>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Exits</h4>
              <button
                onClick={() => setShowCreateExit(true)}
                disabled={managingExits}
                className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                + Add Exit
              </button>
            </div>

            {showCreateExit ? (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Create New Exit</h5>
                <CreateExitForm
                  rooms={rooms}
                  onSubmit={handleCreateExit}
                  onCancel={() => setShowCreateExit(false)}
                  creating={managingExits}
                />
              </div>
            ) : (
              <div className="space-y-2">
                {selectedRoom.exits.map((exit, index) => (
                  <div key={exit.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium">{exit.direction}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        → Room {exit.destination || 'None'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteExit(exit.id)}
                      disabled={managingExits}
                      className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {selectedRoom.exits.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No exits defined</p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button 
              onClick={handleSaveRoom}
              disabled={saving}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}