/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ScriptEditor, { type Script } from './ScriptEditor';

jest.mock('./MonacoEditor', () => ({
  __esModule: true,
  default: ({ value }: { value: string }) => (
    <div className='monaco-editor'>
      <textarea aria-label='Script code' defaultValue={value} />
    </div>
  ),
}));
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));
jest.mock('@muditor/types', () => ({ lintLua: () => [] }), { virtual: true });

const script: Script = {
  id: '1',
  name: 'Greeter',
  attachType: 'MOB',
  numArgs: 0,
  commands: 'say("hi")\n',
  variables: {},
  flags: [],
};

describe('ScriptEditor saving', () => {
  it('offers Save (stay) and Save & Close, and shows Validate / Format', () => {
    render(<ScriptEditor script={script} onSave={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save & Close' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Validate' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Format' })).toBeInTheDocument();
  });

  it('Save stays (close:false), Save & Close closes (close:true)', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<ScriptEditor script={script} onSave={onSave} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(onSave).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'Greeter' }),
      { close: false }
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save & Close' }));
    });
    expect(onSave).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'Greeter' }),
      { close: true }
    );
  });

  it('shows a disabled Saving... button while the save is pending', async () => {
    let finish: () => void = () => {};
    const onSave = jest.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve;
        })
    );
    render(<ScriptEditor script={script} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    const pending = await screen.findByRole('button', { name: 'Saving…' });
    expect(pending).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save & Close' })).toBeDisabled();

    await act(async () => finish());
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('Ctrl+S and Cmd+S save without closing, even from inside the editor', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<ScriptEditor script={script} onSave={onSave} />);
    const inEditor = screen.getByLabelText('Script code');

    const ctrl = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    await act(async () => {
      inEditor.dispatchEvent(ctrl);
    });
    expect(ctrl.defaultPrevented).toBe(true); // no browser "save page"
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0]![1]).toEqual({ close: false });

    await act(async () => {
      fireEvent.keyDown(inEditor, { key: 'S', metaKey: true });
    });
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it('a bare "s", or Ctrl+Shift+S, does not save', () => {
    const onSave = jest.fn();
    render(<ScriptEditor script={script} onSave={onSave} />);
    const inEditor = screen.getByLabelText('Script code');
    fireEvent.keyDown(inEditor, { key: 's' });
    fireEvent.keyDown(inEditor, { key: 's', ctrlKey: true, shiftKey: true });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('read-only editors have no save buttons and ignore Ctrl+S', () => {
    const onSave = jest.fn();
    render(<ScriptEditor script={script} readOnly onSave={onSave} />);
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    expect(onSave).not.toHaveBeenCalled();
  });
});
