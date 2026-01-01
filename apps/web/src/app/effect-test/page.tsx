'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  EffectEditor,
  type AbilityEffectOutput,
} from '@/components/EffectEditor';
import {
  Zap,
  Heart,
  Clock,
  DropletIcon,
  ShieldAlert,
  Sparkles,
  MinusCircle,
  Pill,
  Eraser,
  TrendingUp,
  Battery,
  Shield,
  AlertTriangle,
  Globe,
  Eye,
  EyeOff,
  Search,
  Navigation,
  Ghost,
  Ban,
  Package,
  Home,
  DoorClosed,
  HeartPulse,
  Code,
  HelpCircle,
} from 'lucide-react';

// Effect type descriptions and explanations
const EFFECT_DESCRIPTIONS: Record<
  number,
  {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
    paramDescriptions: Record<string, string>;
  }
> = {
  1: {
    name: 'Damage',
    icon: Zap,
    color: 'text-red-500',
    description: 'Deals direct damage to the target based on a formula.',
    paramDescriptions: {
      damageType: 'Type of damage (FIRE, COLD, ELECTRIC, etc.)',
      formula: 'Damage calculation formula (e.g., "skill/5 + 10")',
      canCrit: 'Whether this damage can critically hit',
      ignoreArmor: 'Whether this damage bypasses armor',
    },
  },
  2: {
    name: 'Heal',
    icon: Heart,
    color: 'text-green-500',
    description: 'Restores hit points to the target.',
    paramDescriptions: {
      formula: 'Healing calculation formula',
      healType: 'Type of healing (standard, regeneration, etc.)',
    },
  },
  3: {
    name: 'Damage Over Time',
    icon: Clock,
    color: 'text-orange-500',
    description: 'Applies damage that ticks periodically over a duration.',
    paramDescriptions: {
      damageType: 'Type of damage dealt per tick',
      formula: 'Damage per tick formula',
      tickInterval: 'Seconds between damage ticks',
      duration: 'Total duration in seconds',
    },
  },
  4: {
    name: 'Lifesteal',
    icon: DropletIcon,
    color: 'text-purple-500',
    description: 'Heals the caster for a percentage of damage dealt.',
    paramDescriptions: {
      percentage: 'Percentage of damage converted to healing',
      damageType: 'Damage type that triggers lifesteal',
    },
  },
  5: {
    name: 'Reflect',
    icon: ShieldAlert,
    color: 'text-cyan-500',
    description: 'Reflects a portion of incoming damage back to attackers.',
    paramDescriptions: {
      percentage: 'Percentage of damage reflected',
      damageTypes: 'Damage types that can be reflected',
    },
  },
  6: {
    name: 'Apply Status',
    icon: Sparkles,
    color: 'text-purple-400',
    description: 'Applies a status effect to the target.',
    paramDescriptions: {
      statusId: 'ID of the status effect to apply',
      duration: 'Duration of the status effect',
      stacks: 'Number of stacks to apply',
    },
  },
  7: {
    name: 'Remove Status',
    icon: MinusCircle,
    color: 'text-gray-500',
    description: 'Removes a specific status effect from the target.',
    paramDescriptions: {
      statusId: 'ID of the status effect to remove',
      allStacks: 'Whether to remove all stacks',
    },
  },
  8: {
    name: 'Cure',
    icon: Pill,
    color: 'text-green-400',
    description:
      'Cures negative conditions like poison, disease, or blindness.',
    paramDescriptions: {
      cureTypes: 'Types of conditions to cure',
    },
  },
  9: {
    name: 'Dispel',
    icon: Eraser,
    color: 'text-blue-400',
    description: 'Removes magical effects from the target.',
    paramDescriptions: {
      dispelTypes: 'Types of magic to dispel',
      count: 'Number of effects to dispel',
    },
  },
  10: {
    name: 'Stat Modifier',
    icon: TrendingUp,
    color: 'text-blue-500',
    description: 'Temporarily modifies a stat like STR, DEX, or AC.',
    paramDescriptions: {
      stat: 'The stat to modify',
      modifier: 'Amount to add/subtract',
      duration: 'Duration of the buff/debuff',
      stacking: 'How multiple applications stack',
    },
  },
  11: {
    name: 'Resource Delta',
    icon: Battery,
    color: 'text-yellow-500',
    description: 'Modifies a resource like mana, stamina, or moves.',
    paramDescriptions: {
      resource: 'The resource to modify',
      formula: 'Amount formula (positive or negative)',
      max: 'Whether to set to max value',
    },
  },
  12: {
    name: 'Protection',
    icon: Shield,
    color: 'text-green-600',
    description: 'Grants resistance to specific damage types.',
    paramDescriptions: {
      damageTypes: 'Damage types to resist',
      percentage: 'Percentage of damage reduction',
      duration: 'Duration of the protection',
    },
  },
  13: {
    name: 'Vulnerability',
    icon: AlertTriangle,
    color: 'text-red-400',
    description: 'Increases damage taken from specific damage types.',
    paramDescriptions: {
      damageTypes: 'Damage types that deal extra damage',
      percentage: 'Percentage of extra damage taken',
      duration: 'Duration of the vulnerability',
    },
  },
  14: {
    name: 'Globe',
    icon: Globe,
    color: 'text-blue-300',
    description: 'Creates a protective globe that blocks certain effects.',
    paramDescriptions: {
      globeType: 'Type of globe (minor, major, etc.)',
      radius: 'Area of protection',
    },
  },
  15: {
    name: 'Detection',
    icon: Eye,
    color: 'text-indigo-500',
    description: 'Grants ability to detect hidden or invisible things.',
    paramDescriptions: {
      detectTypes: 'What can be detected (invisible, hidden, evil, etc.)',
      range: 'Detection range',
      duration: 'Duration of detection ability',
    },
  },
  16: {
    name: 'Stealth',
    icon: EyeOff,
    color: 'text-gray-600',
    description: 'Makes the target harder to detect.',
    paramDescriptions: {
      stealthType: 'Type of concealment',
      bonus: 'Stealth bonus amount',
      duration: 'Duration of stealth',
    },
  },
  17: {
    name: 'Reveal',
    icon: Search,
    color: 'text-yellow-400',
    description: 'Reveals hidden or invisible creatures/objects.',
    paramDescriptions: {
      revealTypes: 'What gets revealed',
      duration: 'How long things stay revealed',
    },
  },
  18: {
    name: 'Teleport',
    icon: Navigation,
    color: 'text-cyan-400',
    description: 'Transports the target to a different location.',
    paramDescriptions: {
      destination:
        'How destination is determined (recall, zone_random, world_random, anchor, target)',
      targetRoom: 'Target room {zoneId, id} for specific destinations',
    },
  },
  19: {
    name: 'Summon',
    icon: Ghost,
    color: 'text-purple-600',
    description: 'Summons creatures to aid the caster.',
    paramDescriptions: {
      mobZoneId: 'Zone ID of creature template',
      mobId: 'Mob ID to summon',
      count: 'Number of creatures to summon',
      duration: 'How long summons last',
    },
  },
  20: {
    name: 'Banish',
    icon: Ban,
    color: 'text-red-600',
    description: 'Forcibly removes a creature from the area.',
    paramDescriptions: {
      destination: 'Where the target is sent',
      duration: 'How long the banishment lasts',
    },
  },
  21: {
    name: 'Create Object',
    icon: Package,
    color: 'text-amber-500',
    description: 'Creates an item out of thin air.',
    paramDescriptions: {
      objectZoneId: 'Zone ID of object template',
      objectId: 'Object ID to create',
      count: 'Number of objects to create',
    },
  },
  22: {
    name: 'Room Effect',
    icon: Home,
    color: 'text-orange-600',
    description: 'Applies an effect to the entire room.',
    paramDescriptions: {
      effectType: 'Type of room effect',
      duration: 'How long the effect lasts',
      radius: 'Area of effect in rooms',
    },
  },
  23: {
    name: 'Room Barrier',
    icon: DoorClosed,
    color: 'text-stone-500',
    description: 'Creates a barrier blocking movement in certain directions.',
    paramDescriptions: {
      barrierType: 'Type of barrier (wall, force field, etc.)',
      directions: 'Which directions are blocked',
    },
  },
  24: {
    name: 'Resurrect',
    icon: HeartPulse,
    color: 'text-pink-500',
    description: 'Brings a dead character back to life.',
    paramDescriptions: {
      kind: 'Type of resurrection',
      hpPercentage: 'HP percentage upon resurrection',
    },
  },
  25: {
    name: 'Script',
    icon: Code,
    color: 'text-emerald-500',
    description: 'Executes a custom Lua script for complex effects.',
    paramDescriptions: {
      scriptId: 'ID of the script to execute',
      args: 'Arguments to pass to the script',
    },
  },
};

