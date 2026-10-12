import 'reflect-metadata';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@muditor/db';
import { MINIMUM_ROLE_KEY } from '../auth/guards/minimum-role.guard';
import type { DatabaseService } from '../database/database.service';
import { AbilitiesResolver } from '../abilities/abilities.resolver';
import { SettingsResolver } from './settings.resolver';
import { SettingsService } from './settings.service';

describe('SettingsResolver.updateCommandFlags authz', () => {
  const role = (cls: { prototype: object }, method: string) =>
    Reflect.getMetadata(
      MINIMUM_ROLE_KEY,
      (cls.prototype as Record<string, object>)[method] as object
    ) as UserRole;

  it('needs a higher role than editing help text', () => {
    expect(role(SettingsResolver, 'updateCommandFlags')).toBe(UserRole.CODER);
    expect(role(SettingsResolver, 'updateCommandHelp')).toBe(UserRole.BUILDER);
  });

  it('matches the role that edits effect mechanics', () => {
    expect(role(SettingsResolver, 'updateCommandFlags')).toBe(
      role(AbilitiesResolver, 'updateEffect')
    );
  });
});

describe('SettingsService.updateCommandFlags', () => {
  function makeService(exists = true) {
    const command = {
      findUnique: jest.fn(async () => (exists ? { name: 'look' } : null)),
      update: jest.fn(async ({ data }: { data: object }) => ({
        name: 'look',
        ...data,
      })),
    };
    const service = new SettingsService({
      command,
    } as unknown as DatabaseService);
    return { service, command };
  }

  it('writes only the flags that were given', async () => {
    const { service, command } = makeService();
    await service.updateCommandFlags('look', {
      keepsHidden: true,
      heldByCastLag: false,
      allowedWhileCasting: null,
    });
    expect(command.update).toHaveBeenCalledWith({
      where: { name: 'look' },
      data: { keepsHidden: true, heldByCastLag: false },
    });
  });

  it('never touches the help text', async () => {
    const { service, command } = makeService();
    await service.updateCommandFlags('look', { allowedWhileParalyzed: true });
    const call = command.update.mock.calls[0] as unknown as [
      { data: Record<string, unknown> },
    ];
    expect(Object.keys(call[0].data)).toEqual(['allowedWhileParalyzed']);
  });

  it('rejects a non-boolean value', async () => {
    const { service, command } = makeService();
    await expect(
      service.updateCommandFlags('look', {
        keepsHidden: 'yes' as unknown as boolean,
      })
    ).rejects.toThrow(BadRequestException);
    expect(command.update).not.toHaveBeenCalled();
  });

  it('404s for an unknown command', async () => {
    const { service } = makeService(false);
    await expect(
      service.updateCommandFlags('nope', { keepsHidden: true })
    ).rejects.toThrow(NotFoundException);
  });
});
