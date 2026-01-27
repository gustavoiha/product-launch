import { describe, expect, it, vi } from 'vitest';
import { createMemoryHistory } from 'vue-router';

const fetchCurrentUserMock = vi.fn();
const signInUserMock = vi.fn();

vi.mock('../src/api/authentication', () => ({
  fetchCurrentUser: fetchCurrentUserMock,
  signInUser: signInUserMock,
  signOutUser: vi.fn()
}));

const { createAppRouter } = await import('../src/router');
const { createAuthenticationStore } = await import('../src/state/authentication');

describe('router', (): void => {
  it('redirects unauthenticated users to the login page', async (): Promise<void> => {
    const authenticationStore = createAuthenticationStore();
    const router = createAppRouter(authenticationStore, createMemoryHistory());
    fetchCurrentUserMock.mockResolvedValue(null);

    await router.push('/dashboard');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('login');
  });

  it('allows authenticated users to access the dashboard', async (): Promise<void> => {
    const authenticationStore = createAuthenticationStore();
    fetchCurrentUserMock.mockResolvedValue(null);
    signInUserMock.mockResolvedValue({ email: 'owner@example.com' });
    await authenticationStore.login('owner@example.com', 'secret');
    const router = createAppRouter(authenticationStore, createMemoryHistory());

    await router.push('/dashboard');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('dashboard');
  });
});
