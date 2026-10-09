import { BadRequestException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { SettingsService } from './settings.service';

type Config = {
  category: string;
  key: string;
  value: string;
  valueType: string;
  description: string | null;
  minValue: string | null;
  maxValue: string | null;
};

function makeService(config: Config) {
  const gameConfig = {
    findUnique: jest.fn(async () => ({ ...config })),
    update: jest.fn(async ({ data }: { data: Partial<Config> }) => ({
      ...config,
      ...data,
    })),
  };
  const service = new SettingsService({
    gameConfig,
  } as unknown as DatabaseService);
  return { service, gameConfig };
}

const json = (key: string): Config => ({
  category: 'display',
  key,
  value: '[]',
  valueType: 'JSON',
  description: null,
  minValue: null,
  maxValue: null,
});

describe('SettingsService.updateConfig JSON values', () => {
  it('rejects JSON that does not parse', async () => {
    const { service, gameConfig } = makeService(json('other'));
    await expect(
      service.updateConfig('display', 'other', { value: '{nope' })
    ).rejects.toThrow(BadRequestException);
    expect(gameConfig.update).not.toHaveBeenCalled();
  });

  it('accepts valid JSON for a generic JSON config', async () => {
    const { service, gameConfig } = makeService(json('other'));
    await service.updateConfig('display', 'other', { value: '{"a":1}' });
    expect(gameConfig.update).toHaveBeenCalledTimes(1);
  });

  it('requires display.prompt_templates to be [name, template] pairs', async () => {
    const { service, gameConfig } = makeService(json('prompt_templates'));
    for (const bad of [
      '{"a":1}',
      '["classic"]',
      '[["classic"]]',
      '[["", "> "]]',
      '[["classic", 5]]',
    ]) {
      await expect(
        service.updateConfig('display', 'prompt_templates', { value: bad })
      ).rejects.toThrow(BadRequestException);
    }
    expect(gameConfig.update).not.toHaveBeenCalled();

    await service.updateConfig('display', 'prompt_templates', {
      value: '[["classic", "<%h/%H hp> "], ["minimal", "> "]]',
    });
    expect(gameConfig.update).toHaveBeenCalledTimes(1);
  });
});
