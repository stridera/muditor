'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Plus, Trash2, Package, Shield, Search } from 'lucide-react';

const GET_MOB_RESETS = gql`
  query GetMobResets($mobId: Int!) {
    mobResets(mobId: $mobId) {
      id
      max
      name
      roomId
      carrying {
        id
        max
        name
        objectId
        object {
          id
          shortDesc
          type
        }
      }
      equipped {
        id
        max
        location
        name
        objectId
        object {
          id
          shortDesc
          type
        }
      }
    }
  }
`;

const GET_OBJECTS = gql`
  query GetObjects($skip: Int, $take: Int) {
    objects(skip: $skip, take: $take) {
      id
      shortDesc
      type
      keywords
      wearFlags
    }
  }
`;

const CREATE_MOB_RESET = gql`
  mutation CreateMobReset($data: CreateMobResetInput!) {
    createMobReset(data: $data) {
      id
      max
      name
      roomId
    }
  }
`;

const UPDATE_MOB_RESET = gql`
  mutation UpdateMobReset($id: ID!, $data: UpdateMobResetInput!) {
    updateMobReset(id: $id, data: $data) {
      id
      max
      name
      roomId
    }
  }
`;

const DELETE_MOB_CARRYING = gql`
  mutation DeleteMobCarrying($id: ID!) {
    deleteMobCarrying(id: $id)
  }
`;

const DELETE_MOB_EQUIPPED = gql`
  mutation DeleteMobEquipped($id: ID!) {
    deleteMobEquipped(id: $id)
  }
`;

interface MobEquipmentManagerProps {
  mobId: number;
  zoneId: number;
}

interface MobReset {
  id: string;
  max: number;
  name?: string;
  roomId: number;
  carrying: Array<{
    id: string;
    max: number;
    name?: string;
    objectId: number;
    object: {
      id: number;
      shortDesc: string;
      type: string;
    };
  }>;
  equipped: Array<{
    id: string;
    max: number;
    location: string;
    name?: string;
    objectId: number;
    object: {
      id: number;
      shortDesc: string;
      type: string;
    };
  }>;
}

interface GameObject {
  id: number;
  shortDesc: string;
  type: string;
  keywords: string;
  wearFlags: string[];
}

const EQUIPMENT_LOCATIONS = [
  'light',
  'finger_r',
  'finger_l',
  'neck_1',
  'neck_2',
  'body',
  'head',
  'legs',
  'feet',
  'hands',
  'arms',
  'shield',
  'about',
  'waist',
  'wrist_r',
  'wrist_l',
  'wield',
  'hold',
  'dual_wield',
];

