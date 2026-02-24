import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

/**
 * Custom test fixture that defaults page.goto and page.reload to
 * waitUntil: 'domcontentloaded'. Next.js dev server's HMR WebSocket
 * prevents the 'load' event from firing, causing timeouts even though
 * the page renders correctly.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const origGoto = page.goto.bind(page);
    page.goto = ((url: string, opts?: Parameters<typeof origGoto>[1]) =>
      origGoto(url, {
        waitUntil: 'domcontentloaded',
        ...opts,
      })) as typeof page.goto;

    const origReload = page.reload.bind(page);
    page.reload = ((opts?: Parameters<typeof origReload>[0]) =>
      origReload({
        waitUntil: 'domcontentloaded',
        ...opts,
      })) as typeof page.reload;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});
