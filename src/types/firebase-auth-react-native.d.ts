import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

/**
 * Os tipos de `firebase/auth` resolvem para o build web, que não declara `getReactNativePersistence`.
 * Em execução o Metro usa o build React Native (condição `react-native`), que a exporta. Esta
 * declaração apenas informa o TypeScript.
 */
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