export default function MobEquipmentManager({
  mobId,
  zoneId,
}: MobEquipmentManagerProps) {
  const [activeReset, setActiveReset] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjects, setSelectedObjects] = useState<GameObject[]>([]);
  const [showObjectSearch, setShowObjectSearch] = useState(false);

  const {
    data: resetsData,
    loading: resetsLoading,
    refetch: refetchResets,
  } = useQuery(GET_MOB_RESETS, {
    variables: { mobId },
    skip: !mobId,
  });

  const { data: objectsData, loading: objectsLoading } = useQuery(GET_OBJECTS, {
    variables: { skip: 0, take: 100 },
  });

  const [createMobReset] = useMutation(CREATE_MOB_RESET, {
    onCompleted: () => {
      refetchResets();
    },
  });

  const [updateMobReset] = useMutation(UPDATE_MOB_RESET, {
    onCompleted: () => {
      refetchResets();
    },
  });

  const [deleteMobCarrying] = useMutation(DELETE_MOB_CARRYING, {
    onCompleted: () => {
      refetchResets();
    },
  });

  const [deleteMobEquipped] = useMutation(DELETE_MOB_EQUIPPED, {
    onCompleted: () => {
      refetchResets();
    },
  });

  const resets: MobReset[] = (resetsData as any)?.mobResets || [];
  const objects: GameObject[] = (objectsData as any)?.objects || [];

  const filteredObjects = objects.filter(
    obj =>
      obj.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReset = async () => {
    try {
      await createMobReset({
        variables: {
          data: {
            mobId,
            zoneId,
            roomId: 0, // Default room, user can change later
            max: 1,
            name: 'New Reset',
            carrying: [],
            equipped: [],
          },
        },
      });
    } catch (error) {
      console.error('Failed to create mob reset:', error);
    }
  };

  const handleAddCarrying = async (resetId: string, objectId: number) => {
    const reset = resets.find(r => r.id === resetId);
    if (!reset) return;

    try {
      await updateMobReset({
        variables: {
          id: resetId,
          data: {
            carrying: [
              ...reset.carrying.map(c => ({
                id: c.id,
                max: c.max,
                name: c.name,
                objectId: c.objectId,
              })),
              { objectId, max: 1 },
            ],
          },
        },
      });
    } catch (error) {
      console.error('Failed to add carrying item:', error);
    }
  };

  const handleAddEquipped = async (
    resetId: string,
    objectId: number,
    location: string
  ) => {
    const reset = resets.find(r => r.id === resetId);
    if (!reset) return;

    try {
      await updateMobReset({
        variables: {
          id: resetId,
          data: {
            equipped: [
              ...reset.equipped.map(e => ({
                id: e.id,
                max: e.max,
                name: e.name,
                objectId: e.objectId,
                location: e.location,
              })),
              { objectId, max: 1, location },
            ],
          },
        },
      });
    } catch (error) {
      console.error('Failed to add equipped item:', error);
    }
  };

  if (resetsLoading)
    return <div className='p-4'>Loading equipment data...</div>;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Equipment & Spawn Resets
          </h3>
          <p className='text-sm text-gray-500'>
            Configure where and how this mob spawns, and what equipment it
            carries
          </p>
        </div>
        <button
          onClick={handleCreateReset}
          className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='w-4 h-4 mr-2' />
          Add Spawn Location
        </button>
      </div>

      {/* Resets List */}
      {resets.length === 0 ? (
        <div className='text-center py-8'>
          <Package className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            No spawn locations
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Get started by creating a spawn location for this mob.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {resets.map(reset => (
            <div key={reset.id} className='bg-white shadow rounded-lg border'>
              {/* Reset Header */}
              <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='text-sm font-medium text-gray-900'>
                      {reset.name || `Spawn Location #${reset.id.slice(-8)}`}
                    </h4>
                    <p className='text-sm text-gray-500'>
                      Room {reset.roomId} • Max spawns: {reset.max}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setActiveReset(activeReset === reset.id ? null : reset.id)
                    }
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    {activeReset === reset.id ? 'Collapse' : 'Manage Equipment'}
                  </button>
                </div>
              </div>

              {/* Reset Details */}
              {activeReset === reset.id && (
                <div className='p-4 space-y-6'>
                  {/* Carrying Items */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <h5 className='text-sm font-medium text-gray-900 flex items-center'>
                        <Package className='w-4 h-4 mr-2 text-gray-400' />
                        Carrying Items ({reset.carrying.length})
                      </h5>
                      <button
                        onClick={() => setShowObjectSearch(!showObjectSearch)}
                        className='text-xs text-blue-600 hover:text-blue-800'
                      >
                        Add Item
                      </button>
                    </div>

                    {reset.carrying.length === 0 ? (
                      <p className='text-sm text-gray-500 italic'>
                        No items being carried
                      </p>
                    ) : (
                      <div className='space-y-2'>
                        {reset.carrying.map(carrying => (
                          <div
                            key={carrying.id}
                            className='flex items-center justify-between p-2 bg-gray-50 rounded'
                          >
                            <div>
                              <span className='text-sm font-medium'>
                                {carrying.object.shortDesc}
                              </span>
                              <span className='ml-2 text-xs text-gray-500'>
                                ({carrying.object.type})
                              </span>
                              {carrying.max > 1 && (
                                <span className='ml-2 text-xs text-blue-600'>
                                  Max: {carrying.max}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                deleteMobCarrying({
                                  variables: { id: carrying.id },
                                })
                              }
                              className='text-red-600 hover:text-red-800'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Equipped Items */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <h5 className='text-sm font-medium text-gray-900 flex items-center'>
                        <Shield className='w-4 h-4 mr-2 text-gray-400' />
                        Equipped Items ({reset.equipped.length})
                      </h5>
                    </div>

                    {reset.equipped.length === 0 ? (
                      <p className='text-sm text-gray-500 italic'>
                        No equipment worn or wielded
                      </p>
                    ) : (
                      <div className='grid grid-cols-2 gap-2'>
                        {reset.equipped.map(equipped => (
                          <div
                            key={equipped.id}
                            className='flex items-center justify-between p-2 bg-gray-50 rounded'
                          >
                            <div>
                              <div className='text-sm font-medium'>
                                {equipped.object.shortDesc}
                              </div>
                              <div className='text-xs text-gray-500'>
                                {equipped.location} • {equipped.object.type}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                deleteMobEquipped({
                                  variables: { id: equipped.id },
                                })
                              }
                              className='text-red-600 hover:text-red-800'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Object Search Panel */}
                  {showObjectSearch && (
                    <div className='border-t pt-4'>
                      <div className='mb-3'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Search Objects
                        </label>
                        <div className='relative'>
                          <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
                          <input
                            type='text'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder='Search by name or keywords...'
                            className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm'
                          />
                        </div>
                      </div>

                      {objectsLoading ? (
                        <p className='text-sm text-gray-500'>
                          Loading objects...
                        </p>
                      ) : (
                        <div className='max-h-64 overflow-y-auto space-y-1'>
                          {filteredObjects.slice(0, 20).map(obj => (
                            <div
                              key={obj.id}
                              className='flex items-center justify-between p-2 hover:bg-gray-50 rounded'
                            >
                              <div>
                                <div className='text-sm font-medium'>
                                  {obj.shortDesc}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {obj.type} • {obj.keywords}
                                </div>
                              </div>
                              <div className='flex gap-1'>
                                <button
                                  onClick={() =>
                                    handleAddCarrying(reset.id, obj.id)
                                  }
                                  className='text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
                                >
                                  Carry
                                </button>
                                {obj.wearFlags?.length > 0 && (
                                  <select
                                    onChange={e => {
                                      if (e.target.value) {
                                        handleAddEquipped(
                                          reset.id,
                                          obj.id,
                                          e.target.value
                                        );
                                        e.target.value = '';
                                      }
                                    }}
                                    className='text-xs px-2 py-1 border border-gray-300 rounded'
                                  >
                                    <option value=''>Equip...</option>
                                    {EQUIPMENT_LOCATIONS.map(location => (
                                      <option key={location} value={location}>
                                        {location.replace('_', ' ')}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
