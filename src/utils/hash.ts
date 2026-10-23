import * as Crypto from 'expo-crypto';

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

/** Sal aleatório de 128 bits, em hexadecimal. */
export function generateSalt(): string {
  return toHex(Crypto.getRandomBytes(16));
}

/** Identificador aleatório de 128 bits, em hexadecimal. */
export function generateId(): string {
  return toHex(Crypto.getRandomBytes(16));
}

/**
 * Hash SHA-256 de `sal + senha`. A senha nunca é guardada em texto puro: apenas o sal e o hash.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}
