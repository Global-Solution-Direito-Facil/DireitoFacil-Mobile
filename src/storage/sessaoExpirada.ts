/**
 * ---------------------------------------------------------------------------
 * PONTE ENTRE O INTERCEPTOR E O CONTEXTO DE AUTENTICACAO
 * ---------------------------------------------------------------------------
 * O interceptor (src/api/client.ts) recebe o 401, mas quem sabe derrubar a
 * sessao e o AuthContext. Hook nao roda fora de componente, entao o
 * AuthProvider registra aqui a funcao de limpeza quando monta.
 * ---------------------------------------------------------------------------
 */

type AoExpirar = () => Promise<void>;

let aoExpirar: AoExpirar | null = null;

/** Chamado pelo AuthProvider ao montar. */
export function registrarAoExpirar(fn: AoExpirar): void {
  aoExpirar = fn;
}

/** Chamado pelo interceptor quando recebe 401. */
export async function notificarSessaoExpirada(): Promise<void> {
  if (aoExpirar) await aoExpirar();
}
