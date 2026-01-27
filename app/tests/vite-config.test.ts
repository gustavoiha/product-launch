// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { UserConfig, UserConfigExport } from 'vite';
import configExport from '../vite.config';

const resolveConfig = async (): Promise<UserConfig> => {
  const configValue = configExport as UserConfigExport;
  if (typeof configValue === 'function') {
    const result = configValue({ command: 'serve', mode: 'development' });
    return await Promise.resolve(result);
  }
  return await Promise.resolve(configValue);
};

describe('vite configuration', (): void => {
  it('registers Vue and Vitest defaults', async (): Promise<void> => {
    const config = await resolveConfig();
    expect(config.plugins && config.plugins.length > 0).toBe(true);
    expect(config.test?.environment).toBe('jsdom');
  });
});
