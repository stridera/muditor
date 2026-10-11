import { hrefWithZone, newEntityZone } from '../zone-nav';

describe('hrefWithZone', () => {
  it('adds ?zone= to zone-scoped list links', () => {
    for (const path of ['rooms', 'mobs', 'objects', 'shops', 'quests']) {
      expect(hrefWithZone(`/dashboard/${path}`, 530)).toBe(
        `/dashboard/${path}?zone=530`
      );
    }
  });

  it('keeps zone 0 (a valid zone)', () => {
    expect(hrefWithZone('/dashboard/mobs', 0)).toBe('/dashboard/mobs?zone=0');
  });

  it('leaves links alone without a remembered zone', () => {
    expect(hrefWithZone('/dashboard/mobs', null)).toBe('/dashboard/mobs');
  });

  it('leaves non-zone-scoped links alone', () => {
    expect(hrefWithZone('/dashboard/zones', 530)).toBe('/dashboard/zones');
    expect(hrefWithZone('/dashboard/races', 530)).toBe('/dashboard/races');
  });
});

describe('newEntityZone', () => {
  it('uses a valid zone param', () => {
    expect(newEntityZone('30', 511)).toBe(30);
    expect(newEntityZone('0', 511)).toBe(0);
  });

  it('falls back when the param is missing or invalid', () => {
    expect(newEntityZone(null, 511)).toBe(511);
    expect(newEntityZone('abc', 511)).toBe(511);
    expect(newEntityZone('-4', 511)).toBe(511);
  });
});
