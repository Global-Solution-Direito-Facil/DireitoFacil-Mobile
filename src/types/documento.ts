/** Documentos e envios da API .NET. */

export type TipoDocumento =
  'LAUDO' | 'RECEITA' | 'RG' | 'CPF' | 'COMPROVANTE_RENDA' | 'COMPROVANTE_RESIDENCIA' | 'OUTRO';

/** RECEBIDO -> PROCESSANDO (IA lendo) -> EXTRAIDO ou FALHA. */
export type StatusDocumento = 'RECEBIDO' | 'PROCESSANDO' | 'EXTRAIDO' | 'FALHA';

export type Documento = {
  id: string;
  tipo: TipoDocumento;
  nomeArquivo: string;
  contentType: string;
  tamanhoBytes: number;
  status: StatusDocumento;
  pessoaId: number | null;
  dataEnvio: string;
};

/**
 * O que o FormData do React Native aceita como arquivo: o caminho local que
 * o ImagePicker devolve. Nao e Blob nem File (esses sao do navegador).
 */
export type ArquivoLocal = {
  uri: string;
  name: string;
  type: string;
  tamanhoBytes?: number;
};

export type NovoDocumento = {
  tipo: TipoDocumento;
  pessoaId: number | null;
  arquivo: ArquivoLocal;
};

/** RASCUNHO -> ENVIADO -> APROVADO | DEVOLVIDO -> (corrige) -> ENVIADO. */
export type StatusEnvio = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'DEVOLVIDO' | 'CANCELADO';

export type Envio = {
  id: string;
  codigoDireito: string;
  donoEmail: string;
  donoNome: string;
  pessoaNome: string | null;
  status: StatusEnvio;
  observacao: string | null;
  documentos: Documento[];
  dataCriacao: string;
  dataEnvio: string | null;
};

export type DecisaoAnalise = 'APROVAR' | 'DEVOLVER';
