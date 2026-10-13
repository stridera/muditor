import {
  DEFAULT_PAGE_SIZE,
  OBJECT_TYPES_ALL,
  mobFilterVars,
  objectFilterVars,
  pageSizeFrom,
  pageWindow,
  searchText,
} from '../list-query';

describe('searchText', () => {
  it('trims and nulls blank input', () => {
    expect(searchText({ searchTerm: '  red dragon ' })).toBe('red dragon');
    expect(searchText({ searchTerm: '   ' })).toBeNull();
  });
});

describe('mobFilterVars', () => {
  it('passes the level range through', () => {
    expect(
      mobFilterVars({ searchTerm: '', levelMin: 5, levelMax: 20 })
    ).toEqual({ levelMin: 5, levelMax: 20 });
  });

  it('turns the custom toggles into level bounds, narrowing explicit ones', () => {
    expect(
      mobFilterVars({ searchTerm: '', customFilters: { isHighLevel: true } })
    ).toEqual({ levelMin: 50, levelMax: null });
    expect(
      mobFilterVars({
        searchTerm: '',
        levelMax: 30,
        customFilters: { isNewbie: true },
      })
    ).toEqual({ levelMin: null, levelMax: 10 });
    expect(
      mobFilterVars({
        searchTerm: '',
        levelMin: 70,
        customFilters: { isHighLevel: 'true' },
      }).levelMin
    ).toBe(70);
  });

  it('ignores toggles that are off', () => {
    expect(
      mobFilterVars({ searchTerm: '', customFilters: { isNewbie: false } })
    ).toEqual({ levelMin: null, levelMax: null });
  });
});

describe('objectFilterVars', () => {
  it('maps the custom toggles to cost/weight bounds', () => {
    const vars = objectFilterVars({
      searchTerm: '',
      types: ['WEAPON', 'NOT_A_TYPE'],
      customFilters: { isValuable: true, isLightweight: true, isHeavy: true },
    });
    expect(vars).toMatchObject({
      types: ['WEAPON'],
      costMin: 1000,
      weightMin: 50,
      weightMax: 5,
    });
  });

  it('sends nothing when no filter is set', () => {
    expect(objectFilterVars({ searchTerm: '' })).toEqual({
      levelMin: null,
      levelMax: null,
      types: null,
      costMin: null,
      weightMin: null,
      weightMax: null,
    });
  });

  it('knows every object type the presets use', () => {
    for (const t of ['WEAPON', 'ARMOR', 'CONTAINER', 'FOOD', 'POTION']) {
      expect(OBJECT_TYPES_ALL).toContain(t);
    }
  });
});

describe('paging helpers', () => {
  it('accepts only offered page sizes', () => {
    expect(pageSizeFrom(null)).toBe(DEFAULT_PAGE_SIZE);
    expect(pageSizeFrom('25')).toBe(25);
    expect(pageSizeFrom('9999')).toBe(DEFAULT_PAGE_SIZE);
  });

  it('computes the visible window from the server total', () => {
    expect(pageWindow(1, 50, 120, 50)).toEqual({
      totalPages: 3,
      startItem: 1,
      endItem: 50,
    });
    expect(pageWindow(3, 50, 120, 20)).toEqual({
      totalPages: 3,
      startItem: 101,
      endItem: 120,
    });
    expect(pageWindow(1, 50, 0, 0)).toEqual({
      totalPages: 1,
      startItem: 0,
      endItem: 0,
    });
  });
});
