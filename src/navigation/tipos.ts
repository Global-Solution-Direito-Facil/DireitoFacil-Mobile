/**
 * ---------------------------------------------------------------------------
 * TIPOS DE NAVEGACAO
 * ---------------------------------------------------------------------------
 * TRES STACKS, um para cada momento do app:
 *
 *   AuthStack     quem NAO esta logado
 *   CidadaoStack  papel CIDADAO
 *   GestorStack   papel GESTOR (assistente social)
 *
 * Com um stack so, o TypeScript aceitaria `navigate('FilaAnalise')` na tela
 * do cidadao. Separados, o compilador so oferece as telas que existem.
 * ---------------------------------------------------------------------------
 */

export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Sobre: undefined;
};

export type CidadaoStackParamList = {
  Inicio: undefined;
  Pessoa: { id: number; nome: string };
  /** Sem `id`: cadastro. Com `id`: edicao. */
  PessoaForm: { id?: number } | undefined;
  MeusDireitos: undefined;
  /** O nome viaja junto so para o cabecalho aparecer certo antes de carregar. */
  Direito: { id: number; nome: string };
  Documentos: undefined;
  NovoDocumento: { pessoaId?: number; tipo?: 'LAUDO' } | undefined;
  PedirAnalise: { casoId: number };
  Receita: undefined;
  Perfil: undefined;
  Sobre: undefined;
};

export type GestorStackParamList = {
  FilaAnalise: undefined;
  AnaliseEnvio: { id: string; nome: string };
  Perfil: undefined;
  Sobre: undefined;
};
