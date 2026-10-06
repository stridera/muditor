export interface ShutdownOptions {
  /** Max time to wait for app.close() before forcing exit. */
  deadlineMs?: number;
  exit?: (code: number) => void;
  log?: (message: string) => void;
}

export const SHUTDOWN_DEADLINE_MS = 10_000;

/**
 * Run `close` with a hard deadline, then exit the process. A hung close (e.g.
 * a client reconnecting to an unreachable server) must never block exit.
 */
export async function shutdownWithDeadline(
  close: () => Promise<unknown>,
  options: ShutdownOptions = {}
): Promise<void> {
  const {
    deadlineMs = SHUTDOWN_DEADLINE_MS,
    exit = code => process.exit(code),
    log = () => undefined,
  } = options;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<'deadline'>(resolve => {
    timer = setTimeout(() => resolve('deadline'), deadlineMs);
  });

  try {
    const result = await Promise.race([
      close().then(() => 'closed' as const),
      deadline,
    ]);
    if (result === 'deadline') {
      log(`Shutdown deadline of ${deadlineMs}ms hit; forcing exit`);
    }
  } catch (error) {
    log(`Error during shutdown: ${(error as Error)?.message ?? error}`);
  } finally {
    if (timer) clearTimeout(timer);
  }
  exit(0);
}
