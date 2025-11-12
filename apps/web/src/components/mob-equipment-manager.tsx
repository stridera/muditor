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
        zoneId
        name
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
          zoneId
          name
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
          zoneId
          name
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
      name
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

const DELETE_MOB_RESET_EQUIPMENT = gql`
  mutation DeleteMobResetEquipment($id: ID!) {
    deleteMobResetEquipment(id: $id)
  }
`;

const ADD_MOB_RESET_EQUIPMENT = gql`
  mutation AddMobResetEquipment(
    $resetId: ID!
    $objectZoneId: Int!
    $objectId: Int!
    $wearLocation: WearFlag
    $maxInstances: Int
    $probability: Float
  ) {
    addMobResetEquipment(
      resetId: $resetId
      objectZoneId: $objectZoneId
      objectId: $objectId
      wearLocation: $wearLocation
      maxInstances: $maxInstances
      probability: $probability
    ) {
      id
      equipment {
        id
        objectId
        objectZoneId
        wearLocation
        maxInstances
        probability
        object {
          id
          zoneId
          name
          type
        }
      }
    }
  }
`;

const UPDATE_MOB_RESET_EQUIPMENT = gql`
  mutation UpdateMobResetEquipment(
    $id: ID!
    $wearLocation: WearFlag
    $maxInstances: Int
    $probability: Float
  ) {
    updateMobResetEquipment(
      id: $id
      wearLocation: $wearLocation
      maxInstances: $maxInstances
      probability: $probability
    )
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
    name: string;
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
  maxInstances: number;
  roomId: number;
  roomZoneId: number;
  probability: number;
  equipmentSets?: MobEquipmentSet[];
  mob: {
    id: number;
    name: string;
  };
  equipment: Array<{
    id: string;
    maxInstances: number;
    probability: number;
    wearLocation: string;
    objectId: number;
    objectZoneId: number;
    object: {
      id: number;
      name: string;
      type: string;
    };
  }>;
}

interface GameObject {
  id: number;
  name: string;
  type: string;
  keywords: string;
  wearFlags: string[];
}

const EQUIPMENT_SLOTS = [
  'TAKE',
  'FINGER',
  'NECK',
  'BODY',
  'HEAD',
  'LEGS',
  'FEET',
  'HANDS',
  'ARMS',
  'SHIELD',
  'ABOUT',
  'WAIST',
  'WRIST',
  'WIELD',
  'HOLD',
  'TWO_HAND_WIELD',
  'EYES',
  'FACE',
  'EAR',
  'BADGE',
  'BELT',
  'HOVER',
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
  const [showAddEquipment, setShowAddEquipment] = useState<{
    [resetId: string]: boolean;
  }>({});
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [selectedWearLocation, setSelectedWearLocation] = useState<string>('');
  const [equipmentProbability, setEquipmentProbability] = useState<number>(1.0);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    wearLocation: string;
    maxInstances: number;
    probability: number;
  }>({
    wearLocation: '',
    maxInstances: 1,
    probability: 1.0,
  });

  const {
    data: resetsData,
    loading: resetsLoading,
    refetch: refetchResets,
  } = useQuery(GET_MOB_RESETS, {
    variables: { mobId, mobZoneId: zoneId },
    skip: !mobId || !zoneId,
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

  const [deleteMobResetEquipment] = useMutation(DELETE_MOB_RESET_EQUIPMENT, {
    onCompleted: () => {
      refetchResets();
    },
  });

  const [addMobResetEquipment] = useMutation(ADD_MOB_RESET_EQUIPMENT, {
    onCompleted: () => {
      refetchResets();
      setSelectedObject('');
      setSelectedWearLocation('');
      setEquipmentProbability(1.0);
    },
  });

  const [updateMobResetEquipment] = useMutation(UPDATE_MOB_RESET_EQUIPMENT, {
    onCompleted: () => {
      refetchResets();
      setEditingEquipment(null);
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

  const handleDeleteEquipment = async (equipmentId: string) => {
    try {
      await deleteMobResetEquipment({
        variables: { id: equipmentId },
      });
    } catch (error) {
      console.error('Failed to delete equipment:', error);
    }
  };

  const handleAddEquipment = async (resetId: string) => {
    if (!selectedObject) return;

    const [objectZoneId, objectId] = selectedObject.split(':').map(Number);

    try {
      await addMobResetEquipment({
        variables: {
          resetId,
          objectZoneId,
          objectId,
          wearLocation: selectedWearLocation || null,
          maxInstances: 1,
          probability: equipmentProbability,
        },
      });
      setShowAddEquipment({ ...showAddEquipment, [resetId]: false });
    } catch (error) {
      console.error('Failed to add equipment:', error);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingEquipment(item.id);
    setEditValues({
      wearLocation: item.wearLocation || '',
      maxInstances: item.maxInstances,
      probability: item.probability,
    });
  };

  const handleSaveEdit = async (equipmentId: string) => {
    try {
      await updateMobResetEquipment({
        variables: {
          id: equipmentId,
          wearLocation: editValues.wearLocation || null,
          maxInstances: editValues.maxInstances,
          probability: editValues.probability,
        },
      });
    } catch (error) {
      console.error('Failed to update equipment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingEquipment(null);
  };

  const getAvailableEquipmentSets = (reset: MobReset) => {
    const assignedSetIds = new Set(
      (reset.equipmentSets || []).map(mes => mes.equipmentSet.id)
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
                  Items: {set.items.map(item => item.object.name).join(', ')}
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
                      {reset.mob.name} Spawn #{reset.id.slice(-8)}
                    </h4>
                    <p className='text-sm text-gray-500'>
                      Room {reset.roomId} • Max spawns: {reset.maxInstances} •
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
                  {/* Direct Equipment */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <h5 className='text-sm font-medium text-gray-900 flex items-center'>
                        <Package className='w-4 h-4 mr-2 text-gray-400' />
                        Direct Equipment ({reset.equipment.length})
                      </h5>
                      <button
                        onClick={() =>
                          setShowAddEquipment({
                            ...showAddEquipment,
                            [reset.id]: !showAddEquipment[reset.id],
                          })
                        }
                        className='inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200'
                      >
                        <Plus className='w-3 h-3 mr-1' />
                        Add Item
                      </button>
                    </div>

                    {/* Add Equipment Form */}
                    {showAddEquipment[reset.id] && (
                      <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                        <h6 className='text-sm font-medium text-gray-900 mb-3'>
                          Add Equipment Item
                        </h6>
                        <div className='space-y-3'>
                          <div>
                            <label className='block text-xs font-medium text-gray-700 mb-1'>
                              Object (Zone:ID)
                            </label>
                            <input
                              type='text'
                              value={selectedObject}
                              onChange={e => setSelectedObject(e.target.value)}
                              placeholder='e.g., 30:22'
                              className='block w-full px-2 py-1 text-sm border border-gray-300 rounded'
                            />
                          </div>
                          <div>
                            <label className='block text-xs font-medium text-gray-700 mb-1'>
                              Wear Location (optional)
                            </label>
                            <select
                              value={selectedWearLocation}
                              onChange={e =>
                                setSelectedWearLocation(e.target.value)
                              }
                              className='block w-full px-2 py-1 text-sm border border-gray-300 rounded'
                            >
                              <option value=''>None (carried)</option>
                              {EQUIPMENT_SLOTS.map(slot => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className='block text-xs font-medium text-gray-700 mb-1'>
                              Probability
                            </label>
                            <input
                              type='number'
                              min='0'
                              max='1'
                              step='0.1'
                              value={equipmentProbability}
                              onChange={e =>
                                setEquipmentProbability(
                                  parseFloat(e.target.value) || 1.0
                                )
                              }
                              className='block w-full px-2 py-1 text-sm border border-gray-300 rounded'
                            />
                          </div>
                          <div className='flex gap-2'>
                            <button
                              onClick={() => handleAddEquipment(reset.id)}
                              disabled={!selectedObject}
                              className='px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50'
                            >
                              Add
                            </button>
                            <button
                              onClick={() =>
                                setShowAddEquipment({
                                  ...showAddEquipment,
                                  [reset.id]: false,
                                })
                              }
                              className='px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {reset.equipment.length === 0 ? (
                      <p className='text-sm text-gray-500 italic'>
                        No direct equipment assigned
                      </p>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {reset.equipment.map(item => (
                          <div
                            key={item.id}
                            className='border border-gray-200 rounded-lg p-3 bg-gray-50'
                          >
                            {editingEquipment === item.id ? (
                              /* Edit Mode */
                              <div className='space-y-2'>
                                <div className='font-medium text-sm text-gray-900 mb-1'>
                                  {item.object.name}
                                  <span className='text-xs text-gray-500 ml-2'>
                                    {(item.object as any).zoneId}:
                                    {item.object.id}
                                  </span>
                                </div>
                                <div>
                                  <label className='block text-xs font-medium text-gray-700 mb-1'>
                                    Wear Location
                                  </label>
                                  <select
                                    value={editValues.wearLocation}
                                    onChange={e =>
                                      setEditValues({
                                        ...editValues,
                                        wearLocation: e.target.value,
                                      })
                                    }
                                    className='block w-full px-2 py-1 text-xs border border-gray-300 rounded'
                                  >
                                    <option value=''>None (carried)</option>
                                    {EQUIPMENT_SLOTS.map(slot => (
                                      <option key={slot} value={slot}>
                                        {slot}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className='block text-xs font-medium text-gray-700 mb-1'>
                                    Max Instances
                                  </label>
                                  <input
                                    type='number'
                                    min='1'
                                    value={editValues.maxInstances}
                                    onChange={e =>
                                      setEditValues({
                                        ...editValues,
                                        maxInstances:
                                          parseInt(e.target.value) || 1,
                                      })
                                    }
                                    className='block w-full px-2 py-1 text-xs border border-gray-300 rounded'
                                  />
                                </div>
                                <div>
                                  <label className='block text-xs font-medium text-gray-700 mb-1'>
                                    Probability
                                  </label>
                                  <input
                                    type='number'
                                    min='0'
                                    max='1'
                                    step='0.1'
                                    value={editValues.probability}
                                    onChange={e =>
                                      setEditValues({
                                        ...editValues,
                                        probability:
                                          parseFloat(e.target.value) || 1.0,
                                      })
                                    }
                                    className='block w-full px-2 py-1 text-xs border border-gray-300 rounded'
                                  />
                                </div>
                                <div className='flex gap-2 pt-2'>
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    className='px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700'
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className='px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300'
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <>
                                <div className='flex items-center justify-between mb-2'>
                                  <div className='flex-1'>
                                    <div className='font-medium text-sm text-gray-900'>
                                      {item.object.name}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                      {(item.object as any).zoneId}:
                                      {item.object.id} • {item.object.type}
                                    </div>
                                  </div>
                                  <div className='flex gap-1'>
                                    <button
                                      onClick={() => handleStartEdit(item)}
                                      className='text-blue-600 hover:text-blue-800'
                                      title='Edit equipment'
                                    >
                                      <Settings className='w-4 h-4' />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteEquipment(item.id)
                                      }
                                      className='text-red-600 hover:text-red-800'
                                      title='Remove equipment'
                                    >
                                      <Trash2 className='w-4 h-4' />
                                    </button>
                                  </div>
                                </div>
                                <div className='flex items-center gap-3 text-xs text-gray-600'>
                                  {item.wearLocation && (
                                    <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded'>
                                      {item.wearLocation}
                                    </span>
                                  )}
                                  <span>Max: {item.maxInstances}</span>
                                  <span>
                                    Probability:{' '}
                                    {(item.probability * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Equipment Sets */}
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <h5 className='text-sm font-medium text-gray-900 flex items-center'>
                        <Shield className='w-4 h-4 mr-2 text-gray-400' />
                        Equipment Sets ({(reset.equipmentSets || []).length})
                      </h5>
                    </div>

                    {(reset.equipmentSets || []).length === 0 ? (
                      <p className='text-sm text-gray-500 italic'>
                        No equipment sets assigned
                      </p>
                    ) : (
                      <div className='space-y-3'>
                        {(reset.equipmentSets || []).map(mobEquipmentSet => (
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
                                    {item.object.name}
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
