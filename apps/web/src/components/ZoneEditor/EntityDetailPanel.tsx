'use client';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';

// Lightweight type mirrors of what PropertyPanel already uses
interface MobEntity {
  id: number;
  name: string;
  level: number;
  race?: string;
  mobClass?: string;
  class?: string; // alias used in palette
  hitpoints?: number;
  alignment?: string; // lifeForce mapping
  difficulty?: 'easy' | 'medium' | 'hard' | 'boss';
  keywords?: string[];
  description?: string; // roomDescription
  examineDescription?: string;
  hpDice?: string;
  damageDice?: string;
  armorClass?: number;
  hitRoll?: number;
  wealth?: number;
  gender?: string;
  size?: string;
  lifeForce?: string;
  composition?: string;
  strength?: number;
  intelligence?: number;
  wisdom?: number;
  dexterity?: number;
  constitution?: number;
  charisma?: number;
  perception?: number;
  concealment?: number;
  mobFlags?: string[];
  effectFlags?: string[];
  position?: string;
  stance?: string;
  equipment?: Array<{
    id: number;
    name: string;
    type: string;
    cost?: number;
    wearLocation?: string;
  }>;
}
interface ObjectEntity {
  id: number;
  name: string;
  type: string;
  keywords?: string[];
  value?: number;
  weight?: number;
  level?: number;
  material?: string;
  condition?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description?: string; // roomDescription
  examineDescription?: string;
}
interface ShopEntity {
  id: number;
  keeperId: number;
  buyProfit: number;
  sellProfit: number;
}

export type EntityDetail =
  | { kind: 'mob'; data: MobEntity }
  | { kind: 'object'; data: ObjectEntity }
  | { kind: 'shop'; data: ShopEntity; keeper?: MobEntity };

interface EntityDetailPanelProps {
  entity: EntityDetail;
  onClose: () => void;
  viewMode: 'edit' | 'view';
  onJumpToMob?: (mobId: number) => void;
  onRemove?: (kind: 'mob' | 'object' | 'shop', id: number) => void;
}

