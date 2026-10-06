import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../error-boundary';
import { reportClientError } from '@/lib/client-error-reporter';

jest.mock('@/lib/client-error-reporter', () => ({
  reportClientError: jest.fn(),
}));

function Bomb(): never {
  throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (reportClientError as jest.Mock).mockClear();
  });
  afterEach(() => consoleError.mockRestore());

  it('reports a render error and shows the friendly fallback with Reload', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeVisible();
    expect(screen.getByRole('button', { name: /reload/i })).toBeVisible();
    expect(reportClientError).toHaveBeenCalledTimes(1);
    expect(reportClientError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'react', message: 'render exploded' })
    );
  });

  it('renders children untouched when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('all good')).toBeVisible();
    expect(reportClientError).not.toHaveBeenCalled();
  });
});
