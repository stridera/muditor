import React from 'react';
import { Handle, Position } from 'reactflow';

interface WorldMapRoomProps {
  data: {
    roomId: number;
    name: string;
    sector: string;
    zoneId: number;
    zoneName: string;
    onRoomSelect?: (roomId: number) => void;
  };
}

const getSectorColor = (sector: string) => {
  const colors = {
    // Basic terrain
    'structure': '#8b7355',      // Brown - buildings/structures
    'field': '#90EE90',          // Light green - open fields
    'forest': '#228B22',         // Forest green - wooded areas
    'hills': '#9ACD32',          // Yellow green - hilly terrain
    'mountain': '#8B7D6B',       // Gray brown - mountainous
    'water_swim': '#4169E1',     // Royal blue - swimmable water
    'water_noswim': '#000080',   // Navy - deep water
    'underwater': '#006994',     // Deep blue - underwater areas
    'flying': '#87CEEB',         // Sky blue - aerial areas
    'desert': '#F4A460',         // Sandy brown - desert
    'road': '#696969',           // Dim gray - roads/paths
    'entrance': '#FFD700',       // Gold - entrances/gates
    'swamp': '#556B2F',          // Dark olive - swampy areas
    'jungle': '#006400',         // Dark green - dense jungle
    'tundra': '#E0E0E0',         // Light gray - tundra
    'arctic': '#F0F8FF',         // Alice blue - arctic
    'prairie': '#ADFF2F',        // Green yellow - prairie
    'ocean': '#1E90FF',          // Dodger blue - ocean
    'river': '#00CED1',          // Dark turquoise - rivers
    'lake': '#4682B4',           // Steel blue - lakes
    'beach': '#F5DEB3',          // Wheat - sandy beaches
    'cave': '#2F4F4F',           // Dark slate gray - caves
    'inside': '#D2B48C',         // Tan - indoor areas
    'city': '#C0C0C0',           // Silver - urban areas
    'farmland': '#ADFF2F',       // Green yellow - farmland
    'ruins': '#8B8682',          // Gray - ruined areas
    'magical': '#9370DB',        // Medium purple - magical areas
    'volcanic': '#DC143C',       // Crimson - volcanic areas
    'ice': '#B0E0E6',            // Powder blue - icy areas
    'snow': '#FFFAFA',           // Snow - snowy areas
    'mud': '#8B4513',            // Saddle brown - muddy areas
    'sand': '#F5E050',           // Light sandy - sandy areas
    'stone': '#708090',          // Slate gray - stone areas
    'grass': '#32CD32',          // Lime green - grassy areas
    'dirt': '#8B4513',           // Saddle brown - dirt paths
    'gravel': '#A9A9A9',         // Dark gray - gravel
    'air': '#E6E6FA',            // Lavender - air/sky
    'void': '#000000',           // Black - void areas
    'lava': '#FF4500',           // Orange red - lava
    'quicksand': '#DAA520',      // Goldenrod - quicksand
    'brambles': '#228B22',       // Forest green - thorny areas
    'garden': '#98FB98',         // Pale green - gardens
    'courtyard': '#F0E68C',      // Khaki - courtyards
    'corridor': '#D2B48C',       // Tan - corridors
    'room': '#DDD',              // Light gray - generic rooms
    'hall': '#E6E6E6',           // Light gray - halls
    'chamber': '#DCDCDC',        // Gainsboro - chambers
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

export const WorldMapRoom: React.FC<WorldMapRoomProps> = ({ data }) => {
  const { roomId, name, sector, zoneId, zoneName, onRoomSelect } = data;

  const color = getSectorColor(sector);
  const size = 80; // Very large box size for easy clicking and visibility

  const handleClick = () => {
    if (onRoomSelect) {
      onRoomSelect(roomId);
    }
  };

  return (
    <div
      className="world-map-room cursor-pointer transition-all duration-200 hover:scale-125 hover:shadow-lg hover:z-10"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        border: '3px solid rgba(255, 255, 255, 0.9)',
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      onClick={handleClick}
      title={`${name} (${sector}) - Zone ${zoneId}: ${zoneName}`}
    >
      {/* Optional: Add a tiny indicator for room type */}
      <div
        style={{
          width: '2px',
          height: '2px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};