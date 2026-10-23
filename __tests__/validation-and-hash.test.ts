import { generateId, generateSalt, hashPassword } from '../src/utils/hash';
import { MIN_PASSWORD_LENGTH, hasErrors, normalizeEmail, validateCredentials } from '../src/utils/validation';

describe('validateCredentials', () => {
  it('aceita e-mail e senha válidos', () => {
    expect(validateCredentials('ana@exemplo.com', 'segredo1')).toEqual({});
  });

  it('exige e-mail no formato correto', () => {
    expect(validateCredentials('', 'segredo1').email).toBe('Informe o e-mail.');
    expect(validateCredentials('sem-arroba', 'segredo1').email).toBe('Informe um e-mail válido.');
    expect(validateCredentials('a@b', 'segredo1').email).toBe('Informe um e-mail válido.');
  });

  it('exige senha com o tamanho mínimo', () => {
    expect(validateCredentials('a@b.co', '').password).toBe('Informe a senha.');
    expect(validateCredentials('a@b.co', '12345').password).toContain(String(MIN_PASSWORD_LENGTH));
    expect(validateCredentials('a@b.co', '123456').password).toBeUndefined();
  });

  it('hasErrors e normalizeEmail', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: 'x' })).toBe(true);
    expect(normalizeEmail('  Ana@Exemplo.COM ')).toBe('ana@exemplo.com');
  });
});

describe('hash de senha (RF07: nunca em texto puro)', () => {
  it('o mesmo sal e a mesma senha geram o mesmo hash, e ele não contém a senha', async () => {
    const salt = generateSalt();
    const a = await hashPassword('minha-senha', salt);
    const b = await hashPassword('minha-senha', salt);
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
    expect(a).not.toContain('minha-senha');
  });

  it('sais diferentes geram hashes diferentes para a mesma senha', async () => {
    const a = await hashPassword('minha-senha', generateSalt());
    const b = await hashPassword('minha-senha', generateSalt());
    expect(a).not.toBe(b);
  });

  it('senhas diferentes geram hashes diferentes', async () => {
    const salt = generateSalt();
    expect(await hashPassword('a', salt)).not.toBe(await hashPassword('b', salt));
  });

  it('gera sais e ids aleatórios de 128 bits em hexadecimal', () => {
    expect(generateSalt()).toMatch(/^[0-9a-f]{32}$/);
    expect(generateId()).toMatch(/^[0-9a-f]{32}$/);
    expect(generateId()).not.toBe(generateId());
  });
});
