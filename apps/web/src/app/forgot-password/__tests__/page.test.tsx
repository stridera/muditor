import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from '../page';

jest.mock('@/lib/apollo-client', () => ({
  apolloClient: { mutate: jest.fn() },
}));

describe('ForgotPasswordPage', () => {
  it('tells Google sign-up users there is no password to reset', () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByText(/use 'Sign in with Google'.*no password to reset/)
    ).toBeVisible();
  });
});
