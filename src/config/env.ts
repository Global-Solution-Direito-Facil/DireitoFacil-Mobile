/**
 * ---------------------------------------------------------------------------
 * CONFIGURACAO DE AMBIENTE
 * ---------------------------------------------------------------------------
 * Um lugar so para ler o `.env`. O Expo troca `process.env.EXPO_PUBLIC_X` pelo
 * valor literal no build, por isso cada leitura e escrita por extenso.
 *
 * Tudo que comeca com EXPO_PUBLIC_ vai para dentro do app: nada secreto aqui.
 * ---------------------------------------------------------------------------
 */

const FONTE = (process.env.EXPO_PUBLIC_DATA_SOURCE ?? 'mock').toLowerCase();
const URL_JAVA = process.env.EXPO_PUBLIC_JAVA_API_URL ?? 'http://10.0.2.2:8080';
const URL_DOTNET = process.env.EXPO_PUBLIC_DOTNET_API_URL ?? 'http://10.0.2.2:5000';
const COMMIT = process.env.EXPO_PUBLIC_COMMIT_HASH ?? 'dev';

if (__DEV__ && FONTE === 'mock') {
  console.warn(
    '[config] Rodando com dados de DEMONSTRACAO (EXPO_PUBLIC_DATA_SOURCE=mock).\n' +
      'Nada vai para as APIs. Para usar as APIs reais, troque para "api" no .env\n' +
      'e reinicie com `npx expo start --clear`.',
  );
}

export const config = {
  /**
   * `true` troca o adaptador do Axios por um banco em memoria (ver
   * src/api/mock). Services, interceptors e tratamento de erro sao os mesmos.
   */
  usarMock: FONTE !== 'api',

  /** API Java (Spring Boot): login, pessoas, laudos, direitos e casos. */
  urlJava: URL_JAVA,

  /** API .NET (Minimal API): documentos e envios. */
  urlDotnet: URL_DOTNET,

  /** Hash do commit do build, mostrado na tela "Sobre o app". */
  commit: COMMIT,
} as const;
