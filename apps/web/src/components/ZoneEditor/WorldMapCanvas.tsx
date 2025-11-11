import React, { useCallback, useEffect, useRef } from 'react';

interface WorldMapRoom {
  id: number;
  name: string;
  sector: string;
  zoneId: number;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
}

interface CanvasCluster {
  rooms: WorldMapRoom[];
  centerX: number;
  centerY: number;
  dominantSector: string;
  size: number;
}

interface WorldMapCanvasProps {
  clusters: CanvasCluster[];
  zoom: number;
  onRoomClick?: (roomId: number) => void;
  className?: string;
}

const getSectorColor = (sector: string): string => {
  const colors = {
    // Basic terrain
    structure: '#8b7355', // Brown - buildings/structures
    field: '#90EE90', // Light green - open fields
    forest: '#228B22', // Forest green - wooded areas
    hills: '#9ACD32', // Yellow green - hilly terrain
    mountain: '#8B7D6B', // Gray brown - mountainous
    water_swim: '#4169E1', // Royal blue - swimmable water
    water_noswim: '#000080', // Navy - deep water
    underwater: '#006994', // Deep blue - underwater areas
    flying: '#87CEEB', // Sky blue - aerial areas
    desert: '#F4A460', // Sandy brown - desert
    road: '#696969', // Dim gray - roads/paths
    entrance: '#FFD700', // Gold - entrances/gates
    swamp: '#556B2F', // Dark olive - swampy areas
    jungle: '#006400', // Dark green - dense jungle
    tundra: '#E0E0E0', // Light gray - tundra
    arctic: '#F0F8FF', // Alice blue - arctic
    prairie: '#ADFF2F', // Green yellow - prairie
    ocean: '#1E90FF', // Dodger blue - ocean
    river: '#00CED1', // Dark turquoise - rivers
    lake: '#4682B4', // Steel blue - lakes
    beach: '#F5DEB3', // Wheat - sandy beaches
    cave: '#2F4F4F', // Dark slate gray - caves
    inside: '#D2B48C', // Tan - indoor areas
    city: '#C0C0C0', // Silver - urban areas
    farmland: '#ADFF2F', // Green yellow - farmland
    ruins: '#8B8682', // Gray - ruined areas
    magical: '#9370DB', // Medium purple - magical areas
    volcanic: '#DC143C', // Crimson - volcanic areas
    ice: '#B0E0E6', // Powder blue - icy areas
    snow: '#FFFAFA', // Snow - snowy areas
    mud: '#8B4513', // Saddle brown - muddy areas
    sand: '#F5E050', // Light sandy - sandy areas
    stone: '#708090', // Slate gray - stone areas
    grass: '#32CD32', // Lime green - grassy areas
    dirt: '#8B4513', // Saddle brown - dirt paths
    gravel: '#A9A9A9', // Dark gray - gravel
    air: '#E6E6FA', // Lavender - air/sky
    void: '#000000', // Black - void areas
    lava: '#FF4500', // Orange red - lava
    quicksand: '#DAA520', // Goldenrod - quicksand
    brambles: '#228B22', // Forest green - thorny areas
    garden: '#98FB98', // Pale green - gardens
    courtyard: '#F0E68C', // Khaki - courtyards
    corridor: '#D2B48C', // Tan - corridors
    room: '#DDD', // Light gray - generic rooms
    hall: '#E6E6E6', // Light gray - halls
    chamber: '#DCDCDC', // Gainsboro - chambers
  };

  // Normalize sector string (lowercase, remove special chars)
  const normalizedSector = sector.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Try exact match first
  if (colors[normalizedSector as keyof typeof colors]) {
    return colors[normalizedSector as keyof typeof colors];
  }

  // Try partial matches for common patterns
  for (const [key, color] of Object.entries(colors)) {
    if (normalizedSector.includes(key) || key.includes(normalizedSector)) {
      return color;
    }
  }

  // Default fallback
  return '#DDD'; // Light gray for unknown sectors
};

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({
  clusters,
  zoom,
  onRoomClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderClusters = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // const performanceStart = performance.now();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate canvas dimensions based on clusters (coordinates are already scaled)
    const minX = Math.min(...clusters.map(c => c.centerX));
    const maxX = Math.max(...clusters.map(c => c.centerX));
    const minY = Math.min(...clusters.map(c => c.centerY));
    const maxY = Math.max(...clusters.map(c => c.centerY));

    // Limit canvas size to reasonable dimensions
    const maxCanvasSize = 2000; // Reasonable maximum size
    const worldWidth = Math.min(maxX - minX + 400, maxCanvasSize);
    const worldHeight = Math.min(maxY - minY + 400, maxCanvasSize);

    // Set canvas size with reasonable limits
    canvas.width = worldWidth;
    canvas.height = worldHeight;

    // Render each cluster as a colored circle (coordinates are already scaled)
    clusters.forEach(cluster => {
      const x = cluster.centerX - minX + 200;
      const y = cluster.centerY - minY + 200;
      const radius = Math.max(8, Math.min(40, cluster.size));

      // Get sector color
      const color = getSectorColor(cluster.dominantSector);

      // Draw cluster
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Add border for better visibility
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add room count for larger clusters (only at higher zoom levels)
      if (cluster.rooms.length > 5 && zoom > 0.15) {
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(cluster.rooms.length.toString(), x, y + 2);
      }
    });

    // const performanceEnd = performance.now();
    // Performance logging disabled to reduce console spam during interactions
    // console.log(`🎨 Canvas rendered ${clusters.length} clusters in ${(performanceEnd - performanceStart).toFixed(1)}ms`);
  }, [clusters, zoom]);

  // Handle canvas click events
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onRoomClick) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find the closest cluster to the click position (coordinates are already scaled)
      const minX = Math.min(...clusters.map(c => c.centerX));
      const minY = Math.min(...clusters.map(c => c.centerY));

      let closestCluster: CanvasCluster | null = null;
      let closestDistance = Infinity;

      clusters.forEach(cluster => {
        const clusterX = cluster.centerX - minX + 200;
        const clusterY = cluster.centerY - minY + 200;
        const distance = Math.sqrt(
          Math.pow(x - clusterX, 2) + Math.pow(y - clusterY, 2)
        );

        const clickRadius = Math.max(8, Math.min(40, cluster.size));
        if (distance < closestDistance && distance <= clickRadius) {
          closestDistance = distance;
          closestCluster = cluster;
        }
      });

      let firstRoomId: number | undefined;
      if (
        closestCluster &&
        (closestCluster as CanvasCluster).rooms &&
        (closestCluster as CanvasCluster).rooms.length > 0
      ) {
        const rooms = (closestCluster as CanvasCluster).rooms;
        if (rooms && rooms.length > 0) {
          firstRoomId = rooms![0]!.id;
        }
      }
      if (typeof firstRoomId === 'number') {
        onRoomClick(firstRoomId);
      }
    },
    [clusters, onRoomClick]
  );

  // Re-render when clusters or zoom changes
  useEffect(() => {
    renderClusters();
  }, [renderClusters]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className={`world-map-canvas cursor-pointer ${className}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    />
  );
};
