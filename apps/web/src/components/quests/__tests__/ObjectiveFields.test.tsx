import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ObjectiveFields } from '../ObjectiveFields';
import type { ObjectiveFormData } from '../quest-form';

jest.mock('@/components/help/HelpButton', () => ({
  HelpButton: () => null,
}));
jest.mock('../EntityAutocomplete', () => ({
  EntityAutocomplete: ({
    entityType,
    placeholder,
    onChange,
  }: {
    entityType: string;
    placeholder?: string;
    onChange: (v: { zoneId: number | null; id: number | null }) => void;
  }) => (
    <button
      data-testid={`entity-${entityType}`}
      onClick={() => onChange({ zoneId: 30, id: 7 })}
    >
      {placeholder}
    </button>
  ),
}));
jest.mock('../AbilityPicker', () => ({
  AbilityPicker: ({ onChange }: { onChange: (id: number | null) => void }) => (
    <button data-testid='ability-picker' onClick={() => onChange(42)}>
      pick ability
    </button>
  ),
}));

const base: ObjectiveFormData = {
  id: 1,
  objectiveType: 'KILL_MOB',
  scope: 'SOLO',
  playerDescription: 'Do it',
  internalNote: '',
  showProgress: true,
  requiredCount: 1,
  targetMobZoneId: null,
  targetMobId: null,
  targetObjectZoneId: null,
  targetObjectId: null,
  targetRoomZoneId: null,
  targetRoomId: null,
  targetAbilityId: null,
  deliverToMobZoneId: null,
  deliverToMobId: null,
  luaExpression: '',
  dialogue: null,
};

function renderObjective(
  overrides: Partial<ObjectiveFormData>,
  onChange = jest.fn()
) {
  render(
    <ObjectiveFields
      objective={{ ...base, ...overrides }}
      onChange={onChange}
      dialogueSlot={<div data-testid='dialogue-slot' />}
    />
  );
  return onChange;
}

const present = () => ({
  mob: screen.queryAllByTestId('entity-mob').length,
  object: screen.queryAllByTestId('entity-object').length,
  room: screen.queryAllByTestId('entity-room').length,
  ability: screen.queryAllByTestId('ability-picker').length,
  lua: screen.queryByLabelText('Lua expression') ? 1 : 0,
  scope: screen.queryByLabelText('Scope') ? 1 : 0,
  dialogue: screen.queryAllByTestId('dialogue-slot').length,
});

describe('ObjectiveFields shows only the fields the type needs', () => {
  it('Kill Mob: one mob picker and scope', () => {
    renderObjective({ objectiveType: 'KILL_MOB' });
    expect(present()).toEqual({
      mob: 1,
      object: 0,
      room: 0,
      ability: 0,
      lua: 0,
      scope: 1,
      dialogue: 0,
    });
  });

  it('Collect Item: object picker only', () => {
    renderObjective({ objectiveType: 'COLLECT_ITEM' });
    expect(present()).toMatchObject({ mob: 0, object: 1, room: 0, ability: 0 });
  });

  it('Deliver Item: item picker AND recipient mob picker', () => {
    renderObjective({ objectiveType: 'DELIVER_ITEM' });
    expect(present()).toMatchObject({ mob: 1, object: 1, room: 0, ability: 0 });
    expect(screen.getByText('Deliver to mob')).toBeInTheDocument();
    expect(screen.getByText('Item to deliver')).toBeInTheDocument();
  });

  it('Visit Room: room picker only', () => {
    renderObjective({ objectiveType: 'VISIT_ROOM' });
    expect(present()).toMatchObject({ mob: 0, object: 0, room: 1, ability: 0 });
  });

  it('Talk to NPC: mob picker and the dialogue editor', () => {
    renderObjective({ objectiveType: 'TALK_TO_NPC' });
    expect(present()).toMatchObject({ mob: 1, dialogue: 1, ability: 0 });
  });

  it('Use Skill: ability picker, no mob/object/room', () => {
    renderObjective({ objectiveType: 'USE_SKILL' });
    expect(present()).toMatchObject({
      mob: 0,
      object: 0,
      room: 0,
      ability: 1,
      scope: 1,
    });
  });

  it('Custom (Lua): expression only, no pickers and no scope', () => {
    renderObjective({ objectiveType: 'CUSTOM_LUA' });
    expect(present()).toEqual({
      mob: 0,
      object: 0,
      room: 0,
      ability: 0,
      lua: 1,
      scope: 0,
      dialogue: 0,
    });
  });
});

describe('ObjectiveFields edits', () => {
  it('writes the Deliver Item recipient as one patch', () => {
    const onChange = renderObjective({ objectiveType: 'DELIVER_ITEM' });
    // Two mob/object pickers; the recipient is the mob one.
    fireEvent.click(screen.getByTestId('entity-mob'));
    expect(onChange).toHaveBeenCalledWith({
      deliverToMobZoneId: 30,
      deliverToMobId: 7,
    });
  });

  it('writes the Use Skill ability', () => {
    const onChange = renderObjective({ objectiveType: 'USE_SKILL' });
    fireEvent.click(screen.getByTestId('ability-picker'));
    expect(onChange).toHaveBeenCalledWith({ targetAbilityId: 42 });
  });

  it('changing the type clears fields the new type does not use', () => {
    const onChange = renderObjective({
      objectiveType: 'KILL_MOB',
      targetMobZoneId: 30,
      targetMobId: 7,
    });
    fireEvent.change(screen.getByLabelText('Objective type'), {
      target: { value: 'VISIT_ROOM' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        objectiveType: 'VISIT_ROOM',
        targetMobZoneId: null,
        targetMobId: null,
      })
    );
  });

  it('switches scope to party', () => {
    const onChange = renderObjective({ objectiveType: 'KILL_MOB' });
    fireEvent.change(screen.getByLabelText('Scope'), {
      target: { value: 'PARTY' },
    });
    expect(onChange).toHaveBeenCalledWith({ scope: 'PARTY' });
  });
});
