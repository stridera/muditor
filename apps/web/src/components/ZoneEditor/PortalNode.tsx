'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useRouter } from 'next/navigation';

interface PortalData {
  direction: string;
  destZoneId: number;
  destRoomId: number;
  zoneName: string;
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
        title={`${data.direction} to ${data.zoneName}\nRoom ${data.destRoomId}\nClick to navigate`}
        style={{
          textAlign: 'center',
          padding: '6px',
          cursor: 'pointer',
          minWidth: '80px',
          background: 'linear-gradient(135deg, #eef2ff 0%, #ddd6fe 100%)',
          border: '2px solid #6366f1',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
        }}
      >
        <div style={{ fontSize: '16px' }}>🌀</div>
        <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#6366f1' }}>
          {data.direction}
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
