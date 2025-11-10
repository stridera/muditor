'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useRouter } from 'next/navigation';

interface PortalData {
  direction: string;
  destZoneId: number;
  destRoomId: number;
  zoneName: string;
  isOneWayEntrance?: boolean; // True if this is a one-way entrance (no return exit)
  sourceDirection?: string; // Direction from source zone
}

export const PortalNode: React.FC<NodeProps<PortalData>> = ({ data }) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use shallow routing to update URL without full page re-render
    // This preserves React state while updating the URL for bookmarking/history
    router.push(
      `/dashboard/zones/editor?zone=${data.destZoneId}&room=${data.destRoomId}`,
      { scroll: false }
    );
  };

  return (
    <>
      {/* Connection Handles - portals only receive connections */}
      <Handle
        type='target'
        position={Position.Top}
        id='top-target'
        style={{ opacity: 0 }}
      />
      <Handle
        type='target'
        position={Position.Right}
        id='right-target'
        style={{ opacity: 0 }}
      />
      <Handle
        type='target'
        position={Position.Bottom}
        id='bottom-target'
        style={{ opacity: 0 }}
      />
      <Handle
        type='target'
        position={Position.Left}
        id='left-target'
        style={{ opacity: 0 }}
      />

      <div
        onClick={handleClick}
        title={
          data.isOneWayEntrance
            ? `ONE-WAY ENTRANCE from ${data.zoneName}\n${data.sourceDirection} from Room ${data.destRoomId}\nNo return exit to source zone\nClick to navigate`
            : `${data.direction} to ${data.zoneName}\nRoom ${data.destRoomId}\nClick to navigate`
        }
        style={{
          textAlign: 'center',
          padding: '6px',
          cursor: 'pointer',
          minWidth: '80px',
          background: data.isOneWayEntrance
            ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
            : 'linear-gradient(135deg, #eef2ff 0%, #ddd6fe 100%)',
          border: data.isOneWayEntrance
            ? '2px solid #f59e0b'
            : '2px solid #6366f1',
          borderRadius: '12px',
          boxShadow: data.isOneWayEntrance
            ? '0 2px 8px rgba(245, 158, 11, 0.3)'
            : '0 2px 8px rgba(99, 102, 241, 0.3)',
        }}
      >
        {data.isOneWayEntrance && (
          <div
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#f59e0b',
              marginBottom: '2px',
            }}
          >
            ⚠️ ONE-WAY
          </div>
        )}
        <div style={{ fontSize: '16px' }}>
          {data.isOneWayEntrance ? '⬅️' : '🌀'}
        </div>
        <div
          style={{
            fontSize: '9px',
            fontWeight: 'bold',
            color: data.isOneWayEntrance ? '#f59e0b' : '#6366f1',
          }}
        >
          {data.isOneWayEntrance ? data.sourceDirection : data.direction}
        </div>
        <div style={{ fontSize: '8px', color: '#666' }}>
          Zone {data.destZoneId}
        </div>
        <div style={{ fontSize: '8px', color: '#666' }}>
          Room {data.destRoomId}
        </div>
      </div>
    </>
  );
};
