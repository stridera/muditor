'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import ScriptEditor, { type Script } from '@/components/ScriptEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { Database, Edit, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageScript {
  id: number;
  name: string;
  type: 'ROOM' | 'MOB' | 'OBJECT' | 'GLOBAL';
  content: string;
  attachedTo?: string;
  lastModified: string;
  author?: string;
}

// Convert between PageScript and ScriptEditor's Script interface
const convertPageScriptToScript = (pageScript: PageScript): Script => ({
  id: pageScript.id.toString(),
  name: pageScript.name,
  attachType: pageScript.type,
  numArgs: 0,
  commands: pageScript.content,
  variables: {},
});

const convertScriptToPageScript = (
  script: Partial<Script>,
  existingScript?: PageScript
): Partial<PageScript> => {
  const base: Partial<PageScript> = {
    lastModified: new Date().toISOString(),
  };
  if (existingScript?.author) base.author = existingScript.author;
  if (script.id) base.id = parseInt(script.id);
  if (script.name) base.name = script.name;
  const resolvedType =
    (script.attachType as 'ROOM' | 'MOB' | 'OBJECT' | 'GLOBAL') ||
    existingScript?.type;
  if (resolvedType) base.type = resolvedType;
  if (script.commands) base.content = script.commands;
  return base;
};

function ScriptsPageContent() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<PageScript[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedScript, setSelectedScript] = useState<PageScript | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for now - in real implementation, this would fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockScripts: PageScript[] = [
        {
          id: 1,
          name: 'Welcome Message',
          type: 'ROOM',
          content:
            '-- Welcome message script\nfunction onEnter(ch)\n  ch:send("Welcome to the realm!")\nend',
          attachedTo: 'Room 1001: Town Square',
          lastModified: '2025-09-08T10:30:00Z',
          author: 'admin',
        },
        {
          id: 2,
          name: 'Shopkeeper Greeting',
          type: 'MOB',
          content:
            '-- Shopkeeper greeting script\nfunction onGreet(ch, mob)\n  mob:say("Welcome to my shop, " .. ch.name .. "!")\nend',
          attachedTo: 'Mob 5001: Friendly Shopkeeper',
          lastModified: '2025-09-07T15:45:00Z',
          author: user?.username || 'unknown',
        },
        {
          id: 3,
          name: 'Magic Sword Effect',
          type: 'OBJECT',
          content:
            '-- Magic sword special effect\nfunction onWield(ch, obj)\n  ch:send("The sword glows with magical energy!")\nend',
          attachedTo: 'Object 2001: Enchanted Blade',
          lastModified: '2025-09-06T09:15:00Z',
          author: 'coder1',
        },
        {
          id: 4,
          name: 'Global Time Announcer',
          type: 'GLOBAL',
          content:
            '-- Global time announcement\nfunction announceTime()\n  broadcast("The sun moves across the sky...")\nend',
          attachedTo: 'System-wide',
          lastModified: '2025-09-05T12:00:00Z',
          author: 'admin',
        },
      ];
      setScripts(mockScripts);
      setLoading(false);
    }, 500);
  }, [user]);

  const filteredScripts = scripts.filter(script => {
    const matchesSearch =
      script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (script.attachedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    const matchesType = filterType === 'all' || script.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleNewScript = () => {
    const newScript: PageScript = {
      id: Date.now(),
      name: 'New Script',
      type: 'ROOM',
      content: '-- New script\nfunction main()\n  -- Add your code here\nend',
      lastModified: new Date().toISOString(),
      author: user?.username || 'unknown',
    };
    setSelectedScript(newScript);
    setIsEditing(true);
  };

  const handleEditScript = (script: PageScript) => {
    setSelectedScript(script);
    setIsEditing(true);
  };

  const handleSaveScript = (script: Partial<Script>) => {
    const scriptId = script.id ? parseInt(script.id) : undefined;
    if (scriptId && scripts.find(s => s.id === scriptId)) {
      // Update existing
      const existingScript = scripts.find(s => s.id === scriptId)!;
      const updatedData = convertScriptToPageScript(script, existingScript);
      const updatedScript = { ...existingScript, ...updatedData };
      setScripts(prev =>
        prev.map(s => (s.id === scriptId ? updatedScript : s))
      );
    } else {
      // Add new
      const pageScriptData = convertScriptToPageScript(script);
      const newScript: PageScript = {
        id: scriptId || Date.now(),
        name: pageScriptData.name || 'New Script',
        type: pageScriptData.type || 'ROOM',
        content:
          pageScriptData.content ||
          '-- New script\nfunction main()\n  -- Add your code here\nend',
        lastModified: new Date().toISOString(),
        author: user?.username || 'unknown',
      };
      setScripts(prev => [...prev, newScript]);
    }
    setIsEditing(false);
    setSelectedScript(null);
  };

  const handleDeleteScript = (id: number) => {
    if (confirm('Are you sure you want to delete this script?')) {
      setScripts(prev => prev.filter(s => s.id !== id));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ROOM':
        return 'bg-blue-100 text-blue-800';
      case 'MOB':
        return 'bg-green-100 text-green-800';
      case 'OBJECT':
        return 'bg-purple-100 text-purple-800';
      case 'GLOBAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing && selectedScript) {
    return (
      <div className='container mx-auto p-6'>
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>
              {selectedScript.id &&
              scripts.find(s => s.id === selectedScript.id)
                ? 'Edit Script'
                : 'New Script'}
            </h1>
            <div className='space-x-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditing(false);
                  setSelectedScript(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {selectedScript ? (
          <ScriptEditor
            script={convertPageScriptToScript(selectedScript)}
            onSave={handleSaveScript}
          />
        ) : (
          <ScriptEditor onSave={handleSaveScript} />
        )}
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Scripts</h1>
            <p className='text-gray-600 mt-1'>
              Manage Lua scripts for rooms, mobs, objects, and global events
            </p>
          </div>
          <Button onClick={handleNewScript}>
            <Plus className='w-4 h-4 mr-2' />
            New Script
          </Button>
        </div>
      </div>

      <div className='mb-6 flex gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Search scripts by name, content, or attachment...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Types</SelectItem>
            <SelectItem value='ROOM'>Room</SelectItem>
            <SelectItem value='MOB'>Mob</SelectItem>
            <SelectItem value='OBJECT'>Object</SelectItem>
            <SelectItem value='GLOBAL'>Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='text-gray-600 mt-2'>Loading scripts...</p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredScripts.length === 0 ? (
            <div className='col-span-full text-center py-8 text-gray-500'>
              <FileText className='w-12 h-12 mx-auto mb-2 opacity-50' />
              <p>No scripts found matching your criteria</p>
            </div>
          ) : (
            filteredScripts.map(script => (
              <Card
                key={script.id}
                className='hover:shadow-md transition-shadow'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-base'>{script.name}</CardTitle>
                      <Badge className={getTypeColor(script.type)}>
                        {script.type}
                      </Badge>
                    </div>
                    <div className='flex space-x-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEditScript(script)}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteScript(script.id)}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='space-y-2'>
                    {script.attachedTo && (
                      <div className='flex items-center text-sm text-gray-600'>
                        <Database className='w-3 h-3 mr-1' />
                        {script.attachedTo}
                      </div>
                    )}
                    <div className='bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 max-h-20 overflow-hidden'>
                      {script.content.split('\n').slice(0, 3).join('\n')}
                      {script.content.split('\n').length > 3 && '\n...'}
                    </div>
                    <div className='text-xs text-gray-500'>
                      Modified{' '}
                      {new Date(script.lastModified).toLocaleDateString()} by{' '}
                      {script.author}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ScriptsPage() {
  return (
    <PermissionGuard requireCoder={true}>
      <ScriptsPageContent />
    </PermissionGuard>
  );
}
