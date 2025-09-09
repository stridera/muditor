'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './zone-editor.css';

import { RoomNode } from './RoomNode';
import { MobNode } from './MobNode';
import { ObjectNode } from './ObjectNode';
import { PropertyPanel } from './PropertyPanel';
import { EntityPalette } from './EntityPalette';

// Grid Configuration
const GRID_SIZE = 180; // Grid cell size in pixels (matches room size)
const GRID_SCALE = 10; // Scale factor: 1 grid unit = 10 pixels

// Helper functions
const snapToGrid = (value: number): number =>
  Math.round(value / GRID_SIZE) * GRID_SIZE;
const pixelsToGrid = (pixels: number): number => Math.round(pixels / GRID_SIZE);
const gridToPixels = (grid: number): number => grid * GRID_SIZE;

// Types
interface Room {
  id: number;
  name: string;
  description: string;
  sector: string;
  zoneId: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: RoomExit[];
  mobs?: Array<{ id: number; name: string; level: number }>;
  objects?: Array<{ id: number; name: string; type: string }>;
}

interface RoomExit {
  id: string;
  direction: string;
  destination: number | null;
  description?: string;
  keyword?: string;
}

interface Zone {
  id: number;
  name: string;
  climate: string;
}

interface Mob {
  id: number;
  name: string;
  level: number;
  race?: string;
  class?: string;
  hitpoints?: number;
  alignment?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'boss';
  roomId?: number;
}

interface ObjectType {
  id: number;
  name: string;
  type: string;
  value?: number;
  weight?: number;
  level?: number;
  material?: string;
  condition?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  roomId?: number;
}

interface EnhancedZoneEditorProps {
  zoneId: number;
}

const nodeTypes = {
  room: RoomNode,
  mob: MobNode,
  object: ObjectNode,
};

