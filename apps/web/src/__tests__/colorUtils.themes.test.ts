import { parseXmlLiteColors, stripXmlLiteColors } from '@/utils/colorUtils';

describe('XML-Lite colour classes', () => {
  it('flips black and white with the theme so names never vanish', () => {
    const [black] = parseXmlLiteColors('<b:black>Hunter</>');
    expect(black?.color).toContain('dark:text-gray-300');
    const [white] = parseXmlLiteColors('<white>Paladin</>');
    expect(white?.color).toContain('dark:text-white');
    expect(white?.color).not.toBe('text-white');
  });

  it('strips markup for plain-text subtitles', () => {
    expect(stripXmlLiteColors('for the <cyan>Cleric</> class')).toBe(
      'for the Cleric class'
    );
    expect(stripXmlLiteColors('<b:black>Hunter</>')).toBe('Hunter');
  });
});
