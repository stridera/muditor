'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

export interface Script {
  id: string;
  name: string;
  attachType: string;
  numArgs: number;
  argList?: string;
  commands: string;
  variables: Record<string, any>;
  zoneId?: number;
  mobId?: number;
  objectId?: number;
  roomId?: number;
}

interface ScriptEditorProps {
  script?: Script;
  onSave?: (script: Partial<Script>) => void;
  onTest?: (script: Partial<Script>) => void;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

// Lua language configuration for Monaco
const luaLanguageConfig: any = {
  keywords: [
    'and',
    'break',
    'do',
    'else',
    'elseif',
    'end',
    'false',
    'for',
    'function',
    'goto',
    'if',
    'in',
    'local',
    'nil',
    'not',
    'or',
    'repeat',
    'return',
    'then',
    'true',
    'until',
    'while',
  ],
  mudFunctions: [
    // Common MUD script functions
    'char',
    'mob',
    'obj',
    'room',
    'world',
    'send_to_char',
    'send_to_room',
    'send_to_zone',
    'send_to_all',
    'get_char',
    'get_mob',
    'get_obj',
    'get_room',
    'char_exists',
    'mob_exists',
    'obj_exists',
    'room_exists',
    'is_pc',
    'is_npc',
    'is_god',
    'get_level',
    'get_class',
    'get_race',
    'damage',
    'heal',
    'restore_mana',
    'restore_move',
    'teleport_char',
    'transfer_char',
    'transfer_obj',
    'create_mob',
    'create_obj',
    'destroy_mob',
    'destroy_obj',
    'set_char_var',
    'get_char_var',
    'remove_char_var',
    'set_mob_var',
    'get_mob_var',
    'remove_mob_var',
    'set_obj_var',
    'get_obj_var',
    'remove_obj_var',
    'set_room_var',
    'get_room_var',
    'remove_room_var',
    'random',
    'dice',
    'mudlog',
    'debug',
  ],
  operators: [
    '=',
    '>',
    '<',
    '!',
    '~',
    '?',
    ':',
    '==',
    '<=',
    '>=',
    '!=',
    '&&',
    '||',
    '++',
    '--',
    '+',
    '-',
    '*',
    '/',
    '&',
    '|',
    '^',
    '%',
    '<<',
    '>>',
    '>>>',
    '+=',
    '-=',
    '*=',
    '/=',
    '&=',
    '|=',
    '^=',
    '%=',
    '<<=',
    '>>=',
    '>>>=',
  ],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  tokenizer: {
    root: [
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@mudFunctions': 'support.function',
            '@default': 'identifier',
          },
        },
      ],
      [/[A-Z][\w\$]*/, 'type.identifier'],
      { include: '@whitespace' },
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],
      [/[;,.]/, 'delimiter'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      [/'[^\\']'/, 'string'],
      [/'/, 'string.invalid'],
    ],
    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],
    string: [
      [/[^\\"]+/, 'string'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],
    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  },
};

// Enhanced Lua script templates organized by category
const scriptTemplates = {
  // MOB INTERACTION TEMPLATES
  mob_greeting: {
    name: 'Mob Greeting',
    category: 'Mob Interaction',
    description: 'Greets players when they enter the room',
    triggers: ['greet', 'enter'],
    code: `-- Mob Greeting Script
-- Triggers when a player enters the room

local char = get_character()
local mob = get_mobile()

if char and mob and is_pc(char) then
    send_to_char(char, "The " .. mob.name .. " nods at you in greeting.")
    send_to_room(mob.room, char.name .. " is greeted by the " .. mob.name .. ".", char)
end`,
  },

  mob_combat: {
    name: 'Combat Special',
    category: 'Mob Combat',
    description: 'Special combat abilities for mobs',
    triggers: ['fight', 'hit'],
    code: `-- Mob Combat Special Script
-- Triggers during combat rounds

local char = get_character()
local mob = get_mobile()

if char and mob and random(1, 100) <= 25 then  -- 25% chance
    local damage = dice(2, 8) + 5
    send_to_char(char, "The " .. mob.name .. " unleashes a devastating attack!")
    send_to_room(mob.room, "The " .. mob.name .. " glows with menacing energy!", char)
    
    damage(char, damage, "special")
end`,
  },

  mob_death: {
    name: 'Death Script',
    category: 'Mob Events',
    description: 'Handles special death effects',
    triggers: ['death'],
    code: `-- Mob Death Script
-- Triggers when the mob dies

local killer = get_character()
local mob = get_mobile()

if killer and mob then
    send_to_char(killer, "As " .. mob.name .. " dies, you feel a strange energy surge through you.")
    send_to_room(mob.room, "The air shimmers as " .. mob.name .. " breathes its last.", killer)
    
    -- Special death effects here
    -- heal(killer, dice(3, 8))  -- Healing on kill
    -- grant_exp(killer, 100)    -- Bonus experience
end`,
  },

  // OBJECT INTERACTION TEMPLATES
  object_use: {
    name: 'Object Use',
    category: 'Object Interaction',
    description: 'Basic object usage script',
    triggers: ['use', 'activate'],
    code: `-- Object Use Script
-- Triggers when an object is used

local char = get_character()
local obj = get_object()

if char and obj then
    send_to_char(char, "You use the " .. obj.name .. ".")
    send_to_room(char.room, char.name .. " uses " .. obj.name .. ".", char)
    
    -- Add your custom effects here
    -- heal(char, dice(2, 8))     -- Healing potion
end`,
  },

  object_wear: {
    name: 'Wear Equipment',
    category: 'Object Events',
    description: 'Effects when equipment is worn',
    triggers: ['wear', 'equip'],
    code: `-- Object Wear Script
-- Triggers when the object is worn/equipped

local char = get_character()
local obj = get_object()

if char and obj then
    send_to_char(char, "As you wear " .. obj.name .. ", you feel its power flow through you.")
    send_to_room(char.room, char.name .. " is surrounded by a faint aura as they don " .. obj.name .. ".", char)
    
    -- Add stat bonuses or special effects
    -- set_char_var(char, "magic_armor_bonus", 2)
end`,
  },

  object_timer: {
    name: 'Timer Object',
    category: 'Object Events',
    description: 'Periodic effects for timed objects',
    triggers: ['timer', 'pulse'],
    code: `-- Object Timer Script
-- Triggers periodically while object is carried/worn

local char = get_character()
local obj = get_object()

if char and obj then
    -- Get or initialize tick counter
    local ticks = get_obj_var(obj, "timer_ticks") or 0
    ticks = ticks + 1
    set_obj_var(obj, "timer_ticks", ticks)
    
    if ticks % 10 == 0 then  -- Every 10 ticks
        send_to_char(char, obj.name .. " pulses with magical energy.")
        heal(char, dice(1, 4))  -- Small healing over time
    end
end`,
  },

  // ROOM INTERACTION TEMPLATES
  room_enter: {
    name: 'Room Enter',
    category: 'Room Events',
    description: 'Effects when entering a room',
    triggers: ['enter', 'look'],
    code: `-- Room Enter Script
-- Triggers when someone enters the room

local char = get_character()
local room = get_room()

if char and room then
    if is_pc(char) then
        send_to_char(char, "You feel a strange presence as you enter this place.")
        
        -- Room-specific checks
        if get_char_var(char, "first_visit_" .. room.id) == nil then
            set_char_var(char, "first_visit_" .. room.id, true)
            send_to_char(char, "This is your first time in this mysterious place.")
            -- grant_exp(char, 25)  -- First visit bonus
        end
    end
end`,
  },

  room_command: {
    name: 'Room Command',
    category: 'Room Interaction',
    description: 'Custom room commands',
    triggers: ['command'],
    code: `-- Room Command Script
-- Triggers on specific commands in the room

local char = get_character()
local room = get_room()
local command = get_command()
local args = get_arguments()

if char and room and command then
    if command == "search" then
        send_to_char(char, "You search the area carefully...")
        
        if random(1, 100) <= 30 then  -- 30% chance
            send_to_char(char, "You discover something hidden!")
            -- create_obj(1234, char)  -- Give hidden item
        else
            send_to_char(char, "You find nothing of interest.")
        end
    elseif command == "pray" then
        send_to_char(char, "You offer a prayer in this sacred place.")
        heal(char, dice(1, 8))
        restore_mana(char, 25)
    end
end`,
  },

  // ZONE MANAGEMENT TEMPLATES
  zone_reset: {
    name: 'Zone Reset',
    category: 'Zone Management',
    description: 'Zone reset and maintenance',
    triggers: ['reset'],
    code: `-- Zone Reset Script
-- Triggers during zone resets

local zone = get_zone()

if zone then
    mudlog("Zone " .. zone.name .. " is resetting")
    
    -- Reset special doors
    -- set_door_state(zone.id, 1234, "north", "closed")
    
    -- Respawn special mobs that might have been killed
    -- if not mob_exists(zone.id, 1001) then
    --     create_mob(1001, get_room(zone.id, 1200))
    -- end
    
    -- Reset zone-wide variables
    -- set_zone_var(zone.id, "special_event_active", false)
end`,
  },

  zone_weather: {
    name: 'Weather Effects',
    category: 'Zone Management',
    description: 'Dynamic weather and environmental effects',
    triggers: ['weather', 'pulse'],
    code: `-- Zone Weather Script
-- Creates dynamic weather effects

local zone = get_zone()

if zone then
    local weather = get_zone_var(zone.id, "current_weather") or "clear"
    local weather_timer = get_zone_var(zone.id, "weather_timer") or 0
    
    weather_timer = weather_timer + 1
    set_zone_var(zone.id, "weather_timer", weather_timer)
    
    -- Change weather every 20 ticks
    if weather_timer >= 20 then
        local new_weather = {"clear", "cloudy", "rainy", "stormy"}[random(1, 4)]
        set_zone_var(zone.id, "current_weather", new_weather)
        set_zone_var(zone.id, "weather_timer", 0)
        
        send_to_zone(zone.id, "The weather begins to change as " .. new_weather .. " conditions set in.")
    end
end`,
  },

  // UTILITY TEMPLATES
  utility_variable: {
    name: 'Variable Manager',
    category: 'Utility',
    description: 'Manage persistent variables',
    triggers: ['command'],
    code: `-- Variable Management Script
-- Utility for managing character/object/room variables

local char = get_character()
local command = get_command()
local args = get_arguments()

if char and command == "setvar" then
    local parts = string.split(args, " ")
    if #parts >= 2 then
        local key = parts[1]
        local value = table.concat(parts, " ", 2)
        
        set_char_var(char, key, value)
        send_to_char(char, "Variable '" .. key .. "' set to: " .. value)
    else
        send_to_char(char, "Usage: setvar <key> <value>")
    end
elseif char and command == "getvar" then
    if args and args ~= "" then
        local value = get_char_var(char, args)
        if value then
            send_to_char(char, "Variable '" .. args .. "' = " .. tostring(value))
        else
            send_to_char(char, "Variable '" .. args .. "' is not set.")
        end
    else
        send_to_char(char, "Usage: getvar <key>")
    end
end`,
  },

  utility_teleporter: {
    name: 'Teleporter Hub',
    category: 'Utility',
    description: 'Multi-destination teleporter',
    triggers: ['enter', 'command'],
    code: `-- Teleporter Hub Script
-- Provides multiple teleportation destinations

local char = get_character()
local room = get_room()
local command = get_command()

if char and room then
    if command == "destinations" or command == "list" then
        send_to_char(char, "Available destinations:")
        send_to_char(char, "1. Temple (goto temple)")
        send_to_char(char, "2. Market (goto market)")  
        send_to_char(char, "3. Arena (goto arena)")
        send_to_char(char, "4. Wilderness (goto wild)")
    elseif command == "goto" then
        local dest = get_arguments()
        local destinations = {
            temple = 3001,
            market = 3050,
            arena = 3100,
            wild = 3200
        }
        
        if destinations[dest] then
            send_to_char(char, "The magical portal swirls and transports you!")
            send_to_room(room, char.name .. " steps through a shimmering portal and vanishes.")
            teleport_char(char, destinations[dest])
            send_to_room(get_room(destinations[dest]), char.name .. " emerges from a swirling portal.", char)
        else
            send_to_char(char, "Unknown destination. Type 'destinations' for a list.")
        end
    end
end`,
  },
};

export default function ScriptEditor({
  script,
  onSave,
  onTest,
  onChange,
  readOnly = false,
  height = '400px',
}: ScriptEditorProps) {
  const [code, setCode] = useState(script?.commands || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (script?.commands !== code) {
      setCode(script?.commands || '');
    }
  }, [script]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Configure Monaco for Lua
    if (typeof window !== 'undefined') {
      import('monaco-editor').then(monaco => {
        // Register Lua language if not already registered
        if (!monaco.languages.getLanguages().find(lang => lang.id === 'lua')) {
          monaco.languages.register({ id: 'lua' });
          monaco.languages.setMonarchTokensProvider('lua', luaLanguageConfig);

          // Set theme
          monaco.editor.defineTheme('muditor-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              {
                token: 'support.function',
                foreground: '4FC1FF',
                fontStyle: 'bold',
              },
              { token: 'keyword', foreground: 'FF6B6B', fontStyle: 'bold' },
              { token: 'string', foreground: '4ECDC4' },
              { token: 'number', foreground: 'FFE66D' },
              { token: 'comment', foreground: '95A5A6', fontStyle: 'italic' },
            ],
            colors: {
              'editor.background': '#1e1e1e',
              'editor.foreground': '#d4d4d4',
            },
          });
        }

        // Apply Lua language and theme
        monaco.editor.setModelLanguage(editor.getModel()!, 'lua');
        monaco.editor.setTheme('muditor-dark');
      });
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onChange?.(newCode);

    // Clear validation errors when code changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateScript = async () => {
    setIsValidating(true);
    try {
      // Basic Lua syntax validation
      const errors: string[] = [];

      // Check for basic syntax issues
      const lines = code.split('\n');
      const inComment = false;

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('--')) return;

        // Check for common issues
        if (
          trimmed.includes('function') &&
          !trimmed.includes('end') &&
          !lines.slice(index + 1).some(l => l.includes('end'))
        ) {
          errors.push(`Line ${index + 1}: Function may be missing 'end'`);
        }

        if (
          (trimmed.includes('if') ||
            trimmed.includes('for') ||
            trimmed.includes('while')) &&
          !trimmed.includes('then') &&
          !trimmed.includes('do')
        ) {
          errors.push(
            `Line ${index + 1}: Control structure may be missing 'then' or 'do'`
          );
        }
      });

      // Check balanced parentheses
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push('Unbalanced parentheses');
      }

      setValidationErrors(errors);
    } catch (err) {
      setValidationErrors(['Validation error: ' + (err as Error).message]);
    } finally {
      setIsValidating(false);
    }
  };

  const insertTemplate = () => {
    if (selectedTemplate && editorRef.current) {
      const template =
        scriptTemplates[selectedTemplate as keyof typeof scriptTemplates];
      if (template && typeof template === 'object' && 'code' in template) {
        editorRef.current.setValue(template.code);
        setCode(template.code);
        onChange?.(template.code);
      }
    }
  };

  // Get unique categories from templates
  const categories = Array.from(
    new Set(
      Object.values(scriptTemplates).map(template =>
        typeof template === 'object' && 'category' in template
          ? template.category
          : 'Other'
      )
    )
  ).sort();

  // Filter templates by selected category
  const filteredTemplates = Object.entries(scriptTemplates).filter(
    ([key, template]) => {
      if (!selectedCategory) return true;
      return (
        typeof template === 'object' &&
        'category' in template &&
        template.category === selectedCategory
      );
    }
  );

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...script,
        commands: code,
      });
    }
  };

  const handleTest = () => {
    if (onTest) {
      onTest({
        ...script,
        commands: code,
      });
    }
  };

  return (
    <div className='script-editor border border-gray-300 rounded-lg overflow-hidden'>
      {/* Toolbar */}
      <div className='bg-gray-100 border-b px-4 py-2 space-y-2'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700'>
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedTemplate('');
              }}
              className='text-sm border border-gray-300 rounded px-2 py-1 min-w-[140px]'
            >
              <option value=''>All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700'>
              Template:
            </label>
            <select
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
              className='text-sm border border-gray-300 rounded px-2 py-1 min-w-[200px]'
            >
              <option value=''>Select template...</option>
              {filteredTemplates.map(([key, template]) => {
                const tmpl =
                  typeof template === 'object' && 'name' in template
                    ? template
                    : null;
                return tmpl ? (
                  <option key={key} value={key}>
                    {tmpl.name} - {tmpl.description}
                  </option>
                ) : null;
              })}
            </select>
          </div>

          <button
            onClick={insertTemplate}
            disabled={!selectedTemplate}
            className='text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Insert Template
          </button>
        </div>

        {/* Template Info */}
        {selectedTemplate &&
          (() => {
            const template =
              scriptTemplates[selectedTemplate as keyof typeof scriptTemplates];
            return typeof template === 'object' && 'triggers' in template ? (
              <div className='text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded'>
                <span className='font-medium'>Triggers:</span>{' '}
                {template.triggers?.join(', ')}
                <span className='ml-4 font-medium'>Description:</span>{' '}
                {template.description}
              </div>
            ) : null;
          })()}

        {/* Action Buttons */}
        <div className='flex items-center gap-2 justify-end'>
          <button
            onClick={validateScript}
            disabled={isValidating}
            className='text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50'
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </button>
          <button
            onClick={formatCode}
            className='text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700'
          >
            Format
          </button>
          {onTest && (
            <button
              onClick={handleTest}
              className='text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700'
            >
              Test
            </button>
          )}
          {onSave && (
            <button
              onClick={handleSave}
              className='text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700'
            >
              Save
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <Editor
        height={height}
        defaultLanguage='lua'
        value={code}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          folding: true,
          matchBrackets: 'always',
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          fontSize: 14,
          fontFamily: '"Fira Code", "JetBrains Mono", monospace',
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
        }}
      />

      {/* Validation Results */}
      {validationErrors.length > 0 && (
        <div className='bg-red-50 border-t border-red-200 p-3'>
          <h4 className='text-sm font-medium text-red-800 mb-2'>
            Validation Errors:
          </h4>
          <ul className='text-sm text-red-700 space-y-1'>
            {validationErrors.map((error, index) => (
              <li key={index} className='flex items-start gap-2'>
                <span className='text-red-500'>•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Help Section */}
      <details className='bg-gray-50 border-t'>
        <summary className='px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100'>
          📚 Lua Scripting Reference
        </summary>
        <div className='px-4 py-3 space-y-3'>
          <div>
            <h5 className='font-medium text-gray-800'>Common MUD Functions:</h5>
            <p className='text-sm text-gray-600 mt-1'>
              <code>get_character()</code>, <code>get_mobile()</code>,{' '}
              <code>get_object()</code>, <code>get_room()</code>
              <br />
              <code>send_to_char(char, message)</code>,{' '}
              <code>send_to_room(room, message, exclude)</code>
              <br />
              <code>is_pc(char)</code>, <code>is_npc(char)</code>,{' '}
              <code>get_level(char)</code>
            </p>
          </div>
          <div>
            <h5 className='font-medium text-gray-800'>Variable Storage:</h5>
            <p className='text-sm text-gray-600 mt-1'>
              <code>set_char_var(char, "key", value)</code>,{' '}
              <code>get_char_var(char, "key")</code>
              <br />
              <code>set_mob_var(mob, "key", value)</code>,{' '}
              <code>get_mob_var(mob, "key")</code>
            </p>
          </div>
          <div>
            <h5 className='font-medium text-gray-800'>Utility Functions:</h5>
            <p className='text-sm text-gray-600 mt-1'>
              <code>random(min, max)</code>, <code>dice(num, size)</code>,{' '}
              <code>mudlog(message)</code>
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
