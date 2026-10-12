import { isRenderableSphereColor } from './sphere-color';

describe('isRenderableSphereColor (game tag-body grammar)', () => {
  it.each([
    'red',
    'cyan',
    'b:cyan',
    'b:black',
    'b:white',
    'magenta',
    'orange',
    'brown',
    'teal',
    'purple',
    'u:b:yellow',
    'dim',
    'bg-red:white',
    '#ff8800',
    'bg#00ff00:b',
    'c196',
    'c0',
    'c255',
    'bgc17:white',
  ])('accepts %s', color => {
    expect(isRenderableSphereColor(color)).toBe(true);
  });

  it.each([
    'chartreuse', // unknown colour word
    'fire', // semantic alias: would recurse
    'danger',
    'bold', // not a modifier (the modifier is "b")
    'b::red', // empty part
    'red:', // trailing separator
    ':red',
    '#ff88', // short hex
    '#gg0000',
    '#ff8800aa',
    'c256', // out of 256-colour range
    'c', // no index
    'bgc999',
    'bg-', // no colour
    'bg-chartreuse',
    'bg#12345',
    'RED', // the service lowercases first; the grammar itself is lowercase
    'red green',
    '<red>',
    '',
  ])('rejects %s', color => {
    expect(isRenderableSphereColor(color)).toBe(false);
  });
});
