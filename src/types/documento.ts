/**
 * Documentos e envios da API .NET.
 *
 * Dois niveis de tipo:
 *   - *Api: o contrato que a .NET devolve (DocumentoResponse, EnvioResponse e
 *     PagedResponse), com enums em PascalCase ("Laudo", "Rascunho").
 *   - Documento e Envio: o que as telas usam, ja normalizado pelos services.
 */

export type TipoDocumento =
  'LAUDO' | 'RECEITA' | 'RG' | 'CPF' | 'COMPROVANTE_RENDA' | 'COMPROVANTE_RESIDENCIA' | 'OUTRO';

/** RECEBIDO -> PROCESSANDO (IA lendo) -> EXTRAIDO ou FALHA. */
export type StatusDocumento = 'RECEBIDO' | 'PROCESSANDO' | 'EXTRAIDO' | 'FALHA';

/** RASCUNHO -> ENVIADO -> APROVADO | DEVOLVIDO -> (corrige) -> ENVIADO. */
export type StatusEnvio = 'RASCUNHO' | 'ENVIADO' | 'APROVADO' | 'DEVOLVIDO' | 'CANCELADO';

export type DecisaoAnalise = 'APROVAR' | 'DEVOLVER';

// ---- Contrato da API .NET ----------------------------------------------------

/** PagedResponse: page comeca em 1; pageSize vai de 1 a 100. */
export type PaginaDotnet<T> = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

/** DocumentoResponse. O cidadaoId e o e-mail (o `sub` do token). */
export type DocumentoApi = {
  id: string;
  cidadaoId: string;
  tipo: string;
  descricao: string | null;
  nomeArquivo: string;
  contentType: string;
  tamanhoArquivo: number;
  status: string;
  consentimentoSaude: boolean;
  consentimentoSaudeEm: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
};

/** EnvioResponse: os documentos vem so como ids, e a pessoa so pelo caso. */
export type EnvioApi = {
  id: string;
  cidadaoId: string;
  casoId: number;
  direitoCodigo: string;
  status: string;
  observacao: string | null;
  gestorId: string | null;
  enviadoEm: string | null;
  analisadoEm: string | null;
  criadoEm: string;
  documentoIds: string[];
};

// ---- O que as telas usam -----------------------------------------------------

export type Documento = {
  id: string;
  tipo: TipoDocumento;
  nomeArquivo: string;
  contentType: string;
  tamanhoBytes: number;
  status: StatusDocumento;
  consentimentoSaude: boolean;
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
  /** A .NET repassa ao Java para ligar o documento ao familiar. */
  pessoaId: number | null;
  arquivo: ArquivoLocal;
  /** A caixa de consentimento da LGPD; sem ela a .NET recusa laudo e receita (422). */
  consentimentoSaude: boolean;
};

export type Envio = {
  id: string;
  /** Id do caso no Java: e por ele que o envio se liga ao direito e a pessoa. */
  casoId: number;
  codigoDireito: string;
  /** E-mail de quem enviou (o cidadaoId da .NET). */
  donoEmail: string;
  /** Nome do familiar, buscado no caso do Java quando a tela precisa. */
  pessoaNome: string | null;
  status: StatusEnvio;
  observacao: string | null;
  documentoIds: string[];
  /** Detalhe dos documentos: so vem preenchido em buscarEnvio (tela de analise). */
  documentos: Documento[];
  dataCriacao: string;
  dataEnvio: string | null;
};
