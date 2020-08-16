export const log = (name: string) => (...args: any[]): void => {
  console.log(`[${name}]`, ...args);
};
