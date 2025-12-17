'use client';

import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Edit, Package, Plus, Search, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ColoredTextInline } from './ColoredTextViewer';

const GET_EQUIPMENT_SETS = gql`
  query GetEquipmentSets {
    equipmentSets {
      id
      name
      description
      createdAt
      updatedAt
      items {
        id
        slot
        probability
        object {
          id
          name
          type
          keywords
        }
      }
    }
  }
`;

const GET_OBJECTS = gql`
  query GetObjectsForEquipmentSet($skip: Int, $take: Int) {
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
  mutation CreateEquipmentSet($data: CreateEquipmentSetInput!) {
    createEquipmentSet(data: $data) {
      id
      name
      description
      createdAt
    }
  }
`;

const UPDATE_EQUIPMENT_SET = gql`
  mutation UpdateEquipmentSet($id: ID!, $data: UpdateEquipmentSetInput!) {
    updateEquipmentSet(id: $id, data: $data) {
      id
      name
      description
      updatedAt
    }
  }
`;

const DELETE_EQUIPMENT_SET = gql`
  mutation DeleteEquipmentSet($id: ID!) {
    deleteEquipmentSet(id: $id)
  }
`;

const ADD_EQUIPMENT_SET_ITEM = gql`
  mutation AddEquipmentSetItem($data: CreateEquipmentSetItemStandaloneInput!) {
    createEquipmentSetItem(data: $data) {
      id
      slot
      probability
    }
  }
`;

const REMOVE_EQUIPMENT_SET_ITEM = gql`
  mutation RemoveEquipmentSetItem($id: ID!) {
    deleteEquipmentSetItem(id: $id)
  }
`;

interface EquipmentSetManagerProps {
  showCreateForm?: boolean;
  onSetSelect?: (setId: string) => void;
  selectedSetId?: string;
}

interface GameObject {
  id: number;
  name: string;
  type: string;
  keywords: string;
  wearFlags: string[];
}

interface EquipmentSetItem {
  id: string;
  slot: string;
  probability: number;
  object: {
    id: number;
    name: string;
    type: string;
    keywords: string;
  };
}

interface EquipmentSet {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  items: EquipmentSetItem[];
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

export default function EquipmentSetManager({
  showCreateForm = false,
  onSetSelect,
  selectedSetId,
}: EquipmentSetManagerProps) {
  const [showCreate, setShowCreate] = useState(showCreateForm);
  const [editingSet, setEditingSet] = useState<string | null>(null);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showObjectSearch, setShowObjectSearch] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');

  const {
    data: equipmentSetsData,
    loading: equipmentSetsLoading,
    refetch: refetchEquipmentSets,
  } = useQuery(GET_EQUIPMENT_SETS);

  const { data: objectsData, loading: objectsLoading } = useQuery(GET_OBJECTS, {
    variables: { skip: 0, take: 200 },
  });

  const [createEquipmentSet] = useMutation(CREATE_EQUIPMENT_SET, {
    onCompleted: () => {
      refetchEquipmentSets();
      setShowCreate(false);
      setNewSetName('');
      setNewSetDescription('');
    },
  });

  const [updateEquipmentSet] = useMutation(UPDATE_EQUIPMENT_SET, {
    onCompleted: () => {
      refetchEquipmentSets();
      setEditingSet(null);
    },
  });

  const [deleteEquipmentSet] = useMutation(DELETE_EQUIPMENT_SET, {
    onCompleted: () => {
      refetchEquipmentSets();
    },
  });

  const [addEquipmentSetItem] = useMutation(ADD_EQUIPMENT_SET_ITEM, {
    onCompleted: () => {
      refetchEquipmentSets();
      setShowObjectSearch(null);
      setSelectedSlot('');
    },
  });

  const [removeEquipmentSetItem] = useMutation(REMOVE_EQUIPMENT_SET_ITEM, {
    onCompleted: () => {
      refetchEquipmentSets();
    },
  });

  const equipmentSets: EquipmentSet[] =
    (equipmentSetsData as any)?.equipmentSets || [];
  const objects: GameObject[] = (objectsData as any)?.objects || [];

  const filteredObjects = objects.filter(
    obj =>
      obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.keywords.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSet = async () => {
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

  const handleUpdateSet = async (
    setId: string,
    name: string,
    description?: string
  ) => {
    try {
      await updateEquipmentSet({
        variables: {
          id: setId,
          data: {
            name,
            description: description || undefined,
          },
        },
      });
    } catch (error) {
      console.error('Failed to update equipment set:', error);
    }
  };

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this equipment set?')) return;

    try {
      await deleteEquipmentSet({
        variables: { id: setId },
      });
    } catch (error) {
      console.error('Failed to delete equipment set:', error);
    }
  };

  const handleAddItem = async (
    setId: string,
    objectId: number,
    slot: string
  ) => {
    try {
      await addEquipmentSetItem({
        variables: {
          data: {
            equipmentSetId: setId,
            objectId,
            slot,
            probability: 1.0,
          },
        },
      });
    } catch (error) {
      console.error('Failed to add equipment set item:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeEquipmentSetItem({
        variables: { id: itemId },
      });
    } catch (error) {
      console.error('Failed to remove equipment set item:', error);
    }
  };

