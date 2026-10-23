import '@testing-library/react-native/matchers';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// As fontes de ícones não existem no ambiente de teste: troca por um elemento host simples.
jest.mock('@expo/vector-icons', () => {
  const { createElement } = require('react');
  const Icon = ({ name }: { name: string }) => createElement('Icon', { name });
  return { Ionicons: Icon };
});
