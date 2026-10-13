import { helpPlaceholders } from '../placeholders';

describe('helpPlaceholders', () => {
  it('keeps the spell examples for spells', () => {
    expect(helpPlaceholders('spell').usage).toContain("cast 'fireball'");
    expect(helpPlaceholders('Spell').sphere).toBe('e.g., fire');
  });

  it('does not suggest spell examples for other categories', () => {
    for (const cat of ['race', 'guide', '', undefined, 'command']) {
      const ph = helpPlaceholders(cat);
      expect(ph.usage).not.toContain('fireball');
      expect(ph.sphere).not.toBe('e.g., fire');
      expect(ph.duration).not.toBe('e.g., Instant');
    }
  });
});
