export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export interface CredentialsErrors {
  email?: string;
  password?: string;
}

/** Valida e-mail e senha, devolvendo uma mensagem em português por campo inválido. */
export function validateCredentials(email: string, password: string): CredentialsErrors {
  const errors: CredentialsErrors = {};
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Informe um e-mail válido.';

  if (!password) errors.password = 'Informe a senha.';
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return errors;
}

export interface RegistrationErrors extends CredentialsErrors {
  confirm?: string;
}

/** Igual a `validateCredentials`, e confere se a confirmação de senha é igual à senha. */
export function validateRegistration(
  email: string,
  password: string,
  confirm: string,
): RegistrationErrors {
  const errors: RegistrationErrors = validateCredentials(email, password);
  if (password !== confirm) errors.confirm = 'As senhas não conferem.';
  return errors;
}

export const hasErrors = (errors: CredentialsErrors): boolean => Object.keys(errors).length > 0;
