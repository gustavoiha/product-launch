import { describe, expect, it } from 'vitest';
import { createAuthenticationStore } from '../src/state/authentication';

describe('authentication store', (): void => {
  it('logs in and logs out users', (): void => {
    const store = createAuthenticationStore();
    store.login('owner@example.com', 'secret');

    expect(store.state.isAuthenticated).toBe(true);
    expect(store.state.email).toBe('owner@example.com');

    store.logout();

    expect(store.state.isAuthenticated).toBe(false);
    expect(store.state.email).toBe('');
  });
});
