export const getEnvSafe = (name: string) => {
  const result = process.env[name];
  if (result === undefined) {
    throw new Error(`Unknown ENV variable ${name}`);
  }
  return result;
};

export const isDev = () => getEnvSafe('NODE_ENV') === 'dev';
export const isTesting = () => getEnvSafe('NODE_ENV') === 'test';
