export interface AmplifyEnvironment {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  apiGatewayUrl: string;
  apiGatewayName: string;
}

export interface EnvironmentConfig {
  amplify: AmplifyEnvironment;
  isConfigured: boolean;
}

const getEnvValue = (value: string | undefined): string => {
  if (!value) {
    return '';
  }
  return value;
};

export const buildEnvironmentConfig = (env: ImportMetaEnv): EnvironmentConfig => {
  const amplify = {
    region: getEnvValue(env.VITE_AWS_REGION),
    userPoolId: getEnvValue(env.VITE_USER_POOL_ID),
    userPoolClientId: getEnvValue(env.VITE_USER_POOL_CLIENT_ID),
    apiGatewayUrl: getEnvValue(env.VITE_API_GATEWAY_URL),
    apiGatewayName: getEnvValue(env.VITE_API_GATEWAY_NAME)
  };

  const isConfigured = Object.values(amplify).every((value) => value.length > 0);

  return {
    amplify,
    isConfigured
  };
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return buildEnvironmentConfig(import.meta.env);
};
