import { Amplify } from 'aws-amplify';
import type { ResourcesConfig } from 'aws-amplify';
import type { EnvironmentConfig } from './environment';

export const createAmplifyConfig = (envConfig: EnvironmentConfig): ResourcesConfig => {
  return {
    Auth: {
      Cognito: {
        userPoolId: envConfig.amplify.userPoolId,
        userPoolClientId: envConfig.amplify.userPoolClientId,
        loginWith: {
          email: true
        }
      }
    },
    API: {
      REST: {
        [envConfig.amplify.apiGatewayName]: {
          endpoint: envConfig.amplify.apiGatewayUrl,
          region: envConfig.amplify.region
        }
      }
    }
  };
};

export const configureAmplify = (envConfig: EnvironmentConfig): void => {
  if (!envConfig.isConfigured) {
    console.warn(
      'Amplify is not configured. Set VITE_AWS_REGION, VITE_USER_POOL_ID, VITE_USER_POOL_CLIENT_ID, VITE_API_GATEWAY_URL, and VITE_API_GATEWAY_NAME.'
    );
    return;
  }

  const amplifyConfig = createAmplifyConfig(envConfig);
  Amplify.configure(amplifyConfig);
};
