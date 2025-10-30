import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface ZoneBounds {
  id: number;
  name: string;
  climate: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
  roomCount: number;
}

interface WorldMapZoneProps {
  data: {
    zoneId: number;
    name: string;
    climate: string;
    roomCount: number;
    bounds: ZoneBounds;
    width?: number;
    height?: number;
    onZoneSelect?: (zoneId: number) => void;
  };
}

const getClimateColor = (climate: string) => {
  const colors = {
    TEMPERATE: '#4ade80',     // Green
    DESERT: '#f59e0b',        // Amber
    ARID: '#f59e0b',          // Amber
    ARCTIC: '#06b6d4',        // Cyan
    SUBARCTIC: '#0891b2',     // Dark cyan
    SWAMP: '#84cc16',         // Lime
    TROPICAL: '#eab308',      // Yellow
    SUBTROPICAL: '#facc15',   // Light yellow
    OCEANIC: '#3b82f6',       // Blue
    ALPINE: '#8b5cf6',        // Purple
    SEMIARID: '#f97316',      // Orange
    NONE: '#6b7280',          // Gray
  };
  return colors[climate as keyof typeof colors] || '#6b7280';
};

export const WorldMapZone: React.FC<WorldMapZoneProps> = ({ data }) => {
  const { zoneId, name, climate, roomCount, bounds, width: providedWidth, height: providedHeight, onZoneSelect } = data;
  const [isHovered, setIsHovered] = useState(false);

  const color = getClimateColor(climate);

  // Calculate actual room distribution dimensions
  const boundsWidth = Math.max(1, Math.abs(bounds.maxX - bounds.minX));
  const boundsHeight = Math.max(1, Math.abs(bounds.maxY - bounds.minY));

  // Better scaling that considers room density and actual coordinates
  // Use a base scale that ensures all rooms are properly represented
  const roomDensity = roomCount / (boundsWidth * boundsHeight);
  const baseScale = Math.max(8, Math.min(25, 15 + Math.log10(roomDensity + 1) * 5));

  // Calculate dimensions that properly encompass all rooms
  // Add minimum size to ensure small zones are still visible and readable
  const minZoneSize = 180; // Minimum zone size for readability
  const maxZoneSize = 400; // Maximum zone size to prevent huge boxes

  const width = providedWidth || Math.max(minZoneSize, Math.min(maxZoneSize, boundsWidth * baseScale + 80));
  const height = providedHeight || Math.max(minZoneSize * 0.75, Math.min(maxZoneSize * 0.75, boundsHeight * baseScale + 80));

  const handleClick = () => {
    if (onZoneSelect) {
      onZoneSelect(zoneId);
    }
  };

  return (
    <>
      <div
        className="world-map-zone cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: color,
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="zone-name text-white font-bold text-center leading-tight"
          style={{
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '95%',
            fontSize: Math.min(24, Math.max(14, width / 8)), // More conservative text scaling
            padding: '4px 8px',
            minHeight: '24px',
          }}
        >
          {name}
        </div>
        <div
          className="zone-info text-white mt-1 text-center font-semibold"
          style={{
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            fontSize: Math.min(16, Math.max(12, width / 12)), // More conservative scaling
            minHeight: '18px',
          }}
        >
          Zone {zoneId}
        </div>
        <div
          className="room-count text-white opacity-90 font-medium"
          style={{
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
            fontSize: Math.min(14, Math.max(10, width / 15)), // More conservative scaling
            minHeight: '16px',
          }}
        >
          {roomCount} rooms
        </div>

        {/* Climate badge */}
        <div
          className="climate-badge px-2 py-1 rounded mt-1 font-medium"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            color: 'white',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
            fontSize: Math.min(12, Math.max(9, width / 18)), // More conservative scaling
            minWidth: '80px', // Reduced minimum width to fit better
            minHeight: '24px', // Reduced height
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {climate}
        </div>
      </div>

      {/* Hover popup */}
      {isHovered && (
        <div
          className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-600 pointer-events-none"
          style={{
            top: '20px',
            right: '20px',
            minWidth: '250px',
            maxWidth: '350px',
            fontSize: '14px',
            lineHeight: '1.4',
          }}
        >
          <div className="font-bold text-lg mb-2">{name}</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Zone ID:</span> {zoneId}</div>
            <div><span className="font-semibold">Climate:</span> {climate}</div>
            <div><span className="font-semibold">Rooms:</span> {roomCount}</div>
            <div><span className="font-semibold">Bounds:</span> ({bounds.minX}, {bounds.minY}) to ({bounds.maxX}, {bounds.maxY})</div>
            <div><span className="font-semibold">Center:</span> ({bounds.centerX.toFixed(1)}, {bounds.centerY.toFixed(1)})</div>
          </div>
        </div>
      )}
    </>
  );
};