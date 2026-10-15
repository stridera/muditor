import 'reflect-metadata';
import { UserRole } from '@muditor/db';
import { MINIMUM_ROLE_KEY } from '../auth/guards/minimum-role.guard';
import { AbilitiesResolver } from './abilities.resolver';

/**
 * Effect definitions (the "Effect" table) are engine-level: create, update and
 * delete need CODER (level 104+). Reads stay IMMORTAL+ for the ability editor.
 */
describe('AbilitiesResolver effect definition roles', () => {
  const proto = AbilitiesResolver.prototype as unknown as Record<
    string,
    object
  >;
  const role = (name: string) =>
    Reflect.getMetadata(MINIMUM_ROLE_KEY, proto[name] as object);

  it.each(['createEffect', 'updateEffect', 'deleteEffect'])(
    '%s requires CODER',
    name => {
      expect(role(name)).toBe(UserRole.CODER);
    }
  );

  it.each(['getEffects', 'getEffectsCount', 'getEffect'])(
    '%s stays readable by IMMORTAL',
    name => {
      expect(role(name)).toBe(UserRole.IMMORTAL);
    }
  );
});
