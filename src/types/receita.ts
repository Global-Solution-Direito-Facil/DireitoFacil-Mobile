/**
 * Receita e Farmacia Popular (tabelas T_DF_RECEITA e T_DF_RECEITA_ITEM).
 * A IA so le a receita; a pessoa confere; a tabela do programa decide.
 */

/** O que a IA leu de cada remedio da foto. */
export type Medicamento = {
  nome: string;
  principioAtivo: string;
  /** Concentracao, como esta na receita (ex.: "50 mg"). */
  dosagem: string;
};

/** O remedio depois que a pessoa conferiu, com o que a IA tinha lido. */
export type RemedioConferido = Medicamento & {
  /** O nome que a IA leu (DES_NOME_LIDO). Vazio se a pessoa incluiu o remedio a mao. */
  nomeLido: string;
  /** A pessoa mudou alguma coisa da leitura (STA_CORRIGIDO). */
  corrigido: boolean;
};

/**
 * GRATUITO            principio e dosagem estao no elenco
 * DOSAGEM_DIVERGENTE  o principio esta no elenco, a dosagem nao
 * NAO_ENCONTRADO      nao consta no elenco
 */
export type ResultadoFarmacia = 'GRATUITO' | 'DOSAGEM_DIVERGENTE' | 'NAO_ENCONTRADO';

export type ResultadoMedicamento = {
  nome: string;
  principioAtivo: string;
  dosagem: string;
  corrigido: boolean;
  resultado: ResultadoFarmacia;
  /** Orientacao do banco. Nunca sugere trocar de remedio ou de dosagem. */
  orientacao: string;
};

// ---- Contrato da API Java ------------------------------------------------------

/** ReceitaItemResponse: o Java decide o resultado ao gravar o item. */
export type ReceitaItemApi = {
  id: number;
  nomeLido: string;
  principioAtivo: string;
  concentracao: string | null;
  corrigido: boolean;
  resultado: ResultadoFarmacia;
  medicamento: unknown;
  orientacao: string | null;
};

/** ReceitaResponse (GET /receitas/{id}). */
export type ReceitaApi = {
  id: number;
  pessoa: { id: number; nome: string };
  documentoId: number | null;
  dataRegistro: string;
  totalItens: number;
  totalGratuitos: number;
  itens: ReceitaItemApi[];
};
