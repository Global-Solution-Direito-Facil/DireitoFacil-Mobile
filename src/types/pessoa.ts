/** Beneficiario (PessoaRequest / PessoaResponse) e laudo (LaudoResponse) da API Java. */

/** Corpo de POST e PUT /pessoas. */
export type DadosPessoa = {
  nome: string;
  /** ISO yyyy-MM-dd */
  dataNascimento: string;
  rendaFamiliar: number;
  qtdMembrosFamilia: number;
  /**
   * Renda so da pessoa, por mes. Usada no passe de onibus do idoso, que olha a
   * renda individual (ate 2 salarios minimos) e nao a da familia.
   * 0 = nao tem renda. null = nao sabe ou prefere nao informar (o banco trata
   * como POSSIVEL, nunca como zero).
   */
  rendaIndividual: number | null;
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