export const EntityDetailPanel: React.FC<EntityDetailPanelProps> = ({
  entity,
  onClose,
  viewMode,
  onJumpToMob,
  onRemove,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const base = isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';

  const headerColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const subtle = isDark ? 'text-gray-400' : 'text-gray-600';

  // Tab configuration (Raw only in edit mode)
  const TABS: Array<{ key: string; label: string; hidden?: boolean }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'stats', label: 'Stats', hidden: entity.kind !== 'mob' },
    { key: 'combat', label: 'Combat', hidden: entity.kind !== 'mob' },
    { key: 'flags', label: 'Flags' },
    { key: 'equipment', label: 'Equipment', hidden: entity.kind !== 'mob' },
    { key: 'raw', label: 'Raw', hidden: viewMode !== 'edit' },
  ];
  const [activeTab, setActiveTab] = useState<string>('overview');
  const isTabActive = (key: string) => activeTab === key;

  // removed legacy renderMob helper (tabs now handle segmented rendering)

  // removed legacy renderObject helper

  const renderShop = (s: ShopEntity, keeper?: MobEntity) => (
    <div className='space-y-2'>
      {keeper && (
        <div className='text-sm'>
          <span className='font-medium'>Keeper:</span> {keeper.name} (Lv{' '}
          {keeper.level})
        </div>
      )}
      <div className='text-sm'>
        <span className='font-medium'>Buy Profit:</span> {s.buyProfit}%
      </div>
      <div className='text-sm'>
        <span className='font-medium'>Sell Profit:</span> {s.sellProfit}%
      </div>
    </div>
  );

  // Focus management
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Compute display name per entity kind
  const displayName =
    entity.kind === 'mob'
      ? (entity.data as MobEntity).name
      : entity.kind === 'object'
        ? (entity.data as ObjectEntity).name
        : entity.keeper
          ? `${entity.keeper.name}'s Shop`
          : `Shop ${entity.data.id}`;

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-end pt-16 pr-6 pl-6'
      role='dialog'
      aria-modal='true'
      aria-labelledby='entity-detail-title'
    >
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        className={`relative w-full max-w-5xl h-[calc(100vh-5rem)] rounded-lg shadow-xl border ${border} ${base} flex flex-col overflow-hidden`}
      >
        <div className={`px-6 py-5 border-b ${border} flex items-center gap-6`}>
          <div className='flex-1 min-w-0'>
            <h4
              id='entity-detail-title'
              className={`text-2xl font-semibold mb-1 truncate ${headerColor}`}
            >
              {displayName}
            </h4>
            <div className={`text-xs ${subtle} flex flex-wrap gap-4`}>
              <span>ID: {entity.data.id}</span>
              <span>Kind: {entity.kind}</span>
              {entity.kind === 'mob' && (
                <span>
                  Lvl {(entity.data as MobEntity).level} •{' '}
                  {(entity.data as MobEntity).race}
                </span>
              )}
              {entity.kind === 'object' && (
                <span>Type {(entity.data as ObjectEntity).type}</span>
              )}
              {entity.kind === 'shop' && (
                <span>
                  Buy/Sell: {(entity.data as ShopEntity).buyProfit}/
                  {(entity.data as ShopEntity).sellProfit}%
                </span>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div className='hidden md:flex gap-1'>
              {TABS.filter(t => !t.hidden).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    isTabActive(tab.key)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isDark
                        ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              ref={closeRef}
              onClick={onClose}
              className='px-3 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
              title='Close'
            >
              ✕
            </button>
          </div>
        </div>
        <div className='flex-1 px-6 py-5 overflow-y-auto text-sm'>
          {isTabActive('overview') && (
            <div className='space-y-6'>
              {entity.kind === 'mob' && (
                <>
                  {(entity.data as MobEntity).difficulty && (
                    <div className='text-sm'>
                      <span className='font-medium'>Difficulty:</span>{' '}
                      {(entity.data as MobEntity).difficulty}
                    </div>
                  )}
                  {(entity.data as MobEntity).alignment && (
                    <div className='text-sm'>
                      <span className='font-medium'>Alignment:</span>{' '}
                      {(entity.data as MobEntity).alignment}
                    </div>
                  )}
                  {(entity.data as MobEntity).gender ||
                  (entity.data as MobEntity).size ? (
                    <div className='text-sm'>
                      <span className='font-medium'>Profile:</span>{' '}
                      {(entity.data as MobEntity).gender}{' '}
                      {(entity.data as MobEntity).size}
                    </div>
                  ) : null}
                  {(entity.data as MobEntity).lifeForce ||
                  (entity.data as MobEntity).composition ? (
                    <div className='text-sm'>
                      <span className='font-medium'>Essence:</span>{' '}
                      {(entity.data as MobEntity).lifeForce} /{' '}
                      {(entity.data as MobEntity).composition}
                    </div>
                  ) : null}
                  {(entity.data as MobEntity).description && (
                    <div className='text-sm whitespace-pre-wrap'>
                      {(entity.data as MobEntity).description}
                    </div>
                  )}
                  {(entity.data as MobEntity).examineDescription && (
                    <div className='text-xs italic whitespace-pre-wrap opacity-80'>
                      {(entity.data as MobEntity).examineDescription}
                    </div>
                  )}
                  {(entity.data as MobEntity).keywords?.length ? (
                    <div className='text-xs flex flex-wrap gap-1'>
                      {(entity.data as MobEntity).keywords!.map(k => (
                        <span
                          key={k}
                          className='px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700'
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
              {entity.kind === 'object' && (
                <>
                  {(entity.data as ObjectEntity).description && (
                    <div className='text-sm whitespace-pre-wrap'>
                      {(entity.data as ObjectEntity).description}
                    </div>
                  )}
                  {(entity.data as ObjectEntity).examineDescription && (
                    <div className='text-xs italic whitespace-pre-wrap opacity-80'>
                      {(entity.data as ObjectEntity).examineDescription}
                    </div>
                  )}
                  {(entity.data as ObjectEntity).keywords?.length ? (
                    <div className='text-xs flex flex-wrap gap-1'>
                      {(entity.data as ObjectEntity).keywords!.map(k => (
                        <span
                          key={k}
                          className='px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700'
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
              {entity.kind === 'shop' &&
                renderShop(entity.data as ShopEntity, entity.keeper)}
            </div>
          )}
          {entity.kind === 'mob' && isTabActive('stats') && (
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <h5 className='text-xs uppercase tracking-wide font-semibold'>
                  Attributes
                </h5>
                <div className='text-xs space-y-1'>
                  {(() => {
                    const mob = entity.data as MobEntity;
                    const attrKeys: Array<keyof MobEntity> = [
                      'strength',
                      'intelligence',
                      'wisdom',
                      'dexterity',
                      'constitution',
                      'charisma',
                    ];
                    return attrKeys.map(
                      key =>
                        mob[key] !== undefined && (
                          <div
                            key={key as string}
                            className='flex justify-between'
                          >
                            <span className='capitalize'>{key}:</span>
                            <span>{mob[key] as number}</span>
                          </div>
                        )
                    );
                  })()}
                </div>
              </div>
              <div className='space-y-2'>
                <h5 className='text-xs uppercase tracking-wide font-semibold'>
                  Awareness
                </h5>
                <div className='text-xs space-y-1'>
                  {(entity.data as MobEntity).perception !== undefined && (
                    <div className='flex justify-between'>
                      <span>Perception:</span>
                      <span>{(entity.data as MobEntity).perception}</span>
                    </div>
                  )}
                  {(entity.data as MobEntity).concealment !== undefined && (
                    <div className='flex justify-between'>
                      <span>Concealment:</span>
                      <span>{(entity.data as MobEntity).concealment}</span>
                    </div>
                  )}
                  {(entity.data as MobEntity).difficulty && (
                    <div className='flex justify-between'>
                      <span>Difficulty:</span>
                      <span>{(entity.data as MobEntity).difficulty}</span>
                    </div>
                  )}
                  {(entity.data as MobEntity).wealth !== undefined && (
                    <div className='flex justify-between'>
                      <span>Wealth:</span>
                      <span>{(entity.data as MobEntity).wealth}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {entity.kind === 'mob' && isTabActive('combat') && (
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <h5 className='text-xs uppercase tracking-wide font-semibold'>
                  Dice
                </h5>
                <div className='text-xs space-y-1'>
                  {(entity.data as MobEntity).hpDice && (
                    <div className='flex justify-between'>
                      <span>HP Dice:</span>
                      <span>{(entity.data as MobEntity).hpDice}</span>
                    </div>
                  )}
                  {(entity.data as MobEntity).damageDice && (
                    <div className='flex justify-between'>
                      <span>Damage Dice:</span>
                      <span>{(entity.data as MobEntity).damageDice}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <h5 className='text-xs uppercase tracking-wide font-semibold'>
                  Combat Stats
                </h5>
                <div className='text-xs space-y-1'>
                  {(entity.data as MobEntity).hitRoll !== undefined && (
                    <div className='flex justify-between'>
                      <span>Hit Roll:</span>
                      <span>{(entity.data as MobEntity).hitRoll}</span>
                    </div>
                  )}
                  {(entity.data as MobEntity).armorClass !== undefined && (
                    <div className='flex justify-between'>
                      <span>Armor Class:</span>
                      <span>{(entity.data as MobEntity).armorClass}</span>
                    </div>
                  )}
                  {(entity.data as MobEntity).position && (
                    <div className='flex justify-between'>
                      <span>Position:</span>
                      <span>{(entity.data as MobEntity).position}</span>
                    </div>
                  )}
                  {(entity.data as MobEntity).stance && (
                    <div className='flex justify-between'>
                      <span>Stance:</span>
                      <span>{(entity.data as MobEntity).stance}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {isTabActive('flags') && (
            <div className='space-y-6'>
              {entity.kind === 'mob' && (
                <>
                  {(entity.data as MobEntity).mobFlags?.length ? (
                    <div>
                      <h5 className='text-xs uppercase tracking-wide font-semibold mb-2'>
                        Mob Flags
                      </h5>
                      <div className='flex flex-wrap gap-1'>
                        {(entity.data as MobEntity).mobFlags!.map(f => (
                          <span
                            key={f}
                            className='px-1 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {(entity.data as MobEntity).effectFlags?.length ? (
                    <div>
                      <h5 className='text-xs uppercase tracking-wide font-semibold mb-2'>
                        Effect Flags
                      </h5>
                      <div className='flex flex-wrap gap-1'>
                        {(entity.data as MobEntity).effectFlags!.map(f => (
                          <span
                            key={f}
                            className='px-1 py-0.5 text-xs rounded bg-purple-100 dark:bg-purple-900 dark:text-purple-200'
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
              {entity.kind === 'object' && (
                <div className='text-xs opacity-70'>
                  No flag data fetched for objects yet.
                </div>
              )}
              {entity.kind === 'shop' && (
                <div className='text-xs opacity-70'>
                  Shop flags not implemented.
                </div>
              )}
            </div>
          )}
          {isTabActive('equipment') && entity.kind === 'mob' && (
            <div className='space-y-4'>
              {(entity.data as MobEntity).equipment?.length ? (
                <div>
                  <h5 className='text-xs uppercase tracking-wide font-semibold mb-2'>
                    Equipment
                  </h5>
                  <ul className='space-y-1'>
                    {(entity.data as MobEntity).equipment!.map(eq => (
                      <li
                        key={eq.id}
                        className='flex justify-between text-xs border-b border-dashed pb-1'
                      >
                        <span className='truncate'>
                          {eq.name}{' '}
                          <span className='opacity-60'>({eq.type})</span>
                        </span>
                        {eq.wearLocation && (
                          <span className='uppercase tracking-wide opacity-60'>
                            {eq.wearLocation}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className='text-xs opacity-70'>
                  No equipment resets found.
                </div>
              )}
            </div>
          )}
          {isTabActive('raw') && viewMode === 'edit' && (
            <pre
              className={`text-xs p-3 rounded-md overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'} border ${border}`}
            >
              {JSON.stringify(entity, null, 2)}
            </pre>
          )}
        </div>
        {viewMode === 'edit' && (
          <div
            className={`px-6 py-4 border-t ${border} flex items-center gap-2`}
          >
            {entity.kind === 'shop' && entity.keeper && (
              <button
                onClick={() => onJumpToMob?.(entity.keeper!.id)}
                className='text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
              >
                Jump to Keeper
              </button>
            )}
            <button
              onClick={() => onRemove?.(entity.kind, entity.data.id)}
              className='ml-auto text-xs px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
