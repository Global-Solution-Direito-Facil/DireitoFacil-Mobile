/**
 * Direitos do catalogo e casos (DireitoResponse / CasoResponse da API Java).
 * Quem decide o resultado e a regra PL/SQL; a IA so escreve a orientacao.
 */

export type GrupoAlvo = 'AUTISMO' | 'PCD' | 'IDOSO' | 'BAIXA_RENDA';

export type Direito = {
  id: number;
  codigo: string;
  nome: string;
  orgao: string;
  baseLegal: string;
  grupoAlvo: GrupoAlvo;
  prazoDias: number;
  statusVerificacao: 'VERIFICADO' | 'CONFIRMAR';
};

export type StatusCaso =
  'ABERTO' | 'EM_ANALISE' | 'DOCUMENTOS_PENDENTES' | 'PROTOCOLADO' | 'CONCEDIDO' | 'NEGADO';

export type ResultadoElegibilidade = 'ELEGIVEL' | 'POSSIVEL' | 'NAO_ELEGIVEL';

/** Passo a passo gerado pela IA, com a fonte citada. */
export type Orientacao = {
  id: number;
  passoAPasso: string;
  fonte: string;
  modelo: string;
  dataGeracao: string;
};

export type Caso = {
  id: number;
  pessoa: { id: number; nome: string };
  direito: Pick<Direito, 'id' | 'codigo' | 'nome' | 'orgao' | 'baseLegal'>;
  status: StatusCaso;
  resultadoAvaliacao: ResultadoElegibilidade;
  motivo: string | null;
  dataAbertura: string;
  dataPrazo: string | null;
  dataAtualizacao: string | null;
  orientacao: Orientacao | null;
};
