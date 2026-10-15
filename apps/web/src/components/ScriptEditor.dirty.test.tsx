/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ScriptEditor, { type Script } from './ScriptEditor';

jest.mock('./MonacoEditor', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label='Script code'
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  ),
}));
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));
jest.mock('@muditor/types', () => ({ lintLua: () => [] }), { virtual: true });

const script: Script = {
  id: '30:1',
  name: 'Greeter',
  attachType: 'MOB',
  numArgs: 0,
  argList: 'a, b',
  commands: 'say("hi")\n',
  variables: {},
  flags: ['GREET', 'SPEECH'],
};

describe('ScriptEditor dirty reporting', () => {
  it('is clean right after load', () => {
    const onDirtyChange = jest.fn();
    render(<ScriptEditor script={script} onDirtyChange={onDirtyChange} />);
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    expect(onDirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('treats a line-ending rewrite as no change', () => {
    const onDirtyChange = jest.fn();
    render(
      <ScriptEditor
        script={{ ...script, commands: 'say("hi")\r\n' }}
        onDirtyChange={onDirtyChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Script code'), {
      target: { value: 'say("hi")\n' },
    });
    expect(onDirtyChange).not.toHaveBeenCalledWith(true);
  });

  it('turns dirty on a code edit and clean again when reverted', () => {
    const onDirtyChange = jest.fn();
    render(<ScriptEditor script={script} onDirtyChange={onDirtyChange} />);
    const code = screen.getByLabelText('Script code');
    fireEvent.change(code, { target: { value: 'say("bye")\n' } });
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    fireEvent.change(code, { target: { value: 'say("hi")\n' } });
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('turns dirty on a name or flag edit', () => {
    const onDirtyChange = jest.fn();
    render(<ScriptEditor script={script} onDirtyChange={onDirtyChange} />);
    fireEvent.change(screen.getByPlaceholderText('Script name...'), {
      target: { value: 'Greeter 2' },
    });
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
    fireEvent.change(screen.getByPlaceholderText('Script name...'), {
      target: { value: 'Greeter' },
    });
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByLabelText('DEATH'));
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('a new script is clean until something is typed', () => {
    const onDirtyChange = jest.fn();
    render(<ScriptEditor onDirtyChange={onDirtyChange} />);
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    fireEvent.change(screen.getByLabelText('Script code'), {
      target: { value: '-- x' },
    });
    expect(onDirtyChange).toHaveBeenLastCalledWith(true);
  });

  it('a read-only view is never dirty', () => {
    const onDirtyChange = jest.fn();
    render(
      <ScriptEditor script={script} readOnly onDirtyChange={onDirtyChange} />
    );
    fireEvent.change(screen.getByLabelText('Script code'), {
      target: { value: 'x' },
    });
    expect(onDirtyChange).not.toHaveBeenCalledWith(true);
  });
});
