import { describe, expect, it, vi } from 'vitest';

const signInUserMock = vi.fn();
const signOutUserMock = vi.fn();
const fetchCurrentUserMock = vi.fn();

vi.mock('../src/api/authentication', () => ({
  signInUser: signInUserMock,
  signOutUser: signOutUserMock,
  fetchCurrentUser: fetchCurrentUserMock
}));

const { createAuthenticationStore } = await import('../src/state/authentication');

describe('authentication store', (): void => {
  it('logs in and logs out users', async (): Promise<void> => {
    const store = createAuthenticationStore();

    signInUserMock.mockResolvedValue({ email: 'owner@example.com' });
    await store.login('owner@example.com', 'secret');

    expect(store.state.isAuthenticated).toBe(true);
    expect(store.state.email).toBe('owner@example.com');

    await store.logout();

    expect(store.state.isAuthenticated).toBe(false);
    expect(store.state.email).toBe('');
  });

  it('initializes from the current user session', async (): Promise<void> => {
    const store = createAuthenticationStore();
    fetchCurrentUserMock.mockResolvedValue({ email: 'owner@example.com' });

    await store.initialize();

    expect(store.state.isAuthenticated).toBe(true);
    expect(store.state.email).toBe('owner@example.com');
    expect(store.state.isInitialized).toBe(true);
  });
});
