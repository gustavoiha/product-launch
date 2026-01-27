import { describe, expect, it } from 'vitest';
import { createMemoryHistory } from 'vue-router';
import { createAppRouter } from '../src/router';
import { createAuthenticationStore } from '../src/state/authentication';

describe('router', (): void => {
  it('redirects unauthenticated users to the login page', async (): Promise<void> => {
    const authenticationStore = createAuthenticationStore();
    const router = createAppRouter(authenticationStore, createMemoryHistory());

    await router.push('/dashboard');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('login');
  });

  it('allows authenticated users to access the dashboard', async (): Promise<void> => {
    const authenticationStore = createAuthenticationStore();
    authenticationStore.login('owner@example.com', 'secret');
    const router = createAppRouter(authenticationStore, createMemoryHistory());

    await router.push('/dashboard');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('dashboard');
  });
});
