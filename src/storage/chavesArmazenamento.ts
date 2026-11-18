/** Chaves em um lugar so: o editor autocompleta e o TypeScript confere. */

/** Vao para o SecureStore. */
export const CHAVES_SEGURAS = {
  token: 'auth.token',
} as const;

/** Vao para o AsyncStorage. */
export const CHAVES = {
  /** Dados do usuario logado (nome, e-mail, papel), para o app abrir sem rede. */
  usuario: 'sessao.usuario',
  /** Status dos envios ja vistos e ja notificados, por conta (o e-mail entra na chave). */
  avisos: (email: string) => `avisos.${email}`,
} as const;
