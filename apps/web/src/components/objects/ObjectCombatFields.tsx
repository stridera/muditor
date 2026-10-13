'use client';

import {
  ARMOR_TYPES,
  DAMAGE_TYPES,
  WEAPON_TYPES,
  type CombatColumns,
} from '@/lib/objectTypeValues';

const INPUT_CLASS =
  'block w-full rounded-md border-input shadow-sm focus:ring-ring focus:border-ring sm:text-sm bg-background text-foreground';

interface ObjectCombatFieldsProps {
  type: string;
  value: CombatColumns;
  onChange: (patch: Partial<CombatColumns>) => void;
}

/** "2d6+3" style summary of the weapon dice, or null when no dice are set. */
export function formatWeaponDice(c: CombatColumns): string | null {
  if (c.weaponDiceNum <= 0 || c.weaponDiceSize <= 0) return null;
  const bonus =
    c.weaponDiceBonus === 0
      ? ''
      : c.weaponDiceBonus > 0
        ? `+${c.weaponDiceBonus}`
        : String(c.weaponDiceBonus);
  return `${c.weaponDiceNum}d${c.weaponDiceSize}${bonus}`;
}

function NumberField({
  label,
  value,
  min,
  onChange,
  help,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (n: number) => void;
  help?: string;
}) {
  return (
    <div>
      <label className='block text-sm font-medium text-muted-foreground mb-1'>
        {label}
        {help ? (
          <span className='ml-2 text-xs font-normal'>({help})</span>
        ) : null}
      </label>
      <input
        type='number'
        aria-label={label}
        value={value}
        min={min}
        step={1}
        onChange={e => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className={INPUT_CLASS}
      />
    </div>
  );
}

/**
 * The typed combat columns of an object: weapon dice + damage type and the
 * armor value. These are real columns the game reads, not part of the `values`
 * JSON, so they are edited here next to the type-specific values.
 */
export function ObjectCombatFields({
  type,
  value,
  onChange,
}: ObjectCombatFieldsProps) {
  const isWeapon = WEAPON_TYPES.includes(type);
  const isArmor = ARMOR_TYPES.includes(type);
  if (!isWeapon && !isArmor) return null;

  if (isArmor) {
    return (
      <div className='grid grid-cols-2 gap-4'>
        <NumberField
          label='Armor Value'
          value={value.armorPct}
          help='higher = more damage absorbed; negative = cursed'
          onChange={n => onChange({ armorPct: n })}
        />
      </div>
    );
  }

  const dice = formatWeaponDice(value);
  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-2 gap-4'>
        <NumberField
          label='Damage Dice Count'
          value={value.weaponDiceNum}
          min={0}
          onChange={n => onChange({ weaponDiceNum: Math.max(0, n) })}
        />
        <NumberField
          label='Damage Dice Sides'
          value={value.weaponDiceSize}
          min={0}
          onChange={n => onChange({ weaponDiceSize: Math.max(0, n) })}
        />
        <NumberField
          label='Damage Bonus'
          value={value.weaponDiceBonus}
          onChange={n => onChange({ weaponDiceBonus: n })}
        />
        <div>
          <label className='block text-sm font-medium text-muted-foreground mb-1'>
            Damage Type
          </label>
          <select
            aria-label='Damage Type'
            value={value.weaponDamageType}
            onChange={e => onChange({ weaponDamageType: e.target.value })}
            className={INPUT_CLASS}
          >
            <option value=''>None</option>
            {DAMAGE_TYPES.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-muted-foreground mb-1'>
            Element
          </label>
          <select
            aria-label='Element'
            value={value.weaponElement}
            onChange={e => onChange({ weaponElement: e.target.value })}
            className={INPUT_CLASS}
          >
            <option value=''>None</option>
            {DAMAGE_TYPES.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <p className='text-xs text-muted-foreground mt-1'>
            Elemental weapons deal this element (checked against resistances)
            while the damage type above keeps the weapon family.
          </p>
        </div>
      </div>
      <p className='text-xs text-muted-foreground' data-testid='dice-summary'>
        {dice
          ? `Each hit rolls ${dice}${value.weaponDamageType ? ` ${value.weaponDamageType}` : ''} damage.`
          : 'No damage dice set: this weapon deals no weapon damage.'}
      </p>
    </div>
  );
}
