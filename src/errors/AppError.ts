/**
 * ---------------------------------------------------------------------------
 * ERRO NORMALIZADO DA APLICACAO
 * ---------------------------------------------------------------------------
 * Chegou na tela, e um AppError: sempre tem `tipo` (para decidir o que fazer)
 * e `mensagem` (para mostrar). A tela nunca pergunta se veio do Axios.
 * ---------------------------------------------------------------------------
 */

export type TipoErro =
  | 'REDE'
  | 'TIMEOUT'
  | 'NAO_AUTORIZADO'
  | 'PROIBIDO'
  | 'NAO_ENCONTRADO'
  | 'CONFLITO'
  | 'CLIENTE'
  | 'SERVIDOR'
  | 'DESCONHECIDO';

export class AppError extends Error {
  public readonly tipo: TipoErro;
  public readonly mensagem: string;
  public readonly status?: number;

  /** Erros por campo devolvidos pela validacao da API (ex.: { email: 'ja cadastrado' }). */
  public readonly campos: Record<string, string>;

  constructor(params: {
    tipo: TipoErro;
    mensagem: string;
    status?: number;
    campos?: Record<string, string>;
  }) {
    super(params.mensagem);
    this.name = 'AppError';
    this.tipo = params.tipo;
    this.mensagem = params.mensagem;
    this.status = params.status;
    this.campos = params.campos ?? {};
  }
}

/** Type guard para o `catch (e)`, onde o TypeScript entrega `unknown`. */
export function ehAppError(valor: unknown): valor is AppError {
  return valor instanceof AppError;
}

/** Mensagem pronta para a tela, venha o erro de onde vier. */
export function mensagemDoErro(valor: unknown): string {
  if (ehAppError(valor)) return valor.mensagem;
  if (valor instanceof Error && valor.message) return valor.message;
  return 'Algo deu errado. Tente novamente.';
}
