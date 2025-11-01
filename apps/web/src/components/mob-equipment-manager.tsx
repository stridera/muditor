'use client';

import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Layers, Package, Plus, Settings, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';

const GET_MOB_RESETS = gql`
  query GetMobResetsForMob($mobId: Int!, $mobZoneId: Int!) {
    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {
      id
      maxInstances
      probability
      roomId
      roomZoneId
      mob {
        id
        shortDesc
      }
      equipment {
        id
        maxInstances
        probability
        wearLocation
        objectId
        objectZoneId
        object {
          id
          shortDesc
          type
        }
      }
    }
  }
`;

const GET_EQUIPMENT_SETS = gql`
  query GetEquipmentSetsForMob {
    equipmentSets {
      id
      name
      description
      createdAt
      items {
        id
        slot
        probability
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
  query GetObjectsForMob($skip: Int, $take: Int) {
    objects(skip: $skip, take: $take) {
      id
      shortDesc
      type
      keywords
      wearFlags
    }
  }
`;

const CREATE_EQUIPMENT_SET = gql`
  mutation CreateEquipmentSetForMob($data: CreateEquipmentSetInput!) {
    createEquipmentSet(data: $data) {
      id
      name
      description
    }
  }
`;

const ADD_MOB_EQUIPMENT_SET = gql`
  mutation AddMobEquipmentSet($data: CreateMobEquipmentSetInput!) {
    createMobEquipmentSet(data: $data) {
      id
      probability
    }
  }
`;

const REMOVE_MOB_EQUIPMENT_SET = gql`
  mutation RemoveMobEquipmentSet($id: ID!) {
    deleteMobEquipmentSet(id: $id)
  }
`;

interface MobEquipmentManagerProps {
  mobId: number;
  zoneId: number;
}

interface EquipmentSetItem {
  id: string;
  slot: string;
  probability: number;
  object: {
    id: number;
    shortDesc: string;
    type: string;
  };
}

interface EquipmentSet {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  items: EquipmentSetItem[];
}

interface MobEquipmentSet {
  id: string;
  probability: number;
  equipmentSet: EquipmentSet;
}

interface SpawnCondition {
  id: string;
  type: string;
  parameters: string;
}

interface MobReset {
  id: string;
  max: number;
  name?: string;
  roomId: number;
  probability: number;
  equipmentSets: MobEquipmentSet[];
  conditions: SpawnCondition[];
}

interface GameObject {
  id: number;
  shortDesc: string;
  type: string;
  keywords: string;
  wearFlags: string[];
}

const EQUIPMENT_SLOTS = [
  'Light',
  'FingerRight',
  'FingerLeft',
  'Neck1',
  'Neck2',
  'Body',
  'Head',
  'Legs',
  'Feet',
  'Hands',
  'Arms',
  'Shield',
  'About',
  'Waist',
  'WristRight',
  'WristLeft',
  'Wield',
  'Hold',
  'Float',
  'Eyes',
  'Face',
  'Ear',
  'Belt',
];

