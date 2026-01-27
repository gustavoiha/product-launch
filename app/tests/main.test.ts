import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { createApplication } from '../src/main';

describe('main entry', (): void => {
  it('mounts the Vue application into the DOM', async (): Promise<void> => {
    document.body.innerHTML = '<div id="app"></div>';
    const mountElement = document.getElementById('app');
    if (!mountElement) {
      throw new Error('Mount element not found');
    }
    const appInstance = createApplication(mountElement);
    await nextTick();
    expect(mountElement.innerHTML).not.toEqual('');
    appInstance.unmount();
  });
});
