// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

/**
 * Arquitetura em camadas, garantida pelo lint:
 *
 *   Tela -> Hook -> Service -> api/client.ts -> API
 *
 * Telas e componentes nao falam com a rede nem com o armazenamento. Se um
 * desses imports aparecer numa tela, falta uma camada (um hook ou um service).
 */
const camadasProibidasNaTela = {
  paths: [
    { name: 'axios', message: 'Tela não chama a API: use um hook de src/hooks.' },
    { name: 'expo-secure-store', message: 'Tela não mexe no token: use o AuthContext.' },
    {
      name: '@react-native-async-storage/async-storage',
      message: 'Tela não mexe no armazenamento: use o AuthContext ou um hook.',
    },
  ],
  patterns: [
    {
      group: ['**/api/*', '**/api/**', '**/services/*', '**/storage/*'],
      message: 'Tela e componente usam hooks (src/hooks) e contextos, não services nem a API.',
    },
  ],
};

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'android/*', 'ios/*'],
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['src/screens/**', 'src/components/**'],
    rules: {
      'no-restricted-imports': ['error', camadasProibidasNaTela],
    },
  },
]);
