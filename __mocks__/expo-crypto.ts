// Substitui o módulo nativo por Node `crypto` nos testes.
import { createHash, randomBytes } from 'crypto';

export const CryptoDigestAlgorithm = { SHA256: 'SHA-256' } as const;

export const getRandomBytes = (count: number): Uint8Array => new Uint8Array(randomBytes(count));

export const digestStringAsync = async (_algorithm: string, data: string): Promise<string> =>
  createHash('sha256').update(data).digest('hex');
