import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateQuestInput } from './quest.dto';

describe('CreateQuestInput name', () => {
  const options = { whitelist: true, forbidNonWhitelisted: true } as const;

  it('rejects an empty name', async () => {
    const dto = plainToInstance(CreateQuestInput, {
      zoneId: 30,
      id: 1,
      name: '',
    });
    const errors = await validate(dto, options);
    expect(errors.map(e => e.property)).toContain('name');
    expect(JSON.stringify(errors)).toContain('Quest name is required');
  });

  it('accepts a real name', async () => {
    const dto = plainToInstance(CreateQuestInput, {
      zoneId: 30,
      id: 1,
      name: 'The Lost Artifact',
    });
    expect(await validate(dto, options)).toHaveLength(0);
  });
});
