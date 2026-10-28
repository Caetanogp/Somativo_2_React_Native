import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';
import { AuthForm } from './AuthForm';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  return <AuthForm kind="login" onSwitch={() => navigation.navigate('Register')} />;
}
