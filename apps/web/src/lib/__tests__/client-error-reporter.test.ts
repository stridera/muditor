import {
  DEDUPE_WINDOW_MS,
  installGlobalErrorHandlers,
  reportClientError,
  resetClientErrorReporter,
} from '../client-error-reporter';

describe('client error reporter', () => {
  const sendBeacon = jest.fn().mockReturnValue(true);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-06T00:00:00Z'));
    resetClientErrorReporter();
    localStorage.clear();
    sendBeacon.mockClear().mockReturnValue(true);
    (global.fetch as jest.Mock).mockReset().mockResolvedValue({ ok: true });
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeacon,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function beaconPayload() {
    const blob = sendBeacon.mock.calls[0][1] as Blob;
    // jsdom's Blob has no .text()
    const text = await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    return JSON.parse(text);
  }

  it('posts the report via sendBeacon to /api/client-errors', async () => {
    reportClientError({ kind: 'window', message: 'boom', stack: 'at x' });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toMatch(/\/api\/client-errors$/);
    expect(await beaconPayload()).toMatchObject({
      kind: 'window',
      message: 'boom',
      stack: 'at x',
      route: '/',
    });
  });

  it('falls back to fetch when sendBeacon is refused', () => {
    sendBeacon.mockReturnValue(false);
    reportClientError({ kind: 'window', message: 'boom' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
      method: 'POST',
      keepalive: true,
    });
  });

  it('sends the bearer token via fetch for signed-in users', () => {
    localStorage.setItem('auth-token', 'tok');
    reportClientError({ kind: 'react', message: 'boom' });
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(
      (global.fetch as jest.Mock).mock.calls[0][1].headers.authorization
    ).toBe('Bearer tok');
  });

  it('dedupes identical messages for 60 seconds, then reports again', () => {
    reportClientError({ kind: 'window', message: 'same' });
    reportClientError({ kind: 'window', message: 'same' });
    reportClientError({ kind: 'window', message: 'other' });
    expect(sendBeacon).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(DEDUPE_WINDOW_MS - 1);
    reportClientError({ kind: 'window', message: 'same' });
    expect(sendBeacon).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(1);
    reportClientError({ kind: 'window', message: 'same' });
    expect(sendBeacon).toHaveBeenCalledTimes(3);
  });

  it('never throws, even when the transport fails', () => {
    sendBeacon.mockImplementation(() => {
      throw new Error('nope');
    });
    expect(() =>
      reportClientError({ kind: 'window', message: 'boom' })
    ).not.toThrow();
  });

  it('registers window error and unhandledrejection listeners once', () => {
    const add = jest.spyOn(window, 'addEventListener');
    installGlobalErrorHandlers();
    installGlobalErrorHandlers();
    const types = add.mock.calls.map(c => c[0]);
    expect(types.filter(t => t === 'error')).toHaveLength(1);
    expect(types.filter(t => t === 'unhandledrejection')).toHaveLength(1);

    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'uncaught',
        error: new Error('uncaught'),
      })
    );
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    add.mockRestore();
  });
});
