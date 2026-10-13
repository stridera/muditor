import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { CreateGrantInput } from './grants.input';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
const meta = { type: 'body' as const, metatype: CreateGrantInput };

describe('CreateGrantInput validation', () => {
  it('accepts a zone grant (resourceType must not be rejected)', async () => {
    const out = (await pipe.transform(
      {
        userId: 'u1',
        resourceType: 'ZONE',
        resourceId: '30',
        permissions: ['WRITE'],
      },
      meta
    )) as CreateGrantInput;
    expect(out.resourceType).toBe('ZONE');
  });

  it('rejects an unknown resource type', async () => {
    await expect(
      pipe.transform(
        {
          userId: 'u1',
          resourceType: 'GALAXY',
          resourceId: '30',
          permissions: ['WRITE'],
        },
        meta
      )
    ).rejects.toThrow();
  });
});
