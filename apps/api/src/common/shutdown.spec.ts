import { shutdownWithDeadline } from './shutdown';

describe('shutdownWithDeadline', () => {
  it('exits 0 promptly when close resolves', async () => {
    const exit = jest.fn();
    const log = jest.fn();
    const start = Date.now();
    await shutdownWithDeadline(() => Promise.resolve(), {
      deadlineMs: 5_000,
      exit,
      log,
    });
    expect(Date.now() - start).toBeLessThan(1_000);
    expect(exit).toHaveBeenCalledWith(0);
    expect(log).not.toHaveBeenCalled();
  });

  it('exits after the deadline when close hangs', async () => {
    const exit = jest.fn();
    const log = jest.fn();
    await shutdownWithDeadline(() => new Promise(() => undefined), {
      deadlineMs: 50,
      exit,
      log,
    });
    expect(exit).toHaveBeenCalledWith(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('deadline'));
  });

  it('still exits when close rejects', async () => {
    const exit = jest.fn();
    const log = jest.fn();
    await shutdownWithDeadline(() => Promise.reject(new Error('boom')), {
      deadlineMs: 5_000,
      exit,
      log,
    });
    expect(exit).toHaveBeenCalledWith(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });
});
