import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthBrand } from '../components/AuthBrand';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../contexts/AuthContext';
import { AuthError } from '../services/auth/AuthService';
import { colors, spacing } from '../theme';
import { hasErrors, validateCredentials, validateRegistration } from '../utils/validation';
import type { RegistrationErrors } from '../utils/validation';

interface AuthFormProps {
  kind: 'login' | 'register';
  onSwitch: () => void;
}

const COPY = {
  login: { title: 'Entrar', switchHint: 'Ainda não tem conta?', switchAction: 'Criar conta' },
  register: { title: 'Criar conta', switchHint: 'Já tem conta?', switchAction: 'Entrar' },
} as const;

/** Formulário compartilhado por Login e Cadastro (RF07), com validação e erros por campo. */
export function AuthForm({ kind, onSwitch }: AuthFormProps) {
  const { login, register, mode } = useAuth();
  const copy = COPY[kind];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const found =
      kind === 'register'
        ? validateRegistration(email, password, confirm)
        : validateCredentials(email, password);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await (kind === 'login' ? login : register)(email, password);
      // Sucesso: o AuthContext atualiza `user` e o RootNavigator troca o Stack sozinho.
    } catch (error) {
      setFormError(error instanceof AuthError ? error.message : 'Não foi possível concluir. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AuthBrand mode={mode} />

        <Text style={styles.title} accessibilityRole="header">
          {copy.title}
        </Text>

        <TextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          textContentType="emailAddress"
          error={errors.email}
        />
        <TextField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={kind === 'login' ? 'current-password' : 'new-password'}
          textContentType={kind === 'login' ? 'password' : 'newPassword'}
          error={errors.password}
        />
        {kind === 'register' ? (
          <TextField
            label="Confirmar senha"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirm}
          />
        ) : null}

        {formError ? (
          <Text style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="assertive">
            {formError}
          </Text>
        ) : null}

        <PrimaryButton title={copy.title} onPress={handleSubmit} loading={submitting} />

        <View style={styles.switchRow}>
          <Text style={styles.switchHint}>{copy.switchHint}</Text>
          <PrimaryButton
            title={copy.switchAction}
            variant="secondary"
            onPress={onSwitch}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  formError: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  switchRow: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  switchHint: { color: colors.textMuted, fontSize: 15 },
});