const EnhancedZoneEditorFlow: React.FC<EnhancedZoneEditorProps> = ({
  zoneId,
}) => {
  const reactFlowInstance = useReactFlow();

  // State
  const [zone, setZone] = useState<Zone | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mobs, setMobs] = useState<Mob[]>([]);
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [editedRoom, setEditedRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [managingExits, setManagingExits] = useState(false);
  const [showEntityPalette, setShowEntityPalette] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'view' | 'layout'>('edit');
  const [currentZLevel, setCurrentZLevel] = useState<number>(0); // Current floor being viewed

  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Track current node positions to prevent position loss during re-renders
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!zoneId) return;

      try {
        setLoading(true);

        // Fetch zone, rooms, mobs, and objects in parallel
        const [zoneResponse, roomsResponse, mobsResponse, objectsResponse] =
          await Promise.allSettled([
            fetch('http://localhost:4000/graphql', {
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
                variables: { id: zoneId },
              }),
            }),
            fetch('http://localhost:4000/graphql', {
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
                    layoutX
                    layoutY
                    layoutZ
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
                variables: { zoneId: zoneId },
              }),
            }),
            fetch('http://localhost:4000/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                query GetMobsByZone($zoneId: Int!) {
                  mobsByZone(zoneId: $zoneId) {
                    id
                    keywords
                    shortDesc
                    longDesc
                    level
                    mobClass
                    lifeForce
                    raceAlign
                    race
                  }
                }
              `,
                variables: { zoneId: zoneId },
              }),
            }),
            fetch('http://localhost:4000/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                query GetObjectsByZone($zoneId: Int!) {
                  objectsByZone(zoneId: $zoneId) {
                    id
                    keywords
                    shortDesc
                    description
                    type
                    cost
                    weight
                    level
                  }
                }
              `,
                variables: { zoneId: zoneId },
              }),
            }),
          ]);

        // Process zone data
        if (zoneResponse.status === 'fulfilled') {
          const zoneData = await zoneResponse.value.json();
          if (!zoneData.errors) {
            setZone(zoneData.data.zone);
          }
        }

        // Process rooms data
        if (roomsResponse.status === 'fulfilled') {
          const roomsData = await roomsResponse.value.json();
          if (!roomsData.errors) {
            setRooms(roomsData.data.roomsByZone || []);
          }
        }

        // Process mobs data
        if (mobsResponse.status === 'fulfilled') {
          const mobsData = await mobsResponse.value.json();
          if (!mobsData.errors && mobsData.data?.mobsByZone) {
            // Transform API data to match our interface
            const transformedMobs = mobsData.data.mobsByZone.map(
              (mob: any) => ({
                id: mob.id,
                name: mob.shortDesc,
                level: mob.level,
                race: mob.race || 'HUMAN',
                class: mob.mobClass,
                hitpoints: 0, // Not available in current schema
                alignment: mob.lifeForce,
                difficulty:
                  mob.level > 40
                    ? 'boss'
                    : mob.level > 20
                      ? 'hard'
                      : mob.level > 10
                        ? 'medium'
                        : 'easy',
              })
            );
            setMobs(transformedMobs);
          } else {
            console.error('Failed to fetch mobs:', mobsData.errors);
            setMobs([]);
          }
        } else {
          console.error('Mobs API request failed:', mobsResponse.reason);
          setMobs([]);
        }

        // Process objects data
        if (objectsResponse.status === 'fulfilled') {
          const objectsData = await objectsResponse.value.json();
          if (!objectsData.errors && objectsData.data?.objectsByZone) {
            // Transform API data to match our interface
            const transformedObjects = objectsData.data.objectsByZone.map(
              (obj: any) => ({
                id: obj.id,
                name: obj.shortDesc,
                type: obj.type,
                value: obj.cost,
                weight: obj.weight,
                level: obj.level,
                material: 'unknown', // Not available in current schema
                condition: 'good',
                rarity:
                  obj.level > 30
                    ? 'epic'
                    : obj.level > 20
                      ? 'rare'
                      : obj.level > 10
                        ? 'uncommon'
                        : 'common',
              })
            );
            setObjects(transformedObjects);
          } else {
            console.error('Failed to fetch objects:', objectsData.errors);
            setObjects([]);
          }
        } else {
          console.error('Objects API request failed:', objectsResponse.reason);
          setObjects([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zoneId]);

  // Convert rooms to React Flow nodes and edges
  useEffect(() => {
    if (rooms.length === 0) return;

    // Grid-based layout algorithm with saved position support
    const getNodePosition = (room: Room, index: number, total: number) => {
      const roomId = room.id.toString();

      // First priority: Use current position from ref (preserves drag positions)
      if (nodePositionsRef.current[roomId]) {
        return nodePositionsRef.current[roomId];
      }

      // Second priority: Use saved grid position if available (convert to pixels)
      if (room.layoutX !== null && room.layoutY !== null) {
        const position = {
          x: gridToPixels(room.layoutX!),
          y: gridToPixels(room.layoutY!),
        };
        // Store in ref for future use
        nodePositionsRef.current[roomId] = position;
        return position;
      }

      // Third priority: Fallback to auto-layout algorithm (grid-snapped)
      if (total === 1) {
        const position = { x: gridToPixels(2), y: gridToPixels(1) }; // Center position
        nodePositionsRef.current[roomId] = position;
        return position;
      }

      // Place rooms on grid based on exits
      const cols = Math.max(3, Math.ceil(Math.sqrt(total * 1.2)));
      const col = index % cols;
      const row = Math.floor(index / cols);

      const position = {
        x: gridToPixels(col * 2 + 1), // 2 grid spacing (360px) with 1 grid offset
        y: gridToPixels(row * 2 + 1), // 2 grid spacing (360px) with 1 grid offset
      };
      nodePositionsRef.current[roomId] = position;
      return position;
    };

    // Create room nodes with enhanced data
    const newNodes: Node[] = rooms.map((room, index) => {
      return {
        id: room.id.toString(),
        type: 'room',
        position: getNodePosition(room, index, rooms.length),
        data: {
          roomId: room.id,
          name: room.name,
          sector: room.sector,
          description: room.description,
          exits: room.exits,
          mobs: room.mobs || [],
          objects: room.objects || [],
          layoutZ: room.layoutZ,
          room: room,
        },
        draggable: viewMode === 'layout',
      };
    });

    // Create edges from exits with enhanced styling
    const newEdges: Edge[] = [];
    rooms.forEach(room => {
      room.exits.forEach(exit => {
        if (exit.destination && rooms.find(r => r.id === exit.destination)) {
          const edgeStyle = {
            stroke: '#6b7280',
            strokeWidth: 2,
            strokeDasharray: exit.description ? undefined : '5,5',
          };

          newEdges.push({
            id: `${room.id}-${exit.destination}-${exit.direction}`,
            source: room.id.toString(),
            target: exit.destination.toString(),
            label: exit.direction.toLowerCase(),
            type: 'smoothstep',
            animated: false,
            style: edgeStyle,
            labelStyle: {
              fontSize: 10,
              fontWeight: 600,
              backgroundColor: '#ffffff',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: '#6b7280',
            },
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [rooms, viewMode, setNodes, setEdges]);

  // Event handlers
  const onConnect = useCallback(
    (params: Connection) => setEdges(els => addEdge(params, els)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === 'room') {
        const roomId = parseInt(node.id);
        setSelectedRoomId(roomId);
        const room = rooms.find(r => r.id === roomId);
        setEditedRoom(room ? { ...room } : null);
      }
    },
    [rooms]
  );

  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      if (viewMode === 'layout') {
        // Snap to grid and convert to grid coordinates
        const snappedX = snapToGrid(node.position.x);
        const snappedY = snapToGrid(node.position.y);
        const gridX = pixelsToGrid(snappedX);
        const gridY = pixelsToGrid(snappedY);

        console.log(
          `Room ${node.id} moved to grid: (${gridX}, ${gridY}) pixels: (${snappedX}, ${snappedY})`
        );

        // Update node position to snapped position
        setNodes(nodes =>
          nodes.map(n =>
            n.id === node.id
              ? { ...n, position: { x: snappedX, y: snappedY } }
              : n
          )
        );

        // Update the ref to preserve position during re-renders
        nodePositionsRef.current[node.id] = { x: snappedX, y: snappedY };

        // Save grid coordinates to backend
        try {
          const currentRoom = rooms.find(r => r.id === parseInt(node.id));
          const currentZ = currentRoom?.layoutZ ?? 0;

          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
              mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
                updateRoomPosition(id: $id, position: $position) {
                  id
                  layoutX
                  layoutY
                  layoutZ
                }
              }
            `,
              variables: {
                id: parseInt(node.id),
                position: {
                  layoutX: gridX,
                  layoutY: gridY,
                  layoutZ: currentZ, // Preserve current Z level
                },
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.errors) {
              // Update the local rooms state with saved position
              setRooms(prevRooms =>
                prevRooms.map(room =>
                  room.id === parseInt(node.id)
                    ? {
                        ...room,
                        layoutX: gridX,
                        layoutY: gridY,
                        layoutZ: currentZ,
                      }
                    : room
                )
              );
              console.log(
                `✅ Room ${node.id} grid position (${gridX}, ${gridY}) saved successfully`
              );
            } else {
              console.error(
                `❌ Failed to save room ${node.id} position:`,
                data.errors[0].message
              );
            }
          } else {
            console.error(
              `❌ Failed to save room ${node.id} position:`,
              await response.text()
            );
          }
        } catch (error) {
          console.error(`❌ Error saving room ${node.id} position:`, error);
        }
      }
    },
    [viewMode, setNodes, setRooms, rooms]
  );

  const handleRoomChange = useCallback(
    (field: keyof Room, value: string) => {
      if (editedRoom) {
        setEditedRoom({ ...editedRoom, [field]: value });
      }
    },
    [editedRoom]
  );

  const handleSaveRoom = async () => {
    if (!editedRoom || !selectedRoomId) return;

    setSaving(true);
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
              sector: editedRoom.sector,
            },
          },
        }),
      });

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId ? { ...room, ...editedRoom } : room
        )
      );

      console.log('Room saved successfully');
    } catch (err) {
      console.error('Error saving room:', err);
      alert(
        'Error saving room: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExit = async (exitData: {
    direction: string;
    destination: number;
  }) => {
    if (!selectedRoomId) return;

    setManagingExits(true);
    try {
      // Mock API call for now
      const newExit = {
        id: `exit_${selectedRoomId}_${exitData.destination}_${Date.now()}`,
        direction: exitData.direction,
        destination: exitData.destination,
        description: '',
        keyword: '',
      };

      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId
            ? { ...room, exits: [...room.exits, newExit] }
            : room
        )
      );

      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev =>
          prev ? { ...prev, exits: [...prev.exits, newExit] } : null
        );
      }

      console.log('Exit created successfully:', newExit);
    } catch (err) {
      console.error('Error creating exit:', err);
    } finally {
      setManagingExits(false);
    }
  };

  const handleDeleteExit = async (exitId: string) => {
    if (!selectedRoomId) return;

    setManagingExits(true);
    try {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoomId
            ? { ...room, exits: room.exits.filter(exit => exit.id !== exitId) }
            : room
        )
      );

      if (editedRoom?.id === selectedRoomId) {
        setEditedRoom(prev =>
          prev
            ? {
                ...prev,
                exits: prev.exits.filter(exit => exit.id !== exitId),
              }
            : null
        );
      }

      console.log('Exit deleted successfully');
    } catch (err) {
      console.error('Error deleting exit:', err);
    } finally {
      setManagingExits(false);
    }
  };

  const handleUpdateZLevel = async (roomId: number, newZLevel: number) => {
    console.log(`Updating room ${roomId} Z-level to ${newZLevel}`);

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
              updateRoomPosition(id: $id, position: $position) {
                id
                layoutX
                layoutY
                layoutZ
              }
            }
          `,
          variables: {
            id: roomId,
            position: {
              layoutZ: newZLevel,
            },
          },
        }),
      });

      if (response.ok) {
        // Update local state
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.id === roomId ? { ...room, layoutZ: newZLevel } : room
          )
        );

        // Update nodes with new Z-level data
        setNodes(prevNodes =>
          prevNodes.map(node =>
            parseInt(node.id) === roomId
              ? { ...node, data: { ...node.data, layoutZ: newZLevel } }
              : node
          )
        );

        // Update edited room if it's the current room
        if (editedRoom?.id === roomId) {
          setEditedRoom(prev =>
            prev ? { ...prev, layoutZ: newZLevel } : null
          );
        }

        console.log(`✅ Room ${roomId} Z-level updated to ${newZLevel}`);
      } else {
        console.error(
          `❌ Failed to update room ${roomId} Z-level:`,
          await response.text()
        );
      }
    } catch (error) {
      console.error(`❌ Error updating room ${roomId} Z-level:`, error);
    }
  };

  // Keyboard shortcuts for Z-level changes and room navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedRoomId) return;

      // Only handle shortcuts when not typing in an input field
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      const room = rooms.find(r => r.id === selectedRoomId);
      if (!room) return;

      const currentZ = room.layoutZ ?? 0;

      // Handle room navigation in view mode (arrow keys without modifiers)
      if (
        viewMode === 'view' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        const directionMap: { [key: string]: string } = {
          ArrowUp: 'NORTH',
          ArrowDown: 'SOUTH',
          ArrowLeft: 'WEST',
          ArrowRight: 'EAST',
        };

        const direction = directionMap[event.key];
        if (direction) {
          event.preventDefault();

          // Find exit in that direction
          const exit = room.exits.find(e => e.direction === direction);
          if (exit && exit.destination) {
            // Check if destination room exists in our current zone
            const destinationRoom = rooms.find(r => r.id === exit.destination);
            if (destinationRoom) {
              console.log(
                `🧭 Navigating ${direction.toLowerCase()} to room ${exit.destination}: "${destinationRoom.name}"`
              );
              setSelectedRoomId(exit.destination);
              setEditedRoom({ ...destinationRoom });

              // Auto-focus the node in the viewport
              const targetNode = nodes.find(
                n => n.id === exit.destination!.toString()
              );
              if (targetNode && reactFlowInstance) {
                reactFlowInstance.setCenter(
                  targetNode.position.x + 90, // Center of room node
                  targetNode.position.y + 60,
                  { zoom: 1.2, duration: 800 }
                );
              }
            } else {
              console.log(
                `🚫 Cannot navigate ${direction.toLowerCase()}: destination room ${exit.destination} not found in current zone`
              );
            }
          } else {
            console.log(
              `🚫 No exit ${direction.toLowerCase()} from room ${selectedRoomId}`
            );
          }
        }
        return;
      }

      // Handle Z-level shortcuts (with Ctrl/Cmd modifier)
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            handleUpdateZLevel(selectedRoomId, currentZ + 1);
            break;
          case 'ArrowDown':
            event.preventDefault();
            handleUpdateZLevel(selectedRoomId, currentZ - 1);
            break;
          case '0':
            event.preventDefault();
            handleUpdateZLevel(selectedRoomId, 0); // Ground level
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedRoomId,
    rooms,
    handleUpdateZLevel,
    viewMode,
    nodes,
    reactFlowInstance,
  ]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      try {
        const data = JSON.parse(event.dataTransfer.getData('application/json'));
        const { entity, type } = data;

        if (type === 'mob') {
          // Handle mob drop - place in nearest room
          console.log('Dropped mob:', entity, 'at position:', position);
        } else if (type === 'object') {
          // Handle object drop - place in nearest room
          console.log('Dropped object:', entity, 'at position:', position);
        }
      } catch (error) {
        console.warn('Invalid drop data:', error);
      }
    },
    [reactFlowInstance]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const selectedRoom = useMemo(() => editedRoom || null, [editedRoom]);

  // Loading and error states
  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading zone editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='text-red-600 text-xl mb-2'>⚠️</div>
          <p className='text-red-600 font-medium'>Error loading zone</p>
          <p className='text-gray-600 text-sm mt-1'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen flex bg-gray-50'>
      {/* Entity Palette */}
      {showEntityPalette && (
        <EntityPalette
          mobs={mobs}
          objects={objects}
          onMobDragStart={mob => console.log('Mob drag start:', mob)}
          onObjectDragStart={obj => console.log('Object drag start:', obj)}
          zoneId={zoneId}
        />
      )}

      {/* Main React Flow Area */}
      <div className='flex-1 relative'>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          snapToGrid={true}
          snapGrid={[GRID_SIZE, GRID_SIZE]}
          className='bg-gray-50'
        >
          <Controls position='top-left' />
          <MiniMap
            position='top-right'
            nodeColor={node => {
              if (node.type === 'room') return '#374151';
              if (node.type === 'mob') return '#dc2626';
              if (node.type === 'object') return '#2563eb';
              return '#6b7280';
            }}
            maskColor='rgba(0, 0, 0, 0.1)'
            style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
          />
          <Background
            variant={BackgroundVariant.Dots}
            color='#d1d5db'
            gap={GRID_SIZE}
            size={1.5}
          />

          {/* Top Panel */}
          <Panel
            position='top-center'
            className='bg-white shadow-lg rounded-lg border border-gray-200'
          >
            <div className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    {zone?.name} (Zone {zoneId})
                  </h2>
                  <p className='text-sm text-gray-600'>
                    Climate: {zone?.climate} • {rooms.length} rooms •{' '}
                    {mobs.length} mobs • {objects.length} objects
                  </p>
                  {/* Navigation Hints in View Mode */}
                  {viewMode === 'view' &&
                    selectedRoom &&
                    selectedRoom.exits.length > 0 && (
                      <div className='mt-2 flex items-center gap-2 text-xs text-gray-500'>
                        <span>🧭 Available exits:</span>
                        {selectedRoom.exits.map(exit => {
                          const directionIcon =
                            {
                              NORTH: '⬆️',
                              SOUTH: '⬇️',
                              EAST: '➡️',
                              WEST: '⬅️',
                              NORTHEAST: '↗️',
                              NORTHWEST: '↖️',
                              SOUTHEAST: '↘️',
                              SOUTHWEST: '↙️',
                              UP: '🔺',
                              DOWN: '🔻',
                            }[exit.direction] || '➤';

                          const destinationRoom = rooms.find(
                            r => r.id === exit.destination
                          );
                          const isInZone = !!destinationRoom;

                          return (
                            <span
                              key={exit.id}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                                isInZone
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                              title={
                                isInZone
                                  ? `${exit.direction}: ${destinationRoom?.name}`
                                  : `${exit.direction}: Outside zone`
                              }
                            >
                              {directionIcon}
                              <span className='font-medium'>
                                {exit.direction.toLowerCase()}
                              </span>
                            </span>
                          );
                        })}
                        <span className='ml-2 text-gray-400'>
                          Use arrow keys to navigate
                        </span>
                      </div>
                    )}
                </div>

                <div className='flex items-center gap-2'>
                  {/* View Mode Toggle */}
                  <div className='flex bg-gray-100 p-1 rounded-lg'>
                    {[
                      { key: 'edit', label: 'Edit', icon: '✏️' },
                      { key: 'view', label: 'View', icon: '👁️' },
                      { key: 'layout', label: 'Layout', icon: '📐' },
                    ].map(mode => (
                      <button
                        key={mode.key}
                        onClick={() => setViewMode(mode.key as any)}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                          viewMode === mode.key
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span className='mr-1'>{mode.icon}</span>
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {/* Z-Level Controls */}
                  {selectedRoomId && (
                    <div className='flex items-center gap-1 bg-gray-100 p-1 rounded-lg'>
                      <button
                        onClick={() => {
                          const room = rooms.find(r => r.id === selectedRoomId);
                          if (room) {
                            handleUpdateZLevel(
                              selectedRoomId,
                              (room.layoutZ ?? 0) - 1
                            );
                          }
                        }}
                        className='flex items-center justify-center w-7 h-7 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-bold'
                        title='Lower floor (Ctrl+↓)'
                      >
                        ⬇️
                      </button>
                      <div className='px-2 py-1 text-xs font-medium text-gray-700 min-w-[40px] text-center'>
                        Z:{selectedRoom?.layoutZ ?? 0}
                      </div>
                      <button
                        onClick={() => {
                          const room = rooms.find(r => r.id === selectedRoomId);
                          if (room) {
                            handleUpdateZLevel(
                              selectedRoomId,
                              (room.layoutZ ?? 0) + 1
                            );
                          }
                        }}
                        className='flex items-center justify-center w-7 h-7 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-bold'
                        title='Raise floor (Ctrl+↑)'
                      >
                        ⬆️
                      </button>
                    </div>
                  )}

                  {/* Toggle Entity Palette */}
                  <button
                    onClick={() => setShowEntityPalette(!showEntityPalette)}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      showEntityPalette
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🎨 Palette
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Property Panel */}
      {selectedRoom && (
        <PropertyPanel
          room={selectedRoom}
          allRooms={rooms}
          onRoomChange={handleRoomChange}
          onSaveRoom={handleSaveRoom}
          onCreateExit={handleCreateExit}
          onDeleteExit={handleDeleteExit}
          onUpdateZLevel={handleUpdateZLevel}
          saving={saving}
          managingExits={managingExits}
        />
      )}
    </div>
  );
};

// Mock data generators removed - now using real API data

// Wrapper component with ReactFlowProvider
export const EnhancedZoneEditor: React.FC<EnhancedZoneEditorProps> = props => {
  return (
    <ReactFlowProvider>
      <EnhancedZoneEditorFlow {...props} />
    </ReactFlowProvider>
  );
};
