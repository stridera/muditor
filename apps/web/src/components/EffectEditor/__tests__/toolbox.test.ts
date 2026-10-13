import { buildToolbox, toolboxBlockTypes } from '../toolbox';
import {
  DEDICATED_EFFECT_TYPES,
  GENERIC_EFFECT_BLOCK,
} from '../blocks/data-registry';

describe('effect editor toolbox', () => {
  it('is never null and offers every dedicated effect block plus the generic one', () => {
    const toolbox = buildToolbox(() => true);
    expect(toolbox.kind).toBe('categoryToolbox');
    const offered = new Set(toolboxBlockTypes());
    for (const type of DEDICATED_EFFECT_TYPES) {
      expect(offered).toContain(`effect_${type}`);
    }
    expect(offered).toContain(GENERIC_EFFECT_BLOCK);
  });

  it('drops unregistered blocks and empty categories instead of failing', () => {
    const toolbox = buildToolbox(type => type === 'effect_status');
    expect(toolbox.contents).toHaveLength(1);
    expect(toolbox.contents[0]!.contents).toEqual([
      { kind: 'block', type: 'effect_status' },
    ]);
    expect(buildToolbox(() => false).contents).toEqual([]);
  });
});
