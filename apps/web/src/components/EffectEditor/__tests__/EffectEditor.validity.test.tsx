/**
 * The editor must tell its parent when its current state cannot be saved
 * (generator threw, invalid JSON, blocks failed to load), instead of staying
 * silent while the parent keeps the last valid snapshot.
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';

const mockGenerateJson = jest.fn();
const mockLoadEffects = jest.fn();
const fakeWorkspace = { setTheme: jest.fn() };

jest.mock('next/dynamic', () => () => {
  // Stand-in for the dynamically imported react-blockly workspace.
  const React = jest.requireActual('react');
  return function MockWorkspace(props: {
    onWorkspaceChange: (ws: unknown) => void;
  }) {
    React.useEffect(() => {
      props.onWorkspaceChange(fakeWorkspace);
    }, [props.onWorkspaceChange]);
    return (
      <button
        data-testid='blockly-change'
        onClick={() => props.onWorkspaceChange(fakeWorkspace)}
      />
    );
  };
});
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));
jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    data: {
      effects: [{ id: '1', name: 'e', effectType: 't', defaultParams: null }],
      mobs: [],
      objects: [],
      triggers: [],
      zones: [],
    },
  }),
}));
jest.mock('@/generated/graphql', () => ({
  GetEffectEditorOptionsDocument: {},
}));
jest.mock('../blocks', () => ({ registerAllBlocks: jest.fn() }));
jest.mock('blockly', () => ({
  Theme: { defineTheme: () => ({}) },
  Themes: { Classic: {} },
  Blocks: {},
}));
jest.mock('../toolbox', () => ({
  buildToolbox: () => ({ kind: 'flyoutToolbox' }),
}));
jest.mock('../generators/json-generator', () => ({
  generateJson: (...args: unknown[]) => mockGenerateJson(...args),
}));
jest.mock('../generators/block-loader', () => ({
  loadEffectsIntoWorkspace: (...args: unknown[]) => mockLoadEffects(...args),
}));
jest.mock('../blocks/data-registry', () => ({
  setEffectEditorData: jest.fn(),
  clearEffectEditorData: jest.fn(),
  hasEffectsLoaded: () => true,
}));

import { EffectEditor } from '../EffectEditor';

const effect = {
  effectId: 1,
  overrideParams: {},
  order: 0,
  chancePct: 100,
};

async function renderEditor() {
  const onChange = jest.fn();
  const onValidityChange = jest.fn();
  render(
    <EffectEditor
      initialEffects={[effect]}
      onChange={onChange}
      onValidityChange={onValidityChange}
    />
  );
  // Let registration, the options timer and the workspace load settle.
  await act(async () => {
    await new Promise(r => setTimeout(r, 20));
  });
  return { onChange, onValidityChange };
}

const lastValidity = (fn: jest.Mock) => fn.mock.calls.at(-1)?.[0];

beforeEach(() => {
  mockGenerateJson.mockReset().mockReturnValue([effect]);
  mockLoadEffects.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('EffectEditor validity reporting', () => {
  it('reports a blocking error when the generator throws, and clears it on recovery', async () => {
    const { onChange, onValidityChange } = await renderEditor();
    expect(lastValidity(onValidityChange)).toBeNull();

    mockGenerateJson.mockImplementation(() => {
      throw new Error('bad block');
    });
    onChange.mockClear();
    fireEvent.click(screen.getByTestId('blockly-change'));

    expect(lastValidity(onValidityChange)).toBe('bad block');
    expect(onChange).not.toHaveBeenCalled();

    mockGenerateJson.mockReturnValue([effect]);
    fireEvent.click(screen.getByTestId('blockly-change'));
    expect(lastValidity(onValidityChange)).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reports a blocking error for invalid JSON and clears it when fixed', async () => {
    const { onChange, onValidityChange } = await renderEditor();
    fireEvent.click(screen.getByRole('button', { name: /json/i }));
    const textarea = screen.getByPlaceholderText('[]');

    onChange.mockClear();
    fireEvent.change(textarea, { target: { value: '[{' } });
    expect(lastValidity(onValidityChange)).toBe('Invalid JSON format');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(textarea, { target: { value: '[]' } });
    expect(lastValidity(onValidityChange)).toBeNull();
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('treats non-array JSON as invalid (blocks saving)', async () => {
    const { onValidityChange } = await renderEditor();
    fireEvent.click(screen.getByRole('button', { name: /json/i }));
    fireEvent.change(screen.getByPlaceholderText('[]'), {
      target: { value: '{"a":1}' },
    });
    expect(lastValidity(onValidityChange)).toBe('Invalid JSON format');
  });

  it('blocks saving and swallows changes when loading the workspace throws partway', async () => {
    mockLoadEffects.mockImplementation(() => {
      throw new Error('unknown block type');
    });
    const { onChange, onValidityChange } = await renderEditor();

    expect(lastValidity(onValidityChange)).toMatch(
      /Failed to load effects into the editor: unknown block type/
    );

    // A change on the half-loaded workspace must not emit a partial list.
    fireEvent.click(screen.getByTestId('blockly-change'));
    expect(onChange).not.toHaveBeenCalled();
    expect(mockGenerateJson).not.toHaveBeenCalled();
    expect(lastValidity(onValidityChange)).not.toBeNull();
  });

  it('reports no error after a clean load', async () => {
    const { onValidityChange } = await renderEditor();
    expect(lastValidity(onValidityChange)).toBeNull();
  });

  it('Validate checks every field and a bad value blocks saving until fixed', async () => {
    const { onValidityChange } = await renderEditor();
    expect(lastValidity(onValidityChange)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /json/i }));
    const textarea = screen.getByPlaceholderText('[]');
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify([
          {
            effectId: 1,
            overrideParams: { durationUnit: 'parsecs', duration: -5 },
            order: 0,
            chancePct: 250,
            trigger: 'on_nothing',
          },
        ]),
      },
    });
    expect(lastValidity(onValidityChange)).toMatch(/4 problems in the effects/);

    fireEvent.click(screen.getByRole('button', { name: /validate/i }));
    const text = screen.getByRole('alert').textContent ?? '';
    expect(text).toMatch(/durationUnit must be one of/);
    expect(text).toMatch(/duration cannot be negative/);
    expect(text).toMatch(/Unknown trigger "on_nothing"/);
    expect(text).toMatch(/Chance must be between 0 and 100/);

    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify([
          { effectId: 1, overrideParams: {}, order: 0, chancePct: 100 },
        ]),
      },
    });
    expect(lastValidity(onValidityChange)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /validate/i }));
    expect(screen.getByRole('alert').textContent).toMatch(
      /No problems found in 1 effect/
    );
  });
});
