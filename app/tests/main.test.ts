import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

const fetchCurrentUserMock = vi.fn();

vi.mock('../src/api/authentication', () => ({
  fetchCurrentUser: fetchCurrentUserMock,
  signInUser: vi.fn(),
  signOutUser: vi.fn()
}));

const { createApplication } = await import('../src/main');

describe('main entry', (): void => {
  it('mounts the Vue application into the DOM', async (): Promise<void> => {
    document.body.innerHTML = '<div id="app"></div>';
    const mountElement = document.getElementById('app');
    if (!mountElement) {
      throw new Error('Mount element not found');
    }
    fetchCurrentUserMock.mockResolvedValue(null);
    const appInstance = createApplication(mountElement);
    await nextTick();
    expect(mountElement.innerHTML).not.toEqual('');
    appInstance.unmount();
  });
});
