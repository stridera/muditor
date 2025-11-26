'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { authenticatedGraphQLFetch } from '@/lib/authenticated-fetch';
import {
  gridToPixels,
  gridToPixelsY,
} from '@/components/ZoneEditor/editor-constants';

interface Room {
  id: number;
  zoneId: number;
  name: string;
  layoutX: number | null;
  layoutY: number | null;
  sector?: string;
}

interface Zone {
  id: number;
  name: string;
}

interface WorldMapCanvasProps {
  onZoneClick: (zoneId: number) => void;
  onLoadingChange: (loading: boolean) => void;
  options?: {
    zoneGlow?: boolean;
    zoneOutline?: boolean;
    zoneLabels?: boolean;
    roomGlow?: boolean;
  };
}

// Sector color mapping
const SECTOR_COLORS: Record<string, string> = {
  STRUCTURE: '#475569',
  FIELD: '#4ade80',
  FOREST: '#16a34a',
  HILLS: '#ea580c',
  MOUNTAIN: '#6b7280',
  WATER: '#2563eb',
  SWAMP: '#0d9488',
  CITY: '#7c3aed',
  ROAD: '#ca8a04',
};

const getSectorColorHex = (sector: string): string => {
  const key = sector.toUpperCase();
  return SECTOR_COLORS[key] || '#94a3b8';
};

