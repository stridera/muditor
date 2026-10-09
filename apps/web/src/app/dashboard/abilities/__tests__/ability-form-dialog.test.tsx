/**
 * The edit dialog must be seeded from the full ability, and must not let
 * anyone edit before that ability has loaded.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { AbilityFormDialog } from '../ability-form-dialog';
import { fullAbility } from './fixtures';

const baseProps = {
  open: true,
  onOpenChange: jest.fn(),
  schools: [],
  loading: false,
  loadError: null,
};

describe('AbilityFormDialog seeding', () => {
  it('submits the loaded values of fields the list query omits', () => {
    const onSubmit = jest.fn();
    render(
      <AbilityFormDialog
        {...baseProps}
        ability={fullAbility}
        isEditing
        loadingAbility={false}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Update Ability' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      name: 'Fireball',
      combatOk: false,
      questOnly: true,
      humanoidOnly: true,
      memorizationTime: 9,
    });
  });

  it('shows a loading state instead of the form until the ability arrives', () => {
    const onSubmit = jest.fn();
    render(
      <AbilityFormDialog
        {...baseProps}
        ability={null}
        isEditing
        loadingAbility
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByTestId('ability-form-loading')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Update Ability' })
    ).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('surfaces a load failure rather than an editable default form', () => {
    render(
      <AbilityFormDialog
        {...baseProps}
        ability={null}
        isEditing
        loadingAbility={false}
        loadError='boom'
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Update Ability' })
    ).not.toBeInTheDocument();
  });

  it('starts from defaults when creating', () => {
    render(
      <AbilityFormDialog
        {...baseProps}
        ability={null}
        isEditing={false}
        loadingAbility={false}
        onSubmit={jest.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Create Ability' })
    ).toBeInTheDocument();
  });
});
