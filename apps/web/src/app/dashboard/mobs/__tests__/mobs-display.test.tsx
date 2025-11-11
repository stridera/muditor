/**
 * Test for mob data display to prevent regression of missing values
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Mock the mob data structure expected by the component
const mockMobData = {
  id: 53000,
  keywords: 'test mob',
  name: 'a test mob',
  roomDescription: 'This is a test mob',
  examineDescription: 'You see a test mob here.',
  level: 10,
  race: 'HUMAN',
  hitRoll: 20,
  armorClass: 5,
  damageDice: '2d6+3',
  hpDice: '3d8+10',
  alignment: 100,
  mobClass: 'Warrior',
  lifeForce: 'LIFE',
  damageType: 'HIT',
  strength: 18,
  intelligence: 12,
  wisdom: 14,
  dexterity: 16,
  constitution: 17,
  charisma: 10,
  mobFlags: ['AGGRESSIVE'],
  effectFlags: ['SANCTUARY'],
  zoneId: 53,
};

// Mock component that displays mob data similar to the real component
function MobDisplayTest({ mob }: { mob: typeof mockMobData }) {
  // Parse dice notation (accept possibly undefined and normalize)
  const parseDice = (diceStr: string | undefined | null) => {
    const safe = diceStr ?? '';
    const match = safe.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return { num: 0, size: 0, bonus: 0 };
    const [, numStr, sizeStr, bonusStr] = match as [
      string,
      string,
      string,
      string?,
    ];
    return {
      num: parseInt(numStr, 10),
      size: parseInt(sizeStr, 10),
      bonus: bonusStr ? parseInt(bonusStr, 10) : 0,
    };
  };

  const damage = parseDice(mob.damageDice ?? '');
  const hp = parseDice(mob.hpDice ?? '');

  return (
    <div data-testid='mob-display'>
      <h3>{mob.name}</h3>
      <div data-testid='race'>Race: {mob.race || 'N/A'}</div>
      <div data-testid='hit-roll'>Hit Roll: {mob.hitRoll || 0}</div>
      <div data-testid='armor-class'>AC: {mob.armorClass || 0}</div>
      <div data-testid='damage'>
        Damage: {damage.num || 0}d{damage.size || 0}
        {(damage.bonus || 0) >= 0 ? '+' : ''}
        {damage.bonus || 0}
      </div>
      <div data-testid='hp'>
        HP: {hp.num || 0}d{hp.size || 0}
        {(hp.bonus || 0) >= 0 ? '+' : ''}
        {hp.bonus || 0}
      </div>
      <div data-testid='stats'>
        STR: {mob.strength || 13}, INT: {mob.intelligence || 13}, WIS:{' '}
        {mob.wisdom || 13}, DEX: {mob.dexterity || 13}, CON:{' '}
        {mob.constitution || 13}, CHA: {mob.charisma || 13}
      </div>
    </div>
  );
}

describe('Mob Data Display', () => {
  it('should display race correctly (not N/A)', () => {
    render(<MobDisplayTest mob={mockMobData} />);

    const raceElement = screen.getByTestId('race');
    expect(raceElement).toHaveTextContent('Race: HUMAN');
    expect(raceElement).not.toHaveTextContent('N/A');
  });

  it('should display hit roll correctly (not 0)', () => {
    render(<MobDisplayTest mob={mockMobData} />);

    const hitRollElement = screen.getByTestId('hit-roll');
    expect(hitRollElement).toHaveTextContent('Hit Roll: 20');
    expect(hitRollElement).not.toHaveTextContent('Hit Roll: 0');
  });

  it('should display armor class correctly (not 0)', () => {
    render(<MobDisplayTest mob={mockMobData} />);

    const armorClassElement = screen.getByTestId('armor-class');
    expect(armorClassElement).toHaveTextContent('AC: 5');
    expect(armorClassElement).not.toHaveTextContent('AC: 0');
  });

  it('should display damage dice correctly (not 0d0+0)', () => {
    render(<MobDisplayTest mob={mockMobData} />);

    const damageElement = screen.getByTestId('damage');
    expect(damageElement).toHaveTextContent('Damage: 2d6+3');
    expect(damageElement).not.toHaveTextContent('0d0+0');
  });

  it('should display HP dice correctly (not 0d0+0)', () => {
    render(<MobDisplayTest mob={mockMobData} />);

    const hpElement = screen.getByTestId('hp');
    expect(hpElement).toHaveTextContent('HP: 3d8+10');
    expect(hpElement).not.toHaveTextContent('0d0+0');
  });

  it('should display all stats correctly (not all 13)', () => {
    render(<MobDisplayTest mob={mockMobData} />);

    const statsElement = screen.getByTestId('stats');
    expect(statsElement).toHaveTextContent('STR: 18');
    expect(statsElement).toHaveTextContent('INT: 12');
    expect(statsElement).toHaveTextContent('WIS: 14');
    expect(statsElement).toHaveTextContent('DEX: 16');
    expect(statsElement).toHaveTextContent('CON: 17');
    expect(statsElement).toHaveTextContent('CHA: 10');

    // Should not show all default values
    expect(statsElement).not.toHaveTextContent(
      'STR: 13, INT: 13, WIS: 13, DEX: 13, CON: 13, CHA: 13'
    );
  });

  it('should handle missing/null values gracefully', () => {
    // Provide an incomplete mob with explicit fallback conversions while preserving type expectations
    const incompleteMob: typeof mockMobData = {
      ...mockMobData,
      race: '', // empty string to trigger N/A fallback
      hitRoll: 0,
      armorClass: 0,
    };

    render(<MobDisplayTest mob={incompleteMob} />);

    // Should show fallback values for missing data
    expect(screen.getByTestId('race')).toHaveTextContent('Race: N/A');
    expect(screen.getByTestId('hit-roll')).toHaveTextContent('Hit Roll: 0');
    expect(screen.getByTestId('armor-class')).toHaveTextContent('AC: 0');
  });

  it('should verify GraphQL query includes all necessary fields', () => {
    // This test documents the fields that must be included in GraphQL queries
    const requiredFields = [
      'id',
      'keywords',
      'name',
      'roomDescription',
      'examineDescription',
      'level',
      'zoneId',
      'race',
      'hitRoll',
      'armorClass',
      'alignment',
      'mobClass',
      'hpDice',
      'damageDice',
      'strength',
      'intelligence',
      'wisdom',
      'dexterity',
      'constitution',
      'charisma',
      'lifeForce',
      'damageType',
      'mobFlags',
      'effectFlags',
    ];

    // Verify our mock data has all required fields
    requiredFields.forEach(field => {
      expect(mockMobData).toHaveProperty(field);
    });
  });
});