const alphaColor = (color: string, alpha: number): string => {
  if (color.startsWith('#')) return hexToRgba(color, alpha);
  if (color.startsWith('hsl'))
    return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
  if (color.startsWith('rgb'))
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  return color;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace('#', '');
  const fullHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map(c => c + c)
          .join('')
      : normalized;
  const int = parseInt(fullHex, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const zoneTintForId = (zoneId: number): string => {
  const hue = (zoneId * 47) % 360;
  return `hsla(${hue}, 70%, 65%, 0.15)`;
};

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({
  onZoneClick,
  onLoadingChange,
  options,
}) => {
  const {
    zoneGlow = true,
    zoneOutline = true,
    zoneLabels = true,
    roomGlow = false,
  } = options || {};

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const minZoomRef = useRef<number>(0.01); // Store minimum zoom to fit all rooms
  const viewportUpdateRef = useRef<number | null>(null); // Throttle viewport updates
  const [isInteracting, setIsInteracting] = useState(false); // Track if user is zooming/panning
  const interactionTimeoutRef = useRef<number | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<number | null>(null);
  const zoneBoundsRef = useRef<
    Map<number, { minX: number; maxX: number; minY: number; maxY: number }>
  >(new Map());

  // Room dimensions
  const ROOM_WIDTH = 180;
  const ROOM_HEIGHT = 140;

  // Fetch all rooms for world map
  useEffect(() => {
    const fetchRooms = async () => {
      onLoadingChange(true);
      try {
        const result = await authenticatedGraphQLFetch(
          `
            query WorldMapData($take: Int) {
              zones {
                id
                name
              }
              rooms(lightweight: true, take: $take) {
                id
                zoneId
                name
                layoutX
                layoutY
                sector
              }
            }
          `,
          { take: 120000 }
        );

        console.log('GraphQL response:', result);

        if (result.data?.rooms) {
          console.log('Fetched rooms:', result.data.rooms.length);
          setRooms(result.data.rooms);
        } else {
          console.warn('No rooms in response. Full response:', result);
        }

        if (result.data?.zones) {
          console.log('Fetched zones:', result.data.zones.length);
          setZones(result.data.zones);
        }
      } catch (error) {
        console.error('Failed to fetch world map rooms:', error);
      } finally {
        onLoadingChange(false);
      }
    };

    fetchRooms();
  }, [onLoadingChange]);

  // Center viewport on rooms when they load
  useEffect(() => {
    if (rooms.length === 0 || !containerRef.current) {
      console.log('No rooms or container yet');
      return;
    }

    console.log('Centering on', rooms.length, 'rooms');

    const roomsWithLayout = rooms.filter(
      r => r.layoutX !== null && r.layoutY !== null
    );
    if (roomsWithLayout.length === 0) {
      console.log('No rooms with layout');
      return;
    }

    console.log('Rooms with layout:', roomsWithLayout.length);

    // Sample rooms for bounding box to avoid processing 130K rooms
    const sampleSize = Math.min(1000, roomsWithLayout.length);
    const step = Math.floor(roomsWithLayout.length / sampleSize);
    const sampledRooms = roomsWithLayout.filter((_, i) => i % step === 0);

    // Calculate bounding box from sample
    const xs = sampledRooms.map(r => gridToPixels(r.layoutX!));
    const ys = sampledRooms.map(r => gridToPixelsY(r.layoutY!));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    console.log('Bounding box:', { minX, maxX, minY, maxY });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Get container size
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = rect.width;
    const viewportHeight = rect.height;

    // Calculate zoom to fit all rooms
    const roomsWidth = maxX - minX + ROOM_WIDTH;
    const roomsHeight = maxY - minY + ROOM_HEIGHT;
    const zoomX = viewportWidth / (roomsWidth * 1.1);
    const zoomY = viewportHeight / (roomsHeight * 1.1);
    const fitZoom = Math.min(zoomX, zoomY, 1);

    console.log('Viewport:', { centerX, centerY, fitZoom });

    // Store the fit zoom as minimum zoom level
    minZoomRef.current = fitZoom * 0.9; // Allow zooming out slightly beyond fit

    // Center viewport
    const x = viewportWidth / 2 - centerX * fitZoom;
    const y = viewportHeight / 2 - centerY * fitZoom;

    console.log('Setting viewport to:', { x, y, zoom: fitZoom });
    setViewport({ x, y, zoom: fitZoom });
  }, [rooms]);

  // Helper to draw rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Draw rooms on canvas
  const drawRooms = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas with layered dark background
    const bgGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    bgGradient.addColorStop(0, '#0c1626');
    bgGradient.addColorStop(1, '#0d1a2d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply viewport transform
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Calculate visible bounds for culling (in world coordinates)
    const buffer = 1000; // Extra buffer in world coordinates to avoid edge clipping
    const minX = -viewport.x / viewport.zoom - buffer;
    const maxX = (rect.width - viewport.x) / viewport.zoom + buffer;
    const minY = -viewport.y / viewport.zoom - buffer;
    const maxY = (rect.height - viewport.y) / viewport.zoom + buffer;

    // Draw only visible rooms, and deduplicate by (x,y) position to skip overlaps
    const visibleRooms = rooms.filter(room => {
      if (room.layoutX === null || room.layoutY === null) return false;
      const x = gridToPixels(room.layoutX);
      const y = gridToPixelsY(room.layoutY);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    });

    // Deduplicate by position - only keep first room at each (x,y) coordinate
    const seenPositions = new Set<string>();
    const uniqueRooms = visibleRooms.filter(room => {
      const key = `${room.layoutX},${room.layoutY}`;
      if (seenPositions.has(key)) return false;
      seenPositions.add(key);
      return true;
    });

    // Group unique rooms by zone and calculate bounding boxes
    const roomsByZone = new Map<number, typeof uniqueRooms>();
    const zoneBounds = new Map<
      number,
      { minX: number; maxX: number; minY: number; maxY: number }
    >();
    const zoneStyles = new Map<
      number,
      { color: string; dominantSector?: string }
    >();
    const zoneLabelsToDraw: Array<{
      zoneId: number;
      bounds: { minX: number; maxX: number; minY: number; maxY: number };
      color: string;
    }> = [];

    uniqueRooms.forEach(room => {
      if (!roomsByZone.has(room.zoneId)) {
        roomsByZone.set(room.zoneId, []);
      }
      roomsByZone.get(room.zoneId)!.push(room);
    });

    // Calculate bounding boxes for each zone (for hover detection)
    roomsByZone.forEach((zoneRooms, zoneId) => {
      const xs = zoneRooms.map(r => gridToPixels(r.layoutX!));
      const ys = zoneRooms.map(r => gridToPixelsY(r.layoutY!));
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs) + ROOM_WIDTH;
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys) + ROOM_HEIGHT;
      zoneBounds.set(zoneId, { minX, maxX, minY, maxY });

      // Determine dominant sector for color-coding zones
      const sectorCounts = new Map<string, number>();
      zoneRooms.forEach(r => {
        if (!r.sector) return;
        const key = r.sector.toUpperCase();
        sectorCounts.set(key, (sectorCounts.get(key) || 0) + 1);
      });
      const dominantSector = [...sectorCounts.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];
      const color = dominantSector
        ? getSectorColorHex(dominantSector)
        : `hsl(${(zoneId * 53) % 360} 70% 65%)`;
      zoneStyles.set(zoneId, { color, dominantSector });
    });

    // Store in ref for hover detection
    zoneBoundsRef.current = zoneBounds;

    // Draw zone auras with glowing effect
    const showZoneGlow = zoneGlow && viewport.zoom > 0.015 && !isInteracting;
    if (showZoneGlow) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      roomsByZone.forEach((zoneRooms, zoneId) => {
        const bounds = zoneBounds.get(zoneId);
        if (!bounds) return;

        const zoneColor =
          zoneStyles.get(zoneId)?.color ||
          `hsl(${(zoneId * 47) % 360} 80% 65%)`;
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        const radius =
          Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) *
            0.75 +
          ROOM_WIDTH;
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.3,
          centerX,
          centerY,
          radius
        );

        gradient.addColorStop(0, alphaColor(zoneColor, 0.32));
        gradient.addColorStop(0.55, alphaColor(zoneColor, 0.18));
        gradient.addColorStop(1, 'rgba(12, 22, 38, 0)');

        ctx.fillStyle = gradient;
        ctx.filter = `blur(${Math.min(120, Math.max(28, radius * 0.18))}px)`;
        ctx.fillRect(
          centerX - radius,
          centerY - radius,
          radius * 2,
          radius * 2
        );

        // Zone outline to separate regions
        if (zoneOutline || zoneLabels) {
          const pad = ROOM_WIDTH * 0.25;
          const zoneW = bounds.maxX - bounds.minX;
          const zoneH = bounds.maxY - bounds.minY;
          ctx.filter = 'none';
          ctx.globalCompositeOperation = 'source-over';

          if (zoneOutline) {
            ctx.strokeStyle = alphaColor(zoneColor, 0.55);
            ctx.lineWidth = Math.max(2, 4 / viewport.zoom);
            ctx.setLineDash([10 / viewport.zoom, 14 / viewport.zoom]);
            ctx.strokeRect(
              bounds.minX - pad,
              bounds.minY - pad,
              zoneW + pad * 2,
              zoneH + pad * 2
            );
            ctx.setLineDash([]);
          }

          // Zone label at higher zooms
          if (zoneLabels && viewport.zoom > 0.05) {
            zoneLabelsToDraw.push({ zoneId, bounds, color: zoneColor });
          }
        }
      });

      ctx.restore();
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
    }

    // Draw rooms with simple glassy appearance (only unique positions)
    const showRoomGlow = roomGlow && viewport.zoom > 0.02;
    const cornerRadius = Math.min(8 / viewport.zoom, ROOM_WIDTH / 4);

    uniqueRooms.forEach(room => {
      const x = gridToPixels(room.layoutX!);
      const y = gridToPixelsY(room.layoutY!);

      // Use sector color if available, otherwise default
      const sectorColor = room.sector
        ? getSectorColorHex(room.sector)
        : '#94a3b8';

      const zoneColor = zoneStyles.get(room.zoneId)?.color;

      // Optional per-room glow for brightness without tanking perf
      if (showRoomGlow) {
        ctx.shadowColor = hexToRgba(sectorColor, 0.55);
        ctx.shadowBlur = Math.min(22, 10 / viewport.zoom);
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      // Draw room base with sector color and soft highlight
      const baseGradient = ctx.createLinearGradient(x, y, x, y + ROOM_HEIGHT);
      baseGradient.addColorStop(0, hexToRgba(sectorColor, 0.95));
      baseGradient.addColorStop(1, hexToRgba(sectorColor, 0.8));
      ctx.fillStyle = baseGradient;
      roundRect(ctx, x, y, ROOM_WIDTH, ROOM_HEIGHT, cornerRadius);
      ctx.fill();

      // Reset shadows for overlays to stay crisp
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Zone tint overlay to unify rooms in a zone
      ctx.fillStyle = zoneColor
        ? alphaColor(zoneColor, 0.22)
        : zoneTintForId(room.zoneId);
      roundRect(ctx, x, y, ROOM_WIDTH, ROOM_HEIGHT, cornerRadius);
      ctx.fill();

      // Add subtle highlight for glass effect
      const glossHeight = ROOM_HEIGHT * 0.35;
      const glossGradient = ctx.createLinearGradient(x, y, x, y + glossHeight);
      glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = glossGradient;
      roundRect(ctx, x, y, ROOM_WIDTH, ROOM_HEIGHT, cornerRadius);
      ctx.fill();

      // Draw subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = Math.max(0.6, 1 / viewport.zoom);
      roundRect(ctx, x, y, ROOM_WIDTH, ROOM_HEIGHT, cornerRadius);
      ctx.stroke();
    });

    // Draw zone labels above rooms for readability
    if (zoneLabels && zoneLabelsToDraw.length) {
      ctx.save();
      zoneLabelsToDraw.forEach(({ zoneId, bounds, color }) => {
        const pad = ROOM_WIDTH * 0.25;
        const label =
          zones.find(z => z.id === zoneId)?.name || `Zone ${zoneId}`;
        const labelX = bounds.minX - pad + 12 / viewport.zoom;
        const labelY = bounds.minY - pad + 28 / viewport.zoom;
        const fontSize = Math.max(12, 18 / viewport.zoom);

        ctx.font = `bold ${fontSize}px sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const textPad = 10 / viewport.zoom;
        ctx.fillStyle = 'rgba(0, 10, 18, 0.8)';
        ctx.fillRect(
          labelX - textPad / 2,
          labelY - fontSize,
          textWidth + textPad,
          fontSize + textPad
        );
        ctx.strokeStyle = alphaColor(color, 0.9);
        ctx.lineWidth = Math.max(1, 2 / viewport.zoom);
        ctx.strokeRect(
          labelX - textPad / 2,
          labelY - fontSize,
          textWidth + textPad,
          fontSize + textPad
        );
        ctx.fillStyle = '#e5e7eb';
        ctx.textBaseline = 'top';
        ctx.fillText(label, labelX, labelY - fontSize + textPad / 2);
      });
      ctx.restore();
    }

    // Draw info text
    ctx.restore();
    ctx.fillStyle = '#ffffff'; // White text on dark background
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Rooms: ${rooms.length} | Visible: ${uniqueRooms.length} | Zoom: ${(viewport.zoom * 100).toFixed(0)}%`,
      10,
      20
    );

    // Draw zone name tooltip if hovering
    if (hoveredZoneId !== null) {
      const zone = zones.find(z => z.id === hoveredZoneId);
      if (zone) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        const text = `Zone ${zone.id}: ${zone.name}`;
        ctx.font = 'bold 16px sans-serif';
        const metrics = ctx.measureText(text);
        const padding = 12;
        const tooltipWidth = metrics.width + padding * 2;
        const tooltipHeight = 32;
        const tooltipX = 20;
        const tooltipY = 60;

        // Draw tooltip background
        ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
        ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, tooltipX + padding, tooltipY + tooltipHeight / 2);
        ctx.restore();
      }
    }

    console.log(
      `Drew ${uniqueRooms.length} unique rooms (${visibleRooms.length - uniqueRooms.length} overlaps skipped) out of ${rooms.length} total`
    );
  }, [rooms, viewport, isInteracting, hoveredZoneId, zones]);

  // Redraw on viewport or rooms change
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(drawRooms);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawRooms]);

  // Handle mouse wheel for zoom (throttled with RAF)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mark as interacting
    setIsInteracting(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
    }, 150);

    // Cancel any pending update
    if (viewportUpdateRef.current) {
      cancelAnimationFrame(viewportUpdateRef.current);
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Schedule update on next frame
    viewportUpdateRef.current = requestAnimationFrame(() => {
      setViewport(prev => {
        // Zoom towards mouse position
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(
          minZoomRef.current,
          Math.min(2, prev.zoom * zoomFactor)
        );

        // Adjust viewport to zoom towards mouse
        const worldXBefore = (mouseX - prev.x) / prev.zoom;
        const worldYBefore = (mouseY - prev.y) / prev.zoom;
        const worldXAfter = (mouseX - prev.x) / newZoom;
        const worldYAfter = (mouseY - prev.y) / newZoom;

        return {
          zoom: newZoom,
          x: prev.x + (worldXAfter - worldXBefore) * newZoom,
          y: prev.y + (worldYAfter - worldYBefore) * newZoom,
        };
      });
      viewportUpdateRef.current = null;
    });
  }, []);

  // Handle mouse down for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    },
    [viewport]
  );

  // Handle mouse move for panning and hover detection (throttled with RAF)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Detect hovered zone using bounding boxes (even when not panning)
      if (!isPanning) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const worldX = (mouseX - viewport.x) / viewport.zoom;
          const worldY = (mouseY - viewport.y) / viewport.zoom;

          // Find zone whose bounding box contains the mouse
          let foundZoneId: number | null = null;
          for (const [zoneId, bounds] of zoneBoundsRef.current.entries()) {
            if (
              worldX >= bounds.minX &&
              worldX <= bounds.maxX &&
              worldY >= bounds.minY &&
              worldY <= bounds.maxY
            ) {
              foundZoneId = zoneId;
              break;
            }
          }

          if (foundZoneId !== hoveredZoneId) {
            setHoveredZoneId(foundZoneId);
          }
        }
        return;
      }

      // Mark as interacting
      setIsInteracting(true);
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      interactionTimeoutRef.current = window.setTimeout(() => {
        setIsInteracting(false);
      }, 150);

      // Cancel any pending update
      if (viewportUpdateRef.current) {
        cancelAnimationFrame(viewportUpdateRef.current);
      }

      // Schedule update on next frame
      viewportUpdateRef.current = requestAnimationFrame(() => {
        setViewport(prev => ({
          ...prev,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }));
        viewportUpdateRef.current = null;
      });
    },
    [isPanning, panStart, viewport, hoveredZoneId]
  );

  // Handle mouse up to stop panning
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    // Clear interaction flag after a brief delay
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsInteracting(false);
    }, 150);
  }, []);

  // Handle click to navigate to zone
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) return; // Don't navigate if we were panning

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convert to world coordinates
      const worldX = (mouseX - viewport.x) / viewport.zoom;
      const worldY = (mouseY - viewport.y) / viewport.zoom;

      // Find clicked room
      for (const room of rooms) {
        if (room.layoutX === null || room.layoutY === null) continue;

        const x = gridToPixels(room.layoutX);
        const y = gridToPixelsY(room.layoutY);

        if (
          worldX >= x &&
          worldX <= x + ROOM_WIDTH &&
          worldY >= y &&
          worldY <= y + ROOM_HEIGHT
        ) {
          onZoneClick(room.zoneId);
          break;
        }
      }
    },
    [rooms, viewport, isPanning, onZoneClick]
  );

  return (
    <div ref={containerRef} className='w-full h-full'>
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        className='w-full h-full'
      />
    </div>
  );
};
