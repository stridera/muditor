import 'reflect-metadata';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { getMetadataStorage } from 'class-validator';
import { TypeMetadataStorage } from '@nestjs/graphql';
import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';

// The global ValidationPipe (main.ts) runs with whitelist + forbidNonWhitelisted,
// so every property of a GraphQL input class needs at least one class-validator
// decorator (use @Allow() for free-form JSON) or the whole mutation is rejected
// with "property X should not exist".

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === 'generated' || name === '__tests__') continue;
      sourceFiles(path, out);
    } else if (
      path.endsWith('.ts') &&
      !path.endsWith('.spec.ts') &&
      !path.endsWith('.d.ts')
    ) {
      out.push(path);
    }
  }
  return out;
}

describe('GraphQL input types carry class-validator decorators', () => {
  it('has a validator on every @Field of every @InputType/@ArgsType', () => {
    const files = sourceFiles(join(__dirname, '..')).filter(f =>
      /@(InputType|ArgsType)\(/.test(readFileSync(f, 'utf8'))
    );
    expect(files.length).toBeGreaterThan(20);
    for (const f of files) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(f);
    }
    LazyMetadataStorage.load();
    TypeMetadataStorage.compile();

    const inputs = [
      ...TypeMetadataStorage.getInputTypesMetadata(),
      ...TypeMetadataStorage.getArgumentsMetadata(),
    ];
    expect(inputs.length).toBeGreaterThan(50);

    const validators = getMetadataStorage();
    const missing: string[] = [];
    for (const input of inputs) {
      const have = new Set(
        validators
          .getTargetValidationMetadatas(
            input.target as Parameters<
              typeof validators.getTargetValidationMetadatas
            >[0],
            '',
            false,
            false
          )
          .map(m => m.propertyName)
      );
      for (const prop of input.properties ?? []) {
        if (!have.has(prop.name)) missing.push(`${input.name}.${prop.name}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
