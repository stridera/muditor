import React, { useEffect, useRef, useCallback } from 'react';

interface Room {
  id: number;
  layoutX: number | null;
  layoutY: number | null;
  name?: string;
  sector?: string;
}

interface CanvasRoomRendererProps {
  rooms: Room[];
  viewport: { x: number; y: number; zoom: number };
  width: number;
  height: number;
  gridToPixels: (grid: number) => number;
  gridToPixelsY: (grid: number) => number;
  onRoomHover?: (roomId: number | null) => void;
  onRoomClick?: (roomId: number) => void;
}

export const CanvasRoomRenderer: React.FC<CanvasRoomRendererProps> = ({
  rooms,
  viewport,
  width,
  height,
  gridToPixels,
  gridToPixelsY,
  onRoomHover,
  onRoomClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hoveredRoomRef = useRef<number | null>(null);

  // Room dimensions
  const ROOM_WIDTH = 180;
  const ROOM_HEIGHT = 140;

  // Draw all visible rooms on canvas
  const drawRooms = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Save context state
    ctx.save();

    // Apply viewport transform
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Calculate visible bounds for culling
    const bufferMultiplier = 1.5;
    const minX = -viewport.x / viewport.zoom - width * bufferMultiplier;
    const maxX = -viewport.x / viewport.zoom + width * (1 + bufferMultiplier);
    const minY = -viewport.y / viewport.zoom - height * bufferMultiplier;
    const maxY = -viewport.y / viewport.zoom + height * (1 + bufferMultiplier);

    // Filter visible rooms
    const visibleRooms = rooms
      .filter(room => room.layoutX !== null && room.layoutY !== null)
      .map(room => ({
        room,
        x: gridToPixels(room.layoutX!),
        y: gridToPixelsY(room.layoutY!),
      }))
      .filter(({ x, y }) => x >= minX && x <= maxX && y >= minY && y <= maxY);

    // Draw rooms
    visibleRooms.forEach(({ room, x, y }) => {
      const isHovered = hoveredRoomRef.current === room.id;

      // Draw room rectangle
      ctx.fillStyle = isHovered ? '#ffffff' : '#f9fafb';
      ctx.strokeStyle = isHovered ? '#3b82f6' : '#9ca3af';
      ctx.lineWidth = isHovered ? 3 : 2;

      ctx.fillRect(x, y, ROOM_WIDTH, ROOM_HEIGHT);
      ctx.strokeRect(x, y, ROOM_WIDTH, ROOM_HEIGHT);

      // Draw room ID (only if zoomed in enough to read)
      if (viewport.zoom > 0.3) {
        ctx.fillStyle = '#6b7280';
        ctx.font = `${12 / viewport.zoom}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`Room ${room.id}`, x + 8, y + 8);
      }
    });

    // Restore context state
    ctx.restore();
  }, [rooms, viewport, width, height, gridToPixels, gridToPixelsY]);

  // Redraw when viewport or rooms change
  useEffect(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Schedule draw on next frame
    animationFrameRef.current = requestAnimationFrame(drawRooms);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawRooms]);

  // Handle mouse move for hover detection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onRoomHover) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convert mouse coordinates to world coordinates
      const worldX = (mouseX - viewport.x) / viewport.zoom;
      const worldY = (mouseY - viewport.y) / viewport.zoom;

      // Find room under mouse
      let foundRoom: number | null = null;
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
          foundRoom = room.id;
          break;
        }
      }

      if (foundRoom !== hoveredRoomRef.current) {
        hoveredRoomRef.current = foundRoom;
        onRoomHover(foundRoom);
        drawRooms();
      }
    },
    [rooms, viewport, gridToPixels, gridToPixelsY, onRoomHover, drawRooms]
  );

  // Handle mouse click for room selection
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onRoomClick) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convert mouse coordinates to world coordinates
      const worldX = (mouseX - viewport.x) / viewport.zoom;
      const worldY = (mouseY - viewport.y) / viewport.zoom;

      // Find room under mouse
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
          onRoomClick(room.id);
          break;
        }
      }
    },
    [rooms, viewport, gridToPixels, gridToPixelsY, onRoomClick]
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ cursor: hoveredRoomRef.current ? 'pointer' : 'default' }}
      className='absolute inset-0'
    />
  );
};
