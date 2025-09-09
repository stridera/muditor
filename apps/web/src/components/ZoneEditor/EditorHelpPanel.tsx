import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HelpCircle,
  Keyboard,
  Mouse,
  Layers,
  Navigation,
  Edit3,
  Eye,
  Layout,
  ChevronRight,
  X,
} from 'lucide-react';

interface EditorHelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcut = ({
  keys,
  description,
  mode = 'all',
}: {
  keys: string;
  description: string;
  mode?: string;
}) => (
  <div className='flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0'>
    <span className='text-sm'>{description}</span>
    <div className='flex items-center gap-1'>
      {mode !== 'all' && (
        <Badge variant='outline' className='text-xs mr-2'>
          {mode}
        </Badge>
      )}
      <kbd className='px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono'>
        {keys}
      </kbd>
    </div>
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  tips,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  tips: string[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle className='text-sm flex items-center gap-2'>
        <Icon className='h-4 w-4' />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className='space-y-2'>
      <p className='text-sm text-gray-600'>{description}</p>
      <ul className='text-xs space-y-1'>
        {tips.map((tip, index) => (
          <li key={index} className='flex items-start gap-2'>
            <ChevronRight className='h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0' />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export function EditorHelpPanel({ isOpen, onClose }: EditorHelpPanelProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-2'>
            <HelpCircle className='h-5 w-5 text-blue-600' />
            <h2 className='text-xl font-semibold'>Zone Editor Help</h2>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='w-full grid grid-cols-4'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='modes'>View Modes</TabsTrigger>
              <TabsTrigger value='shortcuts'>Shortcuts</TabsTrigger>
              <TabsTrigger value='tips'>Tips & Tricks</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='p-6 space-y-6'>
              <div>
                <h3 className='text-lg font-medium mb-4'>
                  Zone Editor Overview
                </h3>
                <p className='text-gray-600 mb-6'>
                  The Zone Editor is a visual tool for creating and editing MUD
                  zones using an interactive graph-based interface. Rooms are
                  represented as nodes, and exits as connections between them.
                </p>

                <div className='grid md:grid-cols-2 gap-4'>
                  <FeatureCard
                    icon={Edit3}
                    title='Edit Mode'
                    description='Default mode for editing room properties and managing exits.'
                    tips={[
                      'Click any room to select and edit its properties',
                      'Use the property panel to modify room details',
                      'Create and delete exits using the connection tools',
                    ]}
                  />

                  <FeatureCard
                    icon={Eye}
                    title='View Mode'
                    description='Navigation mode for exploring the zone like a player would.'
                    tips={[
                      'Use arrow keys to move between connected rooms',
                      'Green exit badges show connections within the zone',
                      'Gray badges indicate exits to other zones',
                    ]}
                  />

                  <FeatureCard
                    icon={Layout}
                    title='Layout Mode'
                    description='Spatial arrangement mode for organizing room positions.'
                    tips={[
                      'Drag rooms to reposition them on the grid',
                      'Positions are automatically saved to the database',
                      'Rooms snap to grid for clean alignment',
                    ]}
                  />

                  <FeatureCard
                    icon={Layers}
                    title='Z-Level Support'
                    description='Multi-floor support for complex vertical layouts.'
                    tips={[
                      'Use Z-level controls to move rooms up/down floors',
                      "Ctrl+Up/Down arrows change selected room's floor",
                      'Each floor can have independent room layouts',
                    ]}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='modes' className='p-6'>
              <div className='space-y-6'>
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <Edit3 className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-medium'>Edit Mode</h3>
                    <Badge variant='secondary'>Default</Badge>
                  </div>
                  <p className='text-gray-600 mb-4'>
                    The primary mode for building and modifying your zone. Click
                    rooms to select them and use the property panel to edit
                    details.
                  </p>
                  <div className='bg-blue-50 p-4 rounded-lg'>
                    <h4 className='font-medium text-blue-900 mb-2'>
                      In Edit Mode You Can:
                    </h4>
                    <ul className='text-sm text-blue-800 space-y-1'>
                      <li>• Edit room names, descriptions, and sector types</li>
                      <li>• Create new exits between rooms</li>
                      <li>• Delete existing exits</li>
                      <li>• Modify room properties and flags</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <Eye className='h-5 w-5 text-green-600' />
                    <h3 className='text-lg font-medium'>View Mode</h3>
                    <Badge variant='outline'>Navigation</Badge>
                  </div>
                  <p className='text-gray-600 mb-4'>
                    Experience your zone as a player would. Navigate using arrow
                    keys and see which exits lead to other rooms.
                  </p>
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <h4 className='font-medium text-green-900 mb-2'>
                      Navigation Features:
                    </h4>
                    <ul className='text-sm text-green-800 space-y-1'>
                      <li>• Arrow keys move between connected rooms</li>
                      <li>• Exit badges show available directions</li>
                      <li>• Auto-focus on selected room in viewport</li>
                      <li>
                        • Visual indication of intra-zone vs external exits
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <Layout className='h-5 w-5 text-purple-600' />
                    <h3 className='text-lg font-medium'>Layout Mode</h3>
                    <Badge variant='outline'>Positioning</Badge>
                  </div>
                  <p className='text-gray-600 mb-4'>
                    Organize the visual layout of your zone. Drag rooms to new
                    positions and create an intuitive spatial arrangement.
                  </p>
                  <div className='bg-purple-50 p-4 rounded-lg'>
                    <h4 className='font-medium text-purple-900 mb-2'>
                      Layout Tools:
                    </h4>
                    <ul className='text-sm text-purple-800 space-y-1'>
                      <li>• Drag and drop rooms to reposition them</li>
                      <li>• Automatic grid snapping for alignment</li>
                      <li>• Positions saved automatically to database</li>
                      <li>• Grid-based coordinate system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='shortcuts' className='p-6'>
              <div className='space-y-6'>
                <div>
                  <div className='flex items-center gap-2 mb-4'>
                    <Keyboard className='h-5 w-5 text-gray-600' />
                    <h3 className='text-lg font-medium'>Keyboard Shortcuts</h3>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Room Navigation (View Mode)
                      </h4>
                      <div className='space-y-0 border border-gray-200 rounded-lg p-4'>
                        <KeyboardShortcut
                          keys='↑'
                          description='Move north'
                          mode='view'
                        />
                        <KeyboardShortcut
                          keys='↓'
                          description='Move south'
                          mode='view'
                        />
                        <KeyboardShortcut
                          keys='←'
                          description='Move west'
                          mode='view'
                        />
                        <KeyboardShortcut
                          keys='→'
                          description='Move east'
                          mode='view'
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Z-Level Control
                      </h4>
                      <div className='space-y-0 border border-gray-200 rounded-lg p-4'>
                        <KeyboardShortcut
                          keys='Ctrl + ↑'
                          description='Move room up one floor'
                        />
                        <KeyboardShortcut
                          keys='Ctrl + ↓'
                          description='Move room down one floor'
                        />
                        <KeyboardShortcut
                          keys='Ctrl + 0'
                          description='Move room to ground level (Z=0)'
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className='font-medium text-gray-900 mb-3'>
                        Layout Mode
                      </h4>
                      <div className='space-y-0 border border-gray-200 rounded-lg p-4'>
                        <KeyboardShortcut
                          keys='Drag & Drop'
                          description='Reposition rooms on grid'
                          mode='layout'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className='flex items-center gap-2 mb-4'>
                    <Mouse className='h-5 w-5 text-gray-600' />
                    <h3 className='text-lg font-medium'>Mouse Controls</h3>
                  </div>

                  <div className='space-y-0 border border-gray-200 rounded-lg p-4'>
                    <KeyboardShortcut
                      keys='Click'
                      description='Select room for editing'
                    />
                    <KeyboardShortcut
                      keys='Drag'
                      description='Pan around the zone (in canvas area)'
                    />
                    <KeyboardShortcut
                      keys='Scroll'
                      description='Zoom in/out of the zone view'
                    />
                    <KeyboardShortcut
                      keys='Drag Room'
                      description='Move room position (Layout mode only)'
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='tips' className='p-6'>
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-medium mb-4'>
                    Tips & Best Practices
                  </h3>

                  <div className='space-y-6'>
                    <div className='border-l-4 border-blue-500 pl-4'>
                      <h4 className='font-medium text-blue-900 mb-2'>
                        🎯 Zone Design
                      </h4>
                      <ul className='text-sm text-gray-700 space-y-1'>
                        <li>
                          • Aim for 2-4 exits per room for good connectivity
                        </li>
                        <li>
                          • Create logical flow paths for player exploration
                        </li>
                        <li>
                          • Use descriptive room names that help with navigation
                        </li>
                        <li>
                          • Consider adding landmark rooms for orientation
                        </li>
                      </ul>
                    </div>

                    <div className='border-l-4 border-green-500 pl-4'>
                      <h4 className='font-medium text-green-900 mb-2'>
                        ⚡ Efficiency Tips
                      </h4>
                      <ul className='text-sm text-gray-700 space-y-1'>
                        <li>• Use View mode to test navigation flow</li>
                        <li>
                          • Switch to Layout mode to organize room positions
                        </li>
                        <li>
                          • The minimap helps navigate large zones quickly
                        </li>
                        <li>• Room positions auto-save when you drag them</li>
                      </ul>
                    </div>

                    <div className='border-l-4 border-purple-500 pl-4'>
                      <h4 className='font-medium text-purple-900 mb-2'>
                        🏗️ Advanced Features
                      </h4>
                      <ul className='text-sm text-gray-700 space-y-1'>
                        <li>
                          • Use Z-levels for multi-floor buildings and
                          structures
                        </li>
                        <li>
                          • Green exit badges indicate same-zone connections
                        </li>
                        <li>• Gray badges show exits leading to other zones</li>
                        <li>
                          • The entity palette shows mobs and objects in the
                          zone
                        </li>
                      </ul>
                    </div>

                    <div className='border-l-4 border-orange-500 pl-4'>
                      <h4 className='font-medium text-orange-900 mb-2'>
                        🔧 Troubleshooting
                      </h4>
                      <ul className='text-sm text-gray-700 space-y-1'>
                        <li>
                          • If rooms seem disconnected, check exit
                          configurations
                        </li>
                        <li>
                          • Use the validation dashboard to find integrity
                          issues
                        </li>
                        <li>
                          • Missing exits may indicate rooms in different zones
                        </li>
                        <li>
                          • Room positions persist across browser sessions
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Need More Help?
                  </h4>
                  <p className='text-sm text-gray-600 mb-3'>
                    The zone editor is designed to be intuitive, but if you
                    encounter any issues or have suggestions for improvement,
                    don't hesitate to reach out.
                  </p>
                  <div className='flex gap-2'>
                    <Badge variant='outline' className='text-xs'>
                      💡 Tip: Hover over UI elements for additional tooltips
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className='p-4 border-t bg-gray-50'>
          <div className='flex justify-end'>
            <Button onClick={onClose}>Close Help</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
