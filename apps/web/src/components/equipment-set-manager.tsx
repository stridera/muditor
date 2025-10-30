'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Plus, Trash2, Edit, Package, Search, Settings } from 'lucide-react';

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
          shortDesc
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
      shortDesc
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
  shortDesc: string;
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
    shortDesc: string;
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
  'Light', 'FingerRight', 'FingerLeft', 'Neck1', 'Neck2',
  'Body', 'Head', 'Legs', 'Feet', 'Hands', 'Arms', 'Shield',
  'About', 'Waist', 'WristRight', 'WristLeft', 'Wield', 'Hold',
  'Float', 'Eyes', 'Face', 'Ear', 'Belt'
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

  const equipmentSets: EquipmentSet[] = (equipmentSetsData as any)?.equipmentSets || [];
  const objects: GameObject[] = (objectsData as any)?.objects || [];

  const filteredObjects = objects.filter(
    obj =>
      obj.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleUpdateSet = async (setId: string, name: string, description?: string) => {
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

  const handleAddItem = async (setId: string, objectId: number, slot: string) => {
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

  if (equipmentSetsLoading) return <div className="p-4">Loading equipment sets...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Equipment Set Manager</h2>
          <p className="text-sm text-gray-600">
            Create and manage reusable equipment sets for consistent mob outfitting
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Set
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Equipment Set</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Name *
              </label>
              <input
                type="text"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="e.g., City Guard Set, Royal Mage Robes"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newSetDescription}
                onChange={(e) => setNewSetDescription(e.target.value)}
                placeholder="Brief description of the equipment set and its intended use"
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateSet}
                disabled={!newSetName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Set
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Sets Grid */}
      {equipmentSets.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment sets</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first equipment set.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentSets.map((set) => (
            <div
              key={set.id}
              className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                selectedSetId === set.id ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200'
              }`}
            >
              {/* Set Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{set.name}</h3>
                    {set.description && (
                      <p className="text-sm text-gray-600 mt-1">{set.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {set.items.length} items • Created {new Date(set.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {onSetSelect && (
                      <button
                        onClick={() => onSetSelect(set.id)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Select this set"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingSet(editingSet === set.id ? null : set.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit set"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSet(set.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete set"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Set Items */}
              <div className="p-4">
                {set.items.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">
                    No items in this set yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {set.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {item.object.shortDesc}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.slot} • {item.object.type} • {(item.probability * 100).toFixed(0)}% chance
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-600"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Item */}
                {getAvailableSlots(set).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowObjectSearch(showObjectSearch === set.id ? null : set.id)}
                      className="w-full px-3 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Item to Set
                    </button>

                    {/* Object Search for Adding Items */}
                    {showObjectSearch === set.id && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Equipment Slot
                          </label>
                          <select
                            value={selectedSlot}
                            onChange={(e) => setSelectedSlot(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="">Select a slot...</option>
                            {getAvailableSlots(set).map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Objects
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search by name or keywords..."
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                          </div>
                        </div>

                        {selectedSlot && (
                          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                            {filteredObjects.slice(0, 10).map((obj) => (
                              <button
                                key={obj.id}
                                onClick={() => handleAddItem(set.id, obj.id, selectedSlot)}
                                className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="text-sm font-medium">{obj.shortDesc}</div>
                                <div className="text-xs text-gray-500">
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