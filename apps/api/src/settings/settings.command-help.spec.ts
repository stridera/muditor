import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MINIMUM_ROLE_KEY } from '../auth/guards/minimum-role.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import type { DatabaseService } from '../database/database.service';
import { HelpResolver } from '../help/help.resolver';
import { SettingsResolver } from './settings.resolver';
import {
  COMMAND_HELP_SUMMARY_MAX,
  COMMAND_HELP_TEXT_MAX,
  SettingsService,
} from './settings.service';

describe('SettingsResolver.updateCommandHelp authz', () => {
  const role = (cls: { prototype: object }, method: string) =>
    Reflect.getMetadata(
      MINIMUM_ROLE_KEY,
      (cls.prototype as Record<string, object>)[method] as object
    ) as UserRole;

  it('requires the same role as editing help articles', () => {
    expect(role(SettingsResolver, 'updateCommandHelp')).toBe(
      role(HelpResolver, 'updateHelpEntry')
    );
    expect(role(SettingsResolver, 'updateCommandHelp')).toBe(UserRole.BUILDER);
  });

  it('is behind the JWT and role guards', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      SettingsResolver
    ) as unknown[];
    expect(guards).toContain(GraphQLJwtAuthGuard);
    expect(guards).toContain(MinimumRoleGuard);
  });

  it('lets builders list commands for the editor', () => {
    expect(role(SettingsResolver, 'findAllCommands')).toBe(UserRole.BUILDER);
  });
});

describe('SettingsService.updateCommandHelp', () => {
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

  it('trims both fields', async () => {
    const { service, command } = makeService();
    await service.updateCommandHelp('look', '  Look around.  ', '\n Text.\n\n');
    expect(command.update).toHaveBeenCalledWith({
      where: { name: 'look' },
      data: { helpSummary: 'Look around.', helpText: 'Text.' },
    });
  });

  it('keeps multi-line text', async () => {
    const { service, command } = makeService();
    await service.updateCommandHelp('look', undefined, 'a\nb');
    expect(command.update).toHaveBeenCalledWith({
      where: { name: 'look' },
      data: { helpText: 'a\nb' },
    });
  });

  it('stores empty / whitespace / null as NULL', async () => {
    const { service, command } = makeService();
    await service.updateCommandHelp('look', '   ', null);
    expect(command.update).toHaveBeenCalledWith({
      where: { name: 'look' },
      data: { helpSummary: null, helpText: null },
    });
  });

  it('leaves omitted fields alone', async () => {
    const { service, command } = makeService();
    await service.updateCommandHelp('look', 'Hi');
    expect(command.update).toHaveBeenCalledWith({
      where: { name: 'look' },
      data: { helpSummary: 'Hi' },
    });
  });

  it('rejects a multi-line summary', async () => {
    const { service, command } = makeService();
    await expect(service.updateCommandHelp('look', 'a\nb')).rejects.toThrow(
      BadRequestException
    );
    expect(command.update).not.toHaveBeenCalled();
  });

  it('enforces the summary limit after trimming', async () => {
    const { service, command } = makeService();
    await service.updateCommandHelp(
      'look',
      ` ${'x'.repeat(COMMAND_HELP_SUMMARY_MAX)} `
    );
    expect(command.update).toHaveBeenCalledTimes(1);
    await expect(
      service.updateCommandHelp(
        'look',
        'x'.repeat(COMMAND_HELP_SUMMARY_MAX + 1)
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('enforces the text limit after trimming', async () => {
    const { service, command } = makeService();
    await service.updateCommandHelp(
      'look',
      undefined,
      `${'x'.repeat(COMMAND_HELP_TEXT_MAX)}\n`
    );
    expect(command.update).toHaveBeenCalledTimes(1);
    await expect(
      service.updateCommandHelp(
        'look',
        undefined,
        'x'.repeat(COMMAND_HELP_TEXT_MAX + 1)
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('404s for an unknown command', async () => {
    const { service, command } = makeService(false);
    await expect(service.updateCommandHelp('nope', 'x')).rejects.toThrow(
      NotFoundException
    );
    expect(command.update).not.toHaveBeenCalled();
  });
});
