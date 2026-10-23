import { AuthError } from '../src/services/auth/AuthService';
import { LocalAuthService } from '../src/services/auth/LocalAuthService';
import { createMemoryStore } from '../src/services/storage';

function createService() {
  const users = createMemoryStore();
  const session = createMemoryStore();
  return { service: new LocalAuthService({ users, session }), users, session };
}

describe('LocalAuthService (RF07, login local)', () => {
  it('cadastra, loga e guarda a sessão', async () => {
    const { service, session } = createService();
    const user = await service.register('Ana@Exemplo.com', 'segredo123');

    expect(user.email).toBe('ana@exemplo.com');
    expect(await session.getItem('digidex.session')).toBe(user.id);
  });

  it('NUNCA guarda a senha em texto puro: só sal + hash', async () => {
    const { service, users } = createService();
    await service.register('ana@exemplo.com', 'segredo123');

    const raw = JSON.stringify(users.dump());
    expect(raw).not.toContain('segredo123');
    const stored = JSON.parse(users.dump()['digidex.users'] as string)['ana@exemplo.com'];
    expect(stored.salt).toMatch(/^[0-9a-f]{32}$/);
    expect(stored.passwordHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('login funciona com a senha correta e falha com a errada ou conta inexistente', async () => {
    const { service } = createService();
    await service.register('ana@exemplo.com', 'segredo123');
    await service.logout();

    await expect(service.login('ana@exemplo.com', 'segredo123')).resolves.toMatchObject({ email: 'ana@exemplo.com' });
    await expect(service.login('ana@exemplo.com', 'errada123')).rejects.toMatchObject({
      code: 'invalid-credentials',
    });
    await expect(service.login('outra@exemplo.com', 'segredo123')).rejects.toMatchObject({
      code: 'invalid-credentials',
    });
  });

  it('o e-mail não diferencia maiúsculas de minúsculas', async () => {
    const { service } = createService();
    await service.register('ana@exemplo.com', 'segredo123');
    await expect(service.login('  ANA@exemplo.com ', 'segredo123')).resolves.toBeTruthy();
  });

  it('não permite cadastrar o mesmo e-mail duas vezes', async () => {
    const { service } = createService();
    await service.register('ana@exemplo.com', 'segredo123');
    await expect(service.register('ana@exemplo.com', 'outra-senha')).rejects.toMatchObject({
      code: 'email-in-use',
    });
  });

  it('valida e-mail e senha antes de tudo', async () => {
    const { service } = createService();
    await expect(service.register('invalido', 'segredo123')).rejects.toBeInstanceOf(AuthError);
    await expect(service.register('a@b.co', '123')).rejects.toMatchObject({ code: 'invalid-input' });
    await expect(service.login('', '')).rejects.toMatchObject({ code: 'invalid-input' });
  });

  it('restaura a sessão ao reabrir o app e a encerra no logout', async () => {
    const { service, users, session } = createService();
    const registered = await service.register('ana@exemplo.com', 'segredo123');

    // "Reabrir o app": novo serviço sobre o mesmo armazenamento.
    const reopened = new LocalAuthService({ users, session });
    await expect(reopened.restoreSession()).resolves.toEqual(registered);

    await reopened.logout();
    await expect(new LocalAuthService({ users, session }).restoreSession()).resolves.toBeNull();
  });

  it('descarta uma sessão que aponta para um usuário inexistente', async () => {
    const { service, session } = createService();
    await session.setItem('digidex.session', 'fantasma');
    await expect(service.restoreSession()).resolves.toBeNull();
    expect(await session.getItem('digidex.session')).toBeNull();
  });

  it('usa o modo "local"', () => {
    expect(createService().service.mode).toBe('local');
  });
});
