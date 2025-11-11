'use client';

import { useEffect, useRef, useState } from 'react';

interface Room {
  id: number;
  name?: string;
  exits: Array<{
    direction: string;
    destination: number | null;
  }>;
}

interface LayoutPosition {
  x: number;
  y: number;
  z?: number;
}

interface LayoutVisualizationProps {
  rooms: Room[];
  positions: Record<number, LayoutPosition>;
  overlaps: any[];
  selectedStartRoom?: number | null;
  onRoomClick?: (roomId: number) => void;
}

const GRID_SIZE = 60; // Size of each grid cell in pixels
const ROOM_SIZE = 40; // Size of room nodes
const CONNECTION_COLOR = '#94a3b8'; // Gray color for connections
const ROOM_COLOR = '#3b82f6'; // Blue color for rooms
const START_ROOM_COLOR = '#10b981'; // Green color for start room
const OVERLAP_COLOR = '#ef4444'; // Red color for overlapping rooms

export function LayoutVisualization({
  rooms,
  positions,
  overlaps,
  selectedStartRoom,
  onRoomClick,
}: LayoutVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const [selectedZLevel, setSelectedZLevel] = useState<number | 'all'>('all');

  // Convert grid coordinates to SVG coordinates
  const gridToSvg = (gridX: number, gridY: number) => {
    return {
      x: gridX * GRID_SIZE + 400, // Center offset
      y: gridY * GRID_SIZE + 300, // Center offset
    };
  };

  // Get unique Z-levels for filtering
  const availableZLevels = Array.from(
    new Set(Object.values(positions).map(pos => pos.z || 0))
  ).sort((a, b) => a - b);

  // Get room positions in SVG coordinates, filtered by Z-level
  const allRoomPositions = Object.entries(positions).map(([roomIdStr, pos]) => {
    const roomId = parseInt(roomIdStr);
    const room = rooms.find(r => r.id === roomId);
    const svgPos = gridToSvg(pos.x, pos.y);

    return {
      id: roomId,
      room,
      gridPos: pos,
      svgPos,
      isStartRoom: roomId === selectedStartRoom,
      hasOverlap: overlaps.some(overlap => overlap.roomIds.includes(roomId)),
    };
  });

  // Filter by selected Z-level
  const roomPositions =
    selectedZLevel === 'all'
      ? allRoomPositions
      : allRoomPositions.filter(
          roomPos => (roomPos.gridPos.z || 0) === selectedZLevel
        );

  // Calculate connections between rooms (only show connections on current Z-level)
  const connections = roomPositions.flatMap(roomPos => {
    if (!roomPos.room) return [];

    return roomPos.room.exits
      .filter(exit => {
        const destPos =
          exit.destination != null ? positions[exit.destination] : undefined;
        if (!destPos) return false;
        const destZLevel = destPos.z || 0;
        const currentZLevel = roomPos.gridPos.z || 0;

        // If filtering by specific Z-level, only show connections within that level
        if (selectedZLevel !== 'all') {
          return (
            destZLevel === selectedZLevel && currentZLevel === selectedZLevel
          );
        }

        // If showing all levels, show all connections
        return true;
      })
      .map(exit => {
        const destPos =
          exit.destination != null ? positions[exit.destination] : undefined;
        if (!destPos) return null; // Guard against undefined
        const destSvgPos = gridToSvg(destPos.x, destPos.y);

        return {
          from: roomPos.svgPos,
          to: destSvgPos,
          direction: exit.direction,
          fromRoom: roomPos.id,
          toRoom: exit.destination!,
        };
      })
      .filter(Boolean) as Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      direction: string;
      fromRoom: number;
      toRoom: number;
    }>;
  });

  // Auto-fit view to show all rooms
  useEffect(() => {
    if (roomPositions.length === 0) return;

    const minX = Math.min(...roomPositions.map(r => r.svgPos.x)) - 100;
    const maxX = Math.max(...roomPositions.map(r => r.svgPos.x)) + 100;
    const minY = Math.min(...roomPositions.map(r => r.svgPos.y)) - 100;
    const maxY = Math.max(...roomPositions.map(r => r.svgPos.y)) + 100;

    const width = maxX - minX;
    const height = maxY - minY;

    setViewBox({ x: minX, y: minY, width, height });
  }, [positions, rooms]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.2));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setLastPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPan(pan);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setPan({
      x: lastPan.x + deltaX / zoom,
      y: lastPan.y + deltaY / zoom,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleRoomClick = (roomId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering pan
    if (onRoomClick) {
      onRoomClick(roomId);
    }
  };

  if (roomPositions.length === 0) {
    return (
      <div className='h-full flex items-center justify-center bg-gray-50 rounded-lg border'>
        <div className='text-center text-gray-500'>
          <p className='text-lg font-medium'>No Layout Data</p>
          <p className='text-sm'>Run the algorithm to see room positions</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-white rounded-lg border'>
      {/* Controls */}
      <div className='flex items-center justify-between p-3 border-b bg-gray-50'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Layout Visualization</span>
          <span className='text-xs text-gray-500'>
            {roomPositions.length} rooms • Zoom: {(zoom * 100).toFixed(0)}%
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {/* Z-Level Filter */}
          <div className='flex items-center gap-1'>
            <span className='text-xs text-gray-600'>Z-Level:</span>
            <select
              value={selectedZLevel}
              onChange={e =>
                setSelectedZLevel(
                  e.target.value === 'all' ? 'all' : parseInt(e.target.value)
                )
              }
              className='px-1 py-0.5 text-xs border rounded'
            >
              <option value='all'>
                All ({availableZLevels.length} levels)
              </option>
              {availableZLevels.map(level => (
                <option key={level} value={level}>
                  Z{level} (
                  {
                    allRoomPositions.filter(r => (r.gridPos.z || 0) === level)
                      .length
                  }{' '}
                  rooms)
                </option>
              ))}
            </select>
          </div>

          {/* Zoom Controls */}
          <div className='flex items-center gap-1'>
            <button
              onClick={handleZoomIn}
              className='px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50'
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className='px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50'
            >
              −
            </button>
            <button
              onClick={handleReset}
              className='px-2 py-1 text-xs bg-white border rounded hover:bg-gray-50'
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className='flex items-center gap-4 px-3 py-2 text-xs border-b bg-gray-50'>
        <div className='flex items-center gap-1'>
          <div
            className='w-3 h-3 rounded'
            style={{ backgroundColor: ROOM_COLOR }}
          ></div>
          <span>Room</span>
        </div>
        <div className='flex items-center gap-1'>
          <div
            className='w-3 h-3 rounded'
            style={{ backgroundColor: START_ROOM_COLOR }}
          ></div>
          <span>Start Room</span>
        </div>
        <div className='flex items-center gap-1'>
          <div
            className='w-3 h-3 rounded'
            style={{ backgroundColor: OVERLAP_COLOR }}
          ></div>
          <span>Overlap</span>
        </div>
        <div className='flex items-center gap-1'>
          <div
            className='w-4 h-0.5'
            style={{ backgroundColor: CONNECTION_COLOR }}
          ></div>
          <span>Exit</span>
        </div>
        <div className='flex items-center gap-1'>
          <svg width='12' height='12' viewBox='0 0 12 12'>
            <polygon
              points='6,2 4,6 8,6'
              fill='white'
              stroke={ROOM_COLOR}
              strokeWidth='1'
            />
          </svg>
          <span>UP</span>
        </div>
        <div className='flex items-center gap-1'>
          <svg width='12' height='12' viewBox='0 0 12 12'>
            <polygon
              points='6,10 4,6 8,6'
              fill='white'
              stroke={ROOM_COLOR}
              strokeWidth='1'
            />
          </svg>
          <span>DOWN</span>
        </div>
      </div>

      {/* SVG Visualization */}
      <div className='flex-1 overflow-hidden'>
        <svg
          ref={svgRef}
          className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id='grid'
              width={GRID_SIZE}
              height={GRID_SIZE}
              patternUnits='userSpaceOnUse'
            >
              <path
                d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
                fill='none'
                stroke='#f1f5f9'
                strokeWidth='1'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#grid)' />

          {/* Connections (drawn first so they appear behind rooms) */}
          {connections.map((conn, index) => (
            <line
              key={`${conn.fromRoom}-${conn.toRoom}-${index}`}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke={CONNECTION_COLOR}
              strokeWidth='2'
              strokeOpacity='0.6'
            />
          ))}

          {/* Rooms */}
          {roomPositions.map(roomPos => {
            const color = roomPos.hasOverlap
              ? OVERLAP_COLOR
              : roomPos.isStartRoom
                ? START_ROOM_COLOR
                : ROOM_COLOR;

            // Check for UP/DOWN exits
            const hasUpExit = roomPos.room?.exits.some(
              exit => exit.direction.toLowerCase() === 'up'
            );
            const hasDownExit = roomPos.room?.exits.some(
              exit => exit.direction.toLowerCase() === 'down'
            );

            return (
              <g key={roomPos.id}>
                {/* Room node */}
                <circle
                  cx={roomPos.svgPos.x}
                  cy={roomPos.svgPos.y}
                  r={ROOM_SIZE / 2}
                  fill={color}
                  stroke='white'
                  strokeWidth='2'
                  opacity='0.9'
                  style={{ cursor: 'pointer' }}
                  onClick={e => handleRoomClick(roomPos.id, e)}
                />

                {/* UP exit indicator */}
                {hasUpExit && (
                  <polygon
                    points={`${roomPos.svgPos.x},${roomPos.svgPos.y - ROOM_SIZE / 2 - 6} ${roomPos.svgPos.x - 4},${roomPos.svgPos.y - ROOM_SIZE / 2 - 12} ${roomPos.svgPos.x + 4},${roomPos.svgPos.y - ROOM_SIZE / 2 - 12}`}
                    fill='white'
                    stroke={color}
                    strokeWidth='1'
                  />
                )}

                {/* DOWN exit indicator */}
                {hasDownExit && (
                  <polygon
                    points={`${roomPos.svgPos.x},${roomPos.svgPos.y + ROOM_SIZE / 2 + 6} ${roomPos.svgPos.x - 4},${roomPos.svgPos.y + ROOM_SIZE / 2 + 12} ${roomPos.svgPos.x + 4},${roomPos.svgPos.y + ROOM_SIZE / 2 + 12}`}
                    fill='white'
                    stroke={color}
                    strokeWidth='1'
                  />
                )}

                {/* Room ID */}
                <text
                  x={roomPos.svgPos.x}
                  y={roomPos.svgPos.y}
                  textAnchor='middle'
                  dominantBaseline='middle'
                  fill='white'
                  fontSize='10'
                  fontWeight='bold'
                >
                  {roomPos.id}
                </text>

                {/* Z-level indicator */}
                {roomPos.gridPos.z && roomPos.gridPos.z !== 0 && (
                  <text
                    x={roomPos.svgPos.x}
                    y={roomPos.svgPos.y - ROOM_SIZE / 2 - 8}
                    textAnchor='middle'
                    fill={color}
                    fontSize='8'
                    fontWeight='bold'
                  >
                    Z{roomPos.gridPos.z}
                  </text>
                )}

                {/* Room name (on hover) */}
                {roomPos.room?.name && (
                  <title>
                    Room {roomPos.id}: {roomPos.room.name}
                    {roomPos.gridPos.z ? ` (Z${roomPos.gridPos.z})` : ''}
                    {roomPos.hasOverlap ? ' - OVERLAP!' : ''}
                    {hasUpExit ? ' - Has UP exit' : ''}
                    {hasDownExit ? ' - Has DOWN exit' : ''}
                  </title>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Status info */}
      <div className='px-3 py-2 text-xs text-gray-600 border-t bg-gray-50'>
        Grid coordinates • Each square = 1 unit • Click and drag to pan • Use
        zoom controls above
      </div>
    </div>
  );
}
