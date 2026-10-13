/**
 * Save Effects must be disabled, with the reason shown, while the effect
 * editor reports a blocking error; and Escape/clicks inside Blockly's
 * body-level widgets must not count as dialog dismissals.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { EffectsEditActions } from '../effects-edit-actions';
import { isInsideBlocklyWidget } from '../blockly-widgets';

describe('EffectsEditActions', () => {
  const props = { saving: false, onCancel: jest.fn(), onSave: jest.fn() };

  it('enables Save when the editor is valid', () => {
    const onSave = jest.fn();
    render(
      <EffectsEditActions {...props} onSave={onSave} blockingError={null} />
    );
    const save = screen.getByRole('button', { name: /Save Effects/ });
    expect(save).toBeEnabled();
    expect(
      screen.queryByTestId('effects-save-blocked')
    ).not.toBeInTheDocument();
    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables Save and shows the error while invalid (invalid JSON / generator or load error)', () => {
    const onSave = jest.fn();
    render(
      <EffectsEditActions
        {...props}
        onSave={onSave}
        blockingError='Invalid JSON format'
      />
    );
    const save = screen.getByRole('button', { name: /Save Effects/ });
    expect(save).toBeDisabled();
    expect(screen.getByTestId('effects-save-blocked')).toHaveTextContent(
      'Invalid JSON format'
    );
    fireEvent.click(save);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('keeps Cancel available while invalid', () => {
    const onCancel = jest.fn();
    render(
      <EffectsEditActions {...props} onCancel={onCancel} blockingError='x' />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('isInsideBlocklyWidget', () => {
  it.each([
    'blocklyWidgetDiv',
    'blocklyDropDownDiv',
    'blocklyTooltipDiv',
    'blocklyContextMenu',
  ])('is true for an element inside .%s', cls => {
    const host = document.createElement('div');
    host.className = cls;
    const input = document.createElement('input');
    host.appendChild(input);
    document.body.appendChild(host);
    expect(isInsideBlocklyWidget(input)).toBe(true);
    host.remove();
  });

  it('is false for the dialog itself and for non-elements', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(isInsideBlocklyWidget(el)).toBe(false);
    expect(isInsideBlocklyWidget(document)).toBe(false);
    expect(isInsideBlocklyWidget(null)).toBe(false);
    el.remove();
  });
});
