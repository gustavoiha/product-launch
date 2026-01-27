import { describe, expect, it } from 'vitest';
import { buildEnvironmentConfig } from '../src/config/environment';

describe('environment config', (): void => {
  it('marks configuration as incomplete when env values are missing', (): void => {
    const config = buildEnvironmentConfig({} as ImportMetaEnv);
    expect(config.isConfigured).toBe(false);
  });

  it('builds a configured environment when values are present', (): void => {
    const config = buildEnvironmentConfig({
      VITE_AWS_REGION: 'us-west-2',
      VITE_USER_POOL_ID: 'pool-id',
      VITE_USER_POOL_CLIENT_ID: 'client-id',
      VITE_API_GATEWAY_URL: 'https://api.example.com',
      VITE_API_GATEWAY_NAME: 'productLaunchApi'
    } as ImportMetaEnv);

    expect(config.isConfigured).toBe(true);
    expect(config.amplify.apiGatewayName).toBe('productLaunchApi');
  });
});