export default function MobEquipmentManager({
  mobId,
  zoneId,
}: MobEquipmentManagerProps) {
  const [activeReset, setActiveReset] = useState<string | null>(null);
  const [showEquipmentSets, setShowEquipmentSets] = useState(false);
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');

  const {
    data: resetsData,
    loading: resetsLoading,
    refetch: refetchResets,
  } = useQuery(GET_MOB_RESETS, {
    variables: { mobId },
    skip: !mobId,
  });

  const {
    data: equipmentSetsData,
    loading: equipmentSetsLoading,
    refetch: refetchEquipmentSets,
  } = useQuery(GET_EQUIPMENT_SETS);

  const [createEquipmentSet] = useMutation(CREATE_EQUIPMENT_SET, {
    onCompleted: () => {
      refetchEquipmentSets();
      setShowCreateSet(false);
      setNewSetName('');
      setNewSetDescription('');
    },
  });

  const [addMobEquipmentSet] = useMutation(ADD_MOB_EQUIPMENT_SET, {
    onCompleted: () => {
      refetchResets();
    },
  });

  const [removeMobEquipmentSet] = useMutation(REMOVE_MOB_EQUIPMENT_SET, {
    onCompleted: () => {
      refetchResets();
    },
  });

  const resets: MobReset[] = (resetsData as any)?.mobResets || [];
  const equipmentSets: EquipmentSet[] =
    (equipmentSetsData as any)?.equipmentSets || [];

  const handleCreateEquipmentSet = async () => {
    if (!newSetName.trim()) return;

    try {
      await createEquipmentSet({
        variables: {
          data: {
            name: newSetName,
            description: newSetDescription || undefined,
          },
        },
      });
    } catch (error) {
      console.error('Failed to create equipment set:', error);
    }
  };

  const handleAddEquipmentSet = async (
    resetId: string,
    equipmentSetId: string
  ) => {
    try {
      await addMobEquipmentSet({
        variables: {
          data: {
            mobResetId: resetId,
            equipmentSetId,
            probability: 1.0,
          },
        },
      });
    } catch (error) {
      console.error('Failed to add equipment set:', error);
    }
  };

  const handleRemoveEquipmentSet = async (mobEquipmentSetId: string) => {
    try {
      await removeMobEquipmentSet({
        variables: { id: mobEquipmentSetId },
      });
    } catch (error) {
      console.error('Failed to remove equipment set:', error);
    }
  };

  const getAvailableEquipmentSets = (reset: MobReset) => {
    const assignedSetIds = new Set(
      reset.equipmentSets.map(mes => mes.equipmentSet.id)
    );
    return equipmentSets.filter(set => !assignedSetIds.has(set.id));
  };

  if (resetsLoading)
    return <div className='p-4'>Loading equipment data...</div>;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Equipment Sets & Spawn Configuration
          </h3>
          <p className='text-sm text-gray-500'>
            Manage equipment sets and spawn conditions for this mob
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setShowEquipmentSets(!showEquipmentSets)}
            className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
          >
            <Layers className='w-4 h-4 mr-2' />
            Manage Sets
          </button>
        </div>
      </div>

      {/* Equipment Sets Management */}
      {showEquipmentSets && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-md font-medium text-blue-900'>
              Equipment Sets Library
            </h4>
            <button
              onClick={() => setShowCreateSet(!showCreateSet)}
              className='inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200'
            >
              <Plus className='w-4 h-4 mr-2' />
              Create New Set
            </button>
          </div>

          {/* Create New Set Form */}
          {showCreateSet && (
            <div className='bg-white rounded-lg p-4 mb-4 border border-blue-200'>
              <h5 className='text-sm font-medium text-gray-900 mb-3'>
                Create Equipment Set
              </h5>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Set Name
                  </label>
                  <input
                    type='text'
                    value={newSetName}
                    onChange={e => setNewSetName(e.target.value)}
                    placeholder='e.g., Guard Captain Set, Mage Robes'
                    className='block w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Description (optional)
                  </label>
                  <input
                    type='text'
                    value={newSetDescription}
                    onChange={e => setNewSetDescription(e.target.value)}
                    placeholder='Brief description of the equipment set'
                    className='block w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                  />
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={handleCreateEquipmentSet}
                    disabled={!newSetName.trim()}
                    className='px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50'
                  >
                    Create Set
                  </button>
                  <button
                    onClick={() => setShowCreateSet(false)}
                    className='px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Equipment Sets List */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {equipmentSets.map(set => (
              <div
                key={set.id}
                className='bg-white rounded-lg p-3 border border-gray-200'
              >
                <div className='flex items-center justify-between mb-2'>
                  <h5 className='text-sm font-medium text-gray-900'>
                    {set.name}
                  </h5>
                  <span className='text-xs text-gray-500'>
                    {set.items.length} items
                  </span>
                </div>
                {set.description && (
                  <p className='text-xs text-gray-600 mb-2'>
                    {set.description}
                  </p>
                )}
                <div className='text-xs text-gray-500'>
                  Items:{' '}
                  {set.items.map(item => item.object.shortDesc).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resets List */}
      {resets.length === 0 ? (
        <div className='text-center py-8'>
          <Package className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            No spawn locations
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            This mob has no configured spawn locations.
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
                      Room {reset.roomId} • Max spawns: {reset.max} •
                      Probability: {(reset.probability * 100).toFixed(0)}%
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
                  {/* Equipment Sets */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <h5 className='text-sm font-medium text-gray-900 flex items-center'>
                        <Shield className='w-4 h-4 mr-2 text-gray-400' />
                        Equipment Sets ({reset.equipmentSets.length})
                      </h5>
                    </div>

                    {reset.equipmentSets.length === 0 ? (
                      <p className='text-sm text-gray-500 italic'>
                        No equipment sets assigned
                      </p>
                    ) : (
                      <div className='space-y-3'>
                        {reset.equipmentSets.map(mobEquipmentSet => (
                          <div
                            key={mobEquipmentSet.id}
                            className='border border-gray-200 rounded-lg p-3'
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <h6 className='text-sm font-medium text-gray-900'>
                                {mobEquipmentSet.equipmentSet.name}
                              </h6>
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-gray-500'>
                                  {(mobEquipmentSet.probability * 100).toFixed(
                                    0
                                  )}
                                  % chance
                                </span>
                                <button
                                  onClick={() =>
                                    handleRemoveEquipmentSet(mobEquipmentSet.id)
                                  }
                                  className='text-red-600 hover:text-red-800'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </button>
                              </div>
                            </div>
                            {mobEquipmentSet.equipmentSet.description && (
                              <p className='text-xs text-gray-600 mb-2'>
                                {mobEquipmentSet.equipmentSet.description}
                              </p>
                            )}
                            <div className='grid grid-cols-2 gap-2'>
                              {mobEquipmentSet.equipmentSet.items.map(item => (
                                <div
                                  key={item.id}
                                  className='text-xs p-2 bg-gray-50 rounded'
                                >
                                  <div className='font-medium'>
                                    {item.object.shortDesc}
                                  </div>
                                  <div className='text-gray-500'>
                                    {item.slot} •{' '}
                                    {(item.probability * 100).toFixed(0)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Equipment Set */}
                    {getAvailableEquipmentSets(reset).length > 0 && (
                      <div className='mt-3'>
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              handleAddEquipmentSet(reset.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className='text-sm px-3 py-2 border border-gray-300 rounded-md'
                        >
                          <option value=''>Add Equipment Set...</option>
                          {getAvailableEquipmentSets(reset).map(set => (
                            <option key={set.id} value={set.id}>
                              {set.name} ({set.items.length} items)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Spawn Conditions */}
                  {reset.conditions.length > 0 && (
                    <div>
                      <h5 className='text-sm font-medium text-gray-900 flex items-center mb-3'>
                        <Settings className='w-4 h-4 mr-2 text-gray-400' />
                        Spawn Conditions ({reset.conditions.length})
                      </h5>
                      <div className='space-y-2'>
                        {reset.conditions.map(condition => (
                          <div
                            key={condition.id}
                            className='p-2 bg-yellow-50 border border-yellow-200 rounded text-sm'
                          >
                            <span className='font-medium text-yellow-800'>
                              {condition.type}
                            </span>
                            <span className='ml-2 text-yellow-700'>
                              {JSON.stringify(
                                JSON.parse(condition.parameters),
                                null,
                                0
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
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
