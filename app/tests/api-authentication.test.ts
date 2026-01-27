import { describe, expect, it, vi } from 'vitest';

const signInMock = vi.fn();
const signOutMock = vi.fn();
const getCurrentUserMock = vi.fn();

vi.mock('aws-amplify/auth', () => ({
  signIn: signInMock,
  signOut: signOutMock,
  getCurrentUser: getCurrentUserMock
}));

const { fetchCurrentUser, signInUser, signOutUser } = await import(
  '../src/api/authentication'
);

describe('authentication api', (): void => {
  it('returns null when current user has no email', async (): Promise<void> => {
    getCurrentUserMock.mockResolvedValue({ signInDetails: { loginId: '' } });

    const user = await fetchCurrentUser();

    expect(user).toBeNull();
  });

  it('returns user email when available', async (): Promise<void> => {
    getCurrentUserMock.mockResolvedValue({ signInDetails: { loginId: 'owner@example.com' } });

    const user = await fetchCurrentUser();

    expect(user?.email).toBe('owner@example.com');
  });

  it('signs in users with email and password', async (): Promise<void> => {
    signInMock.mockResolvedValue({});

    const user = await signInUser('owner@example.com', 'password');

    expect(user.email).toBe('owner@example.com');
    expect(signInMock).toHaveBeenCalledWith({
      username: 'owner@example.com',
      password: 'password'
    });
  });

  it('signs out the current user', async (): Promise<void> => {
    signOutMock.mockResolvedValue({});

    await signOutUser();

    expect(signOutMock).toHaveBeenCalled();
  });
});
