import { describe, expect, it, vi } from 'vitest';
import type { EnvironmentConfig } from '../src/config/environment';

const configureMock = vi.fn();

vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: configureMock
  }
}));

const { configureAmplify, createAmplifyConfig } = await import('../src/config/amplify');

describe('amplify config', (): void => {
  const envConfig: EnvironmentConfig = {
    isConfigured: true,
    amplify: {
      region: 'us-west-2',
      userPoolId: 'pool-id',
      userPoolClientId: 'client-id',
      apiGatewayUrl: 'https://api.example.com',
      apiGatewayName: 'productLaunchApi'
    }
  };

  it('builds a valid amplify configuration', (): void => {
    const config = createAmplifyConfig(envConfig);
    expect(config.Auth?.Cognito?.userPoolId).toBe('pool-id');
    expect(config.API?.REST?.productLaunchApi?.endpoint).toBe('https://api.example.com');
  });

  it('configures amplify when env is complete', (): void => {
    configureAmplify(envConfig);
    expect(configureMock).toHaveBeenCalledTimes(1);
  });

  it('skips configure when env is incomplete', (): void => {
    configureMock.mockClear();
    configureAmplify({
      ...envConfig,
      isConfigured: false
    });
    expect(configureMock).not.toHaveBeenCalled();
  });
});
