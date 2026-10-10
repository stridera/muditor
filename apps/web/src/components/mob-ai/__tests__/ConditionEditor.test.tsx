import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { ConditionEditor } from '../ConditionEditor';

function Harness({
  initial,
  onValue,
}: {
  initial: unknown;
  onValue: (v: unknown) => void;
}) {
  const [value, setValue] = useState<unknown>(initial);
  return (
    <ConditionEditor
      value={value}
      onChange={next => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

describe('ConditionEditor', () => {
  it('merges edits into the stored object and keeps unknown keys', () => {
    const seen: unknown[] = [];
    render(
      <Harness
        initial={{ in_combat: true, phase: { n: 2 } }}
        onValue={v => seen.push(v)}
      />
    );
    // The unknown key is shown, not editable.
    expect(screen.getByText(/phase:/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Own HP below (%)'), {
      target: { value: '40' },
    });
    expect(seen.at(-1)).toEqual({
      in_combat: true,
      phase: { n: 2 },
      self_hp_below: 40,
    });

    fireEvent.click(screen.getByLabelText('Target is casting'));
    expect(seen.at(-1)).toMatchObject({
      phase: { n: 2 },
      self_hp_below: 40,
      target_casting: true,
    });
  });

  it('removing an unknown key is explicit', () => {
    const seen: unknown[] = [];
    render(<Harness initial={{ phase: 1 }} onValue={v => seen.push(v)} />);
    fireEvent.click(screen.getByTitle('Remove phase'));
    expect(seen.at(-1)).toBeNull();
  });

  it('clamps percent input to 0-100', () => {
    const seen: unknown[] = [];
    render(<Harness initial={null} onValue={v => seen.push(v)} />);
    fireEvent.change(screen.getByLabelText('Target HP below (%)'), {
      target: { value: '250' },
    });
    expect(seen.at(-1)).toEqual({ target_hp_below: 100 });
  });
});
