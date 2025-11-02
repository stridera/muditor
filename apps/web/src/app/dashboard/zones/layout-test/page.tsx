'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { LayoutVisualization } from '@/components/LayoutVisualization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  autoLayoutRooms,
  calculateLayoutQuality,
  detectOverlaps,
  resolveOverlaps,
} from '@/lib/auto-layout';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// GraphQL queries for zones and rooms
const GET_ZONES = gql`
  query GetZones {
    zones {
      id
      name
      climate
    }
  }
`;

const GET_ROOMS_BY_ZONE = gql`
  query GetRoomsByZone($zoneId: Int!) {
    roomsByZone(zoneId: $zoneId) {
      id
      name
      roomDescription
      layoutX
      layoutY
      layoutZ
      exits {
        direction
        destination
      }
    }
  }
`;

interface Room {
  id: number;
  name?: string;
  roomDescription?: string;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: Array<{
    direction: string;
    destination: number | null;
  }>;
}

interface Zone {
  id: number;
  name: string;
  climate: string;
}

interface LayoutPosition {
  x: number;
  y: number;
  z?: number;
}

interface ZonesQueryResult {
  zones: Zone[];
}

interface RoomsQueryResult {
  roomsByZone: Room[];
}

export default function LayoutTestPage() {
  const {
    data: zonesData,
    loading: zonesLoading,
    error: zonesError,
    refetch: refetchZones,
  } = useQuery<ZonesQueryResult>(GET_ZONES);
  const [selectedMode, setSelectedMode] = useState<'zone' | 'world'>('zone');
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [selectedStartRoom, setSelectedStartRoom] = useState<number | null>(
    null
  );
  const [layoutResults, setLayoutResults] = useState<{
    positions: Record<number, LayoutPosition>;
    overlaps: any[];
    quality: number;
    roomCount: number;
  } | null>(null);
  const [highlightedRoom, setHighlightedRoom] = useState<number | null>(null);

  // Query rooms for selected zone
  const {
    data: roomsData,
    loading: roomsLoading,
    error: roomsError,
  } = useQuery<RoomsQueryResult>(GET_ROOMS_BY_ZONE, {
    variables: { zoneId: selectedZone },
    skip: !selectedZone || selectedMode === 'world',
  });

  const zones: Zone[] = zonesData?.zones || [];
  const zoneRooms: Room[] = roomsData?.roomsByZone || [];

  // Get current rooms based on mode
  const currentRooms: Room[] = useMemo(() => {
    if (selectedMode === 'world') {
      // For world mode, we'll need to fetch all rooms - for now return empty
      // This would require a separate query to get all rooms across all zones
      return [];
    } else if (selectedMode === 'zone' && selectedZone) {
      return zoneRooms;
    }
    return [];
  }, [selectedMode, selectedZone, zoneRooms]);

  // Auto-select first zone when zones load
  useEffect(() => {
    if (zones.length > 0 && selectedZone === null) {
      setSelectedZone(zones[0].id);
    }
  }, [zones, selectedZone]);

  // Run layout algorithm
  const runLayoutAlgorithm = () => {
    if (currentRooms.length === 0) return;

    console.log(`🚀 Running layout algorithm for ${currentRooms.length} rooms`);
    console.log(
      `📍 Mode: ${selectedMode}`,
      selectedMode === 'zone' ? `(Zone ${selectedZone})` : '(All zones)'
    );
    console.log(`🎯 Start room: ${selectedStartRoom || 'auto-select'}`);

    // Run auto-layout
    const positions = autoLayoutRooms(
      currentRooms,
      selectedStartRoom || undefined
    );

    // Resolve overlaps
    const resolvedPositions = resolveOverlaps(positions);

    // Detect remaining overlaps
    const overlaps = detectOverlaps(resolvedPositions);

    // Calculate quality
    const quality = calculateLayoutQuality(resolvedPositions, currentRooms);

    setLayoutResults({
      positions: resolvedPositions,
      overlaps,
      quality,
      roomCount: currentRooms.length,
    });

    console.log(
      `✅ Layout complete: ${Object.keys(resolvedPositions).length} positioned, ${overlaps.length} overlaps, quality: ${quality.toFixed(2)}`
    );
  };

  // Auto-run when rooms change
  useEffect(() => {
    if (currentRooms.length > 0) {
      runLayoutAlgorithm();
    }
  }, [currentRooms, selectedStartRoom]);

  // Handle room click from visual layout
  const handleRoomClick = (roomId: number) => {
    setHighlightedRoom(roomId);

    // Scroll to the room in the list
    const roomElement = document.getElementById(`room-${roomId}`);
    if (roomElement) {
      roomElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedRoom(null);
    }, 3000);
  };

  const currentZone = selectedZone
    ? zones.find(z => z.id === selectedZone)
    : null;

  const loading =
    zonesLoading || (selectedMode === 'zone' && selectedZone && roomsLoading);
  const error = zonesError || roomsError;

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4'></div>
          <p className='text-gray-600'>Loading zones and rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>
            Error loading data: {error.message}
          </p>
          <Button
            onClick={() => {
              refetchZones();
              // Refetch rooms will be triggered automatically when zone changes
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requireImmortal={true}>
      <div
        className='w-full -mx-4 px-6 py-6'
        style={{
          width: 'calc(100vw - 2rem)',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
        }}
      >
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center space-x-2 text-sm text-gray-500 mb-2'>
            <Link href='/dashboard' className='hover:text-gray-700'>
              Dashboard
            </Link>
            <span>›</span>
            <Link href='/dashboard/zones' className='hover:text-gray-700'>
              Zones
            </Link>
            <span>›</span>
            <span className='text-gray-900 font-medium'>Layout Test</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Room Layout Algorithm Test
          </h1>
          <p className='text-gray-600'>
            Test and fine-tune the automatic room positioning algorithm
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Controls */}
          <div className='lg:col-span-1 space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Controls</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Mode Selection */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Layout Mode</label>
                  <Select
                    value={selectedMode}
                    onValueChange={(value: 'zone' | 'world') =>
                      setSelectedMode(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='zone'>Single Zone</SelectItem>
                      <SelectItem value='world'>Entire World</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Zone Selection (if zone mode) */}
                {selectedMode === 'zone' && (
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Zone</label>
                    <Select
                      value={selectedZone?.toString() || ''}
                      onValueChange={value => setSelectedZone(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a zone' />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map(zone => (
                          <SelectItem key={zone.id} value={zone.id.toString()}>
                            Zone {zone.id}: {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Start Room Selection */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Start Room</label>
                  <Select
                    value={selectedStartRoom?.toString() || 'auto'}
                    onValueChange={value =>
                      setSelectedStartRoom(
                        value === 'auto' ? null : parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Auto-select' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='auto'>Auto-select (Smart)</SelectItem>
                      {currentRooms.map(room => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          Room {room.id}: {room.name || 'Unnamed'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Run Button */}
                <Button
                  onClick={runLayoutAlgorithm}
                  className='w-full'
                  disabled={currentRooms.length === 0}
                >
                  🔄 Rerun Algorithm
                </Button>

                <Button
                  onClick={() => refetchZones()}
                  variant='outline'
                  className='w-full'
                >
                  🔃 Refresh Data
                </Button>
              </CardContent>
            </Card>

            {/* Current Selection Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Current Selection</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <div className='text-sm font-medium'>Mode</div>
                  <Badge
                    variant={selectedMode === 'world' ? 'default' : 'secondary'}
                  >
                    {selectedMode === 'world' ? 'Entire World' : 'Single Zone'}
                  </Badge>
                </div>

                {selectedMode === 'zone' && currentZone && (
                  <div>
                    <div className='text-sm font-medium'>Zone</div>
                    <div className='text-sm text-gray-600'>
                      {currentZone.name} (ID: {currentZone.id})
                    </div>
                  </div>
                )}

                <div>
                  <div className='text-sm font-medium'>Rooms</div>
                  <div className='text-sm text-gray-600'>
                    {currentRooms.length} total
                  </div>
                </div>

                {selectedStartRoom && (
                  <div>
                    <div className='text-sm font-medium'>Start Room</div>
                    <div className='text-sm text-gray-600'>
                      {currentRooms.find(r => r.id === selectedStartRoom)
                        ?.name || `Room ${selectedStartRoom}`}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Algorithm Notes */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Algorithm Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 text-sm text-gray-600'>
                  <p>
                    • <strong>Quality Score:</strong> Lower is better (path
                    length + overlap penalty)
                  </p>
                  <p>
                    • <strong>Smart Start:</strong> Auto-selects rooms with most
                    connections or "entrance" keywords
                  </p>
                  <p>
                    • <strong>Direction Mapping:</strong> Uses 2-unit spacing to
                    prevent overlaps
                  </p>
                  <p>
                    • <strong>Z-Levels:</strong> UP/DOWN exits maintain X/Y
                    position, change Z-level
                  </p>
                  <p>
                    • <strong>Unconnected Rooms:</strong> Placed in separate
                    grid area at (5,0) onwards
                  </p>
                  <p>
                    • <strong>Overlap Resolution:</strong> Uses spiral search
                    pattern around conflicts
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results and Visualization */}
          <div className='lg:col-span-3 space-y-4'>
            {/* Layout Statistics */}
            {layoutResults && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Layout Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {layoutResults.roomCount}
                      </div>
                      <div className='text-sm text-gray-600'>Total Rooms</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {Object.keys(layoutResults.positions).length}
                      </div>
                      <div className='text-sm text-gray-600'>Positioned</div>
                    </div>
                    <div className='text-center'>
                      <div
                        className={`text-2xl font-bold ${layoutResults.overlaps.length > 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {layoutResults.overlaps.length}
                      </div>
                      <div className='text-sm text-gray-600'>Overlaps</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {layoutResults.quality.toFixed(1)}
                      </div>
                      <div className='text-sm text-gray-600'>Quality Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overlap Details */}
            {layoutResults && layoutResults.overlaps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg text-red-600'>
                    Overlaps Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {layoutResults.overlaps.map((overlap, index) => (
                      <div
                        key={index}
                        className='p-3 bg-red-50 rounded-lg border border-red-200'
                      >
                        <div className='text-sm font-medium text-red-800'>
                          Position ({overlap.position.x}, {overlap.position.y},
                          Z{overlap.position.z || 0})
                        </div>
                        <div className='text-sm text-red-600'>
                          {overlap.count} rooms: {overlap.roomIds.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Room Positions and Visual Layout Side by Side */}
            {layoutResults && (
              <div
                className='grid grid-cols-1 xl:grid-cols-2 gap-4'
                style={{ height: 'calc(100vh - 500px)' }}
              >
                {/* Room List with Positions */}
                <Card className='h-full flex flex-col overflow-hidden'>
                  <CardHeader className='flex-shrink-0'>
                    <CardTitle className='text-lg'>
                      Room Positions ({currentRooms.length} rooms)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='flex-1 overflow-hidden p-4'>
                    <div className='h-full overflow-y-auto'>
                      <div className='space-y-2'>
                        {currentRooms.map(room => {
                          const position = layoutResults.positions[room.id];
                          const isHighlighted = highlightedRoom === room.id;
                          return (
                            <div
                              key={room.id}
                              id={`room-${room.id}`}
                              className={`p-3 border rounded-lg transition-colors duration-300 ${
                                isHighlighted
                                  ? 'bg-blue-100 border-blue-400 shadow-md'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className='flex items-center justify-between mb-2'>
                                <div>
                                  <div className='font-medium'>
                                    Room {room.id}
                                  </div>
                                  <div className='text-sm text-gray-600'>
                                    {room.name || 'Unnamed'} •{' '}
                                    {room.exits.length} exits
                                  </div>
                                </div>
                                <div className='text-right'>
                                  {position ? (
                                    <div className='text-sm font-mono'>
                                      ({position.x}, {position.y}, Z
                                      {position.z || 0})
                                    </div>
                                  ) : (
                                    <div className='text-sm text-red-600'>
                                      Not positioned
                                    </div>
                                  )}
                                </div>
                              </div>
                              {room.exits.length > 0 && (
                                <div className='text-xs text-gray-500'>
                                  <div className='font-medium mb-1'>Exits:</div>
                                  <div className='grid grid-cols-2 gap-1'>
                                    {room.exits.map((exit, exitIndex) => (
                                      <div
                                        key={exitIndex}
                                        className='flex justify-between'
                                      >
                                        <span className='font-mono'>
                                          {exit.direction}:
                                        </span>
                                        <span>{exit.destination ?? 'none'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Layout */}
                <Card className='h-full overflow-hidden'>
                  <CardHeader className='flex-shrink-0'>
                    <CardTitle className='text-lg'>Visual Layout</CardTitle>
                  </CardHeader>
                  <CardContent className='p-0 flex-1 overflow-hidden'>
                    {currentRooms.length > 0 ? (
                      <LayoutVisualization
                        rooms={currentRooms}
                        positions={layoutResults.positions}
                        overlaps={layoutResults.overlaps}
                        selectedStartRoom={selectedStartRoom}
                        onRoomClick={handleRoomClick}
                      />
                    ) : (
                      <div className='h-96 flex items-center justify-center text-gray-500'>
                        <div className='text-center'>
                          <p className='text-lg font-medium'>No Layout Data</p>
                          <p className='text-sm'>
                            Run the algorithm to see visualization
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
