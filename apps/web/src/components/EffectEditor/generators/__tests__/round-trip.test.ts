import type Blockly from 'blockly';
import {
  clearEffectEditorData,
  setEffectEditorData,
} from '../../blocks/data-registry';
import { loadEffectsIntoWorkspace } from '../block-loader';
import { generateJson, type AbilityEffectOutput } from '../json-generator';
import { planEffectSave } from '../save-payload';

/** Minimal Blockly stand-in: string-valued fields, dropdown restrictions, next links. */
class FakeBlock {
  data: string | null = null;
  parent: FakeBlock | null = null;
  next: FakeBlock | null = null;
  fields: Record<string, string> = {};
  inputs: Record<string, FakeBlock | null> = {};
  constructor(
    public type: string,
    private allowed: Record<string, string[]>,
    fieldNames: string[]
  ) {
    for (const f of fieldNames) this.fields[f] = f === 'chancePct' ? '100' : '';
    this.fields['trigger'] = 'on_cast';
  }
  getField(name: string) {
    if (!(name in this.fields)) return null;
    return {
      setValue: (v: string) => {
        const allowed = this.allowed[name];
        if (allowed && !allowed.includes(v)) return; // Blockly ignores invalid options
        this.fields[name] = v;
      },
    };
  }
  getFieldValue(name: string) {
    return name in this.fields ? this.fields[name] : null;
  }
  getInputTargetBlock(name: string) {
    return this.inputs[name] ?? null;
  }
  getInput() {
    return null;
  }
  getNextBlock() {
    return this.next;
  }
  get previousConnection() {
    return { owner: this };
  }
  get nextConnection() {
    return {
      connect: (c: { owner: FakeBlock }) => {
        this.next = c.owner;
        c.owner.parent = this;
      },
    };
  }
  initSvg() {}
  moveBy() {}
}

class FakeWorkspace {
  blocks: FakeBlock[] = [];
  constructor(private fieldsByType: Record<string, string[]>) {}
  clear() {
    this.blocks = [];
  }
  render() {}
  newBlock(type: string) {
    const b = new FakeBlock(type, { trigger: ['on_cast', 'on_hit'] }, [
      ...(this.fieldsByType[type] ?? []),
      'chancePct',
    ]);
    this.blocks.push(b);
    return b;
  }
  getTopBlocks() {
    return this.blocks.filter(b => !b.parent);
  }
}

const DAMAGE_DEFAULTS = { type: 'fire', formula: 'level', amount: 0 };
const STATUS_DEFAULTS = { flag: 'blind', duration: '10' };

function makeWorkspace() {
  setEffectEditorData({
    effects: [
      {
        id: 1,
        name: 'damage',
        effectType: 'instant',
        defaultParams: DAMAGE_DEFAULTS,
      },
      {
        id: 2,
        name: 'status',
        effectType: 'status',
        defaultParams: STATUS_DEFAULTS,
      },
    ],
  });
  return new FakeWorkspace({
    effect_damage: Object.keys(DAMAGE_DEFAULTS),
    effect_status: Object.keys(STATUS_DEFAULTS),
  });
}

const stored: AbilityEffectOutput[] = [
  {
    effectId: 1,
    order: 0,
    trigger: 'on_cast',
    chancePct: 100,
    condition: 'target.isUndead',
    overrideParams: {
      type: 'fire',
      formula: 'level * 2',
      multihit: 3,
      boltCount: 4,
      casterClassMultiplier: { sorcerer: 1.5 },
      multipliers: [{ when: 'x', value: 2 }],
      components: [
        { type: 'fire', percent: 60 },
        { type: 'shock', percent: 40 },
      ],
      durationUnit: 'rounds',
      breakOnDamage: true,
    },
  },
  {
    effectId: 2,
    order: 1,
    trigger: 'passive', // not a dropdown option
    chancePct: 50,
    overrideParams: {
      flag: 'blind',
      duration: '10',
      amount: 5,
      durationUnit: 'hours',
      mobZone: 30,
      mobId: 0,
    },
  },
];

describe('effect editor round trip', () => {
  afterEach(() => clearEffectEditorData());

  it('preserves every stored key, trigger, chance and condition when nothing is edited', () => {
    const ws = makeWorkspace();
    loadEffectsIntoWorkspace(ws as unknown as Blockly.WorkspaceSvg, stored);
    const out = generateJson(ws as unknown as Blockly.WorkspaceSvg);
    expect(out).toEqual(stored);
  });

  it('keeps unknown keys when one field is edited and changes only that field', () => {
    const ws = makeWorkspace();
    loadEffectsIntoWorkspace(ws as unknown as Blockly.WorkspaceSvg, stored);
    ws.blocks[0]!.fields['formula'] = 'level * 3';
    ws.blocks[1]!.fields['duration'] = '20';
    const out = generateJson(ws as unknown as Blockly.WorkspaceSvg);
    expect(out[0]!.overrideParams).toEqual({
      ...stored[0]!.overrideParams,
      formula: 'level * 3',
    });
    expect(out[1]!.overrideParams).toEqual({
      ...stored[1]!.overrideParams,
      duration: '20',
    });
    expect(out[1]!.trigger).toBe('passive');
    expect(out[0]!.condition).toBe('target.isUndead');
  });

  it('applies trigger edits and lets optional fields be cleared', () => {
    const ws = makeWorkspace();
    loadEffectsIntoWorkspace(ws as unknown as Blockly.WorkspaceSvg, stored);
    ws.blocks[0]!.fields['trigger'] = 'on_hit';
    ws.blocks[0]!.fields['type'] = '';
    const out = generateJson(ws as unknown as Blockly.WorkspaceSvg);
    expect(out[0]!.trigger).toBe('on_hit');
    expect(out[0]!.overrideParams).not.toHaveProperty('type');
    expect(out[0]!.overrideParams['multihit']).toBe(3);
  });

  it('survives reordering the top-level chain', () => {
    const ws = makeWorkspace();
    loadEffectsIntoWorkspace(ws as unknown as Blockly.WorkspaceSvg, stored);
    const [a, b] = ws.blocks;
    a!.next = null;
    b!.parent = null;
    b!.next = a!;
    a!.parent = b!;
    const out = generateJson(ws as unknown as Blockly.WorkspaceSvg);
    expect(out.map(e => e.effectId)).toEqual([2, 1]);
    expect(out[1]!.overrideParams).toEqual(stored[0]!.overrideParams);
  });
});

describe('planEffectSave', () => {
  it('reports unchanged and counts gates instead of dropping them silently', () => {
    expect(planEffectSave(stored, stored).unchanged).toBe(true);
    const withGate: AbilityEffectOutput[] = [
      ...stored,
      { gateType: 'chance', overrideParams: {}, order: 2, chancePct: 100 },
    ];
    const plan = planEffectSave(withGate, stored);
    expect(plan.gateCount).toBe(1);
    expect(plan.unchanged).toBe(false);
    expect(plan.effects).toHaveLength(2);
  });

  it('keeps condition and detects param changes', () => {
    const edited = JSON.parse(JSON.stringify(stored)) as AbilityEffectOutput[];
    edited[0]!.overrideParams['multihit'] = 4;
    const plan = planEffectSave(edited, stored);
    expect(plan.unchanged).toBe(false);
    expect(plan.effects[0]!.condition).toBe('target.isUndead');
  });
});
