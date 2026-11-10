/** Beneficiario (PessoaRequest / PessoaResponse) e laudo (LaudoResponse) da API Java. */

/** Corpo de POST e PUT /pessoas. */
export type DadosPessoa = {
  nome: string;
  /** ISO yyyy-MM-dd */
  dataNascimento: string;
  rendaFamiliar: number;
  qtdMembrosFamilia: number;
};

export type Pessoa = DadosPessoa & {
  id: number;
  responsavel: { id: number; nome: string; email: string };
  idade: number;
  rendaPerCapita: number;
  dataCadastro: string;
};

export type TipoCondicao =
  | 'TEA'
  | 'DEF_FISICA'
  | 'DEF_VISUAL'
  | 'DEF_AUDITIVA'
  | 'DEF_INTELECTUAL'
  | 'DEF_MULTIPLA'
  | 'OUTRA';

export type Laudo = {
  id: number;
  pessoa: { id: number; nome: string };
  documentoId: number | null;
  codCid: string;
  condicao: string;
  tipoCondicao: TipoCondicao;
  dataLaudo: string;
  dataCadastro: string;
};