  const getAvailableSlots = (set: EquipmentSet) => {
    const usedSlots = new Set(set.items.map(item => item.slot));
    return EQUIPMENT_SLOTS.filter(slot => !usedSlots.has(slot));
  };

  if (equipmentSetsLoading)
    return <div className='p-4 text-foreground'>Loading equipment sets...</div>;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-foreground'>
            Equipment Set Manager
          </h2>
          <p className='text-sm text-muted-foreground'>
            Create and manage reusable equipment sets for consistent mob
            outfitting
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create New Set
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className='bg-card border border-border rounded-lg p-6'>
          <h3 className='text-lg font-medium text-foreground mb-4'>
            Create Equipment Set
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Set Name *
              </label>
              <input
                type='text'
                value={newSetName}
                onChange={e => setNewSetName(e.target.value)}
                placeholder='e.g., City Guard Set, Royal Mage Robes'
                className='block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                Description (optional)
              </label>
              <textarea
                value={newSetDescription}
                onChange={e => setNewSetDescription(e.target.value)}
                placeholder='Brief description of the equipment set and its intended use'
                rows={3}
                className='block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground'
              />
            </div>
            <div className='flex gap-3'>
              <button
                onClick={handleCreateSet}
                disabled={!newSetName.trim()}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Create Set
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className='px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Sets Grid */}
      {equipmentSets.length === 0 ? (
        <div className='text-center py-12'>
          <Package className='mx-auto h-12 w-12 text-muted-foreground' />
          <h3 className='mt-2 text-sm font-medium text-foreground'>
            No equipment sets
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Get started by creating your first equipment set.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {equipmentSets.map(set => (
            <div
              key={set.id}
              className={`bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                selectedSetId === set.id
                  ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-800'
                  : 'border-border'
              }`}
            >
              {/* Set Header */}
              <div className='p-4 border-b border-border'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-medium text-foreground'>
                      {set.name}
                    </h3>
                    {set.description && (
                      <p className='text-sm text-muted-foreground mt-1'>
                        {set.description}
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground mt-2'>
                      {set.items.length} items • Created{' '}
                      {new Date(set.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='flex gap-1'>
                    {onSetSelect && (
                      <button
                        onClick={() => onSetSelect(set.id)}
                        className='p-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400'
                        title='Select this set'
                      >
                        <Settings className='w-4 h-4' />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setEditingSet(editingSet === set.id ? null : set.id)
                      }
                      className='p-2 text-muted-foreground hover:text-foreground'
                      title='Edit set'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDeleteSet(set.id)}
                      className='p-2 text-muted-foreground hover:text-red-600 dark:hover:text-red-400'
                      title='Delete set'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>

              {/* Set Items */}
              <div className='p-4'>
                {set.items.length === 0 ? (
                  <p className='text-sm text-muted-foreground italic text-center py-4'>
                    No items in this set yet
                  </p>
                ) : (
                  <div className='space-y-2'>
                    {set.items.map(item => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between p-2 bg-muted rounded'
                      >
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-foreground'>
                            <ColoredTextInline markup={item.object.name} />
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {item.slot} • {item.object.type} •{' '}
                            {(item.probability * 100).toFixed(0)}% chance
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className='ml-2 p-1 text-muted-foreground hover:text-red-600 dark:hover:text-red-400'
                          title='Remove item'
                        >
                          <Trash2 className='w-3 h-3' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Item */}
                {getAvailableSlots(set).length > 0 && (
                  <div className='mt-4 pt-4 border-t border-border'>
                    <button
                      onClick={() =>
                        setShowObjectSearch(
                          showObjectSearch === set.id ? null : set.id
                        )
                      }
                      className='w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30'
                    >
                      <Plus className='w-4 h-4 inline mr-1' />
                      Add Item to Set
                    </button>

                    {/* Object Search for Adding Items */}
                    {showObjectSearch === set.id && (
                      <div className='mt-3 space-y-3'>
                        <div>
                          <label className='block text-sm font-medium text-foreground mb-1'>
                            Equipment Slot
                          </label>
                          <select
                            value={selectedSlot}
                            onChange={e => setSelectedSlot(e.target.value)}
                            className='block w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground'
                          >
                            <option value=''>Select a slot...</option>
                            {getAvailableSlots(set).map(slot => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-foreground mb-1'>
                            Search Objects
                          </label>
                          <div className='relative'>
                            <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                            <input
                              type='text'
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              placeholder='Search by name or keywords...'
                              className='block w-full pl-10 pr-3 py-2 border border-border rounded-md text-sm bg-background text-foreground'
                            />
                          </div>
                        </div>

                        {selectedSlot && (
                          <div className='max-h-32 overflow-y-auto border border-border rounded'>
                            {filteredObjects.slice(0, 10).map(obj => (
                              <button
                                key={obj.id}
                                onClick={() =>
                                  handleAddItem(set.id, obj.id, selectedSlot)
                                }
                                className='w-full p-2 text-left hover:bg-muted border-b border-border last:border-b-0'
                              >
                                <div className='text-sm font-medium text-foreground'>
                                  <ColoredTextInline markup={obj.name} />
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {obj.type} • {obj.keywords}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
