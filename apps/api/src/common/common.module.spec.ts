import 'reflect-metadata';

function controllersWith(env: Record<string, string | undefined>) {
  const saved = { ...process.env };
  Object.assign(process.env, env);
  for (const k of Object.keys(env)) {
    if (env[k] === undefined) delete process.env[k];
  }
  try {
    let names: string[] = [];
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { CommonModule } = require('./common.module');
      const controllers: { name: string }[] =
        Reflect.getMetadata('controllers', CommonModule) ?? [];
      names = controllers.map(c => c.name);
    });
    return names;
  } finally {
    process.env = saved;
  }
}

describe('CommonModule test endpoints', () => {
  it('does not mount TestController under NODE_ENV=development alone', () => {
    const names = controllersWith({
      NODE_ENV: 'development',
      ENABLE_TEST_ENDPOINTS: undefined,
    });
    expect(names).toContain('ClientErrorsController');
    expect(names).not.toContain('TestController');
  });

  it('mounts TestController only when ENABLE_TEST_ENDPOINTS=true', () => {
    const names = controllersWith({
      NODE_ENV: 'production',
      ENABLE_TEST_ENDPOINTS: 'true',
    });
    expect(names).toContain('TestController');
  });
});