// Get effect info with fallback
function getEffectInfo(effectId: number) {
  return (
    EFFECT_DESCRIPTIONS[effectId] || {
      name: `Effect #${effectId}`,
      icon: HelpCircle,
      color: 'text-gray-400',
      description: 'Unknown effect type',
      paramDescriptions: {},
    }
  );
}

// Format a single effect for display
function EffectReadout({
  effect,
  index,
}: {
  effect: AbilityEffectOutput;
  index: number;
}) {
  const info = getEffectInfo(effect.effectId ?? 0);
  const Icon = info.icon;

  return (
    <div className='p-4 border rounded-lg bg-card'>
      <div className='flex items-start gap-3'>
        <div className={`p-2 rounded-lg bg-muted ${info.color}`}>
          <Icon className='h-5 w-5' />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-medium'>{info.name}</span>
            <Badge variant='outline' className='text-xs'>
              Order: {effect.order}
            </Badge>
            {effect.chancePct < 100 && (
              <Badge variant='secondary' className='text-xs'>
                {effect.chancePct}% chance
              </Badge>
            )}
            {effect.trigger && (
              <Badge className='text-xs'>{effect.trigger}</Badge>
            )}
          </div>
          <p className='text-sm text-muted-foreground mt-1'>
            {info.description}
          </p>

          {effect.condition && (
            <div className='mt-2 p-2 bg-muted rounded text-xs font-mono'>
              <span className='text-muted-foreground'>Condition: </span>
              <span className='text-amber-500'>{effect.condition}</span>
            </div>
          )}

          {Object.keys(effect.overrideParams).length > 0 && (
            <div className='mt-3 space-y-1'>
              <div className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                Parameters
              </div>
              <div className='grid gap-1'>
                {Object.entries(effect.overrideParams).map(([key, value]) => {
                  const paramDesc = (
                    info.paramDescriptions as Record<string, string>
                  )[key];
                  return (
                    <div key={key} className='flex gap-2 text-sm'>
                      <span className='text-muted-foreground min-w-24'>
                        {key}:
                      </span>
                      <span className='font-mono text-xs bg-muted px-1 rounded'>
                        {typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                      {paramDesc && (
                        <span className='text-xs text-muted-foreground italic'>
                          ({paramDesc})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EffectTestPage() {
  const [effects, setEffects] = useState<AbilityEffectOutput[]>([]);

  const handleChange = useCallback((newEffects: AbilityEffectOutput[]) => {
    setEffects(newEffects);
  }, []);

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Effect Editor Test
        </h1>
        <p className='text-muted-foreground mt-1'>
          Experiment with the visual effect editor. Drag blocks from the toolbox
          to build effect pipelines.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Editor Section */}
        <div className='lg:col-span-2'>
          <EffectEditor
            initialEffects={[]}
            onChange={handleChange}
            readOnly={false}
            height='500px'
          />
        </div>

        {/* Effect Readout Section */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              Effect Pipeline Readout
            </CardTitle>
            <CardDescription>
              This shows what your effect pipeline will do when executed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {effects.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <Sparkles className='h-12 w-12 mx-auto mb-3 opacity-20' />
                <p>No effects in the pipeline yet.</p>
                <p className='text-sm'>
                  Drag effect blocks from the toolbox to get started.
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>
                    Pipeline executes {effects.length} effect
                    {effects.length !== 1 ? 's' : ''} in order:
                  </span>
                </div>
                <div className='space-y-3'>
                  {effects.map((effect, index) => (
                    <EffectReadout
                      key={`${effect.effectId}-${effect.order}`}
                      effect={effect}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Raw JSON Section */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Code className='h-5 w-5' />
              Raw JSON Output
            </CardTitle>
            <CardDescription>
              This is the JSON that would be saved to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className='p-4 bg-muted rounded-lg overflow-auto max-h-96 text-xs font-mono'>
              {JSON.stringify(effects, null, 2) || '[]'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
