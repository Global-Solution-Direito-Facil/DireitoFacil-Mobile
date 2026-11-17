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
 *
 * As telas principais ficam numa BARRA DE ABAS embaixo, que e a primeira tela
 * de cada stack ("Abas"). Os detalhes (um familiar, um direito, um envio)
 * abrem por cima, no stack, e cobrem a barra.
 * ---------------------------------------------------------------------------
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Sobre: undefined;
};

/** Telas comuns ao cidadao e ao gestor, abertas a partir do perfil. */
type TelasDaConta = {
  Sobre: undefined;
  TrocarSenha: undefined;
};

export type CidadaoAbasParamList = {
  Inicio: undefined;
  MeusDireitos: undefined;
  Documentos: undefined;
  Perfil: undefined;
};

export type CidadaoStackParamList = TelasDaConta & {
  Abas: NavigatorScreenParams<CidadaoAbasParamList> | undefined;
  Pessoa: { id: number; nome: string };
  /** Sem `id`: cadastro. Com `id`: edicao. */
  PessoaForm: { id?: number; foco?: 'renda' } | undefined;
  /** O nome viaja junto so para o cabecalho aparecer certo antes de carregar. */
  Direito: { id: number; nome: string };
  NovoDocumento: { pessoaId?: number; tipo?: 'LAUDO' } | undefined;
  PedirAnalise: { casoId: number };
  Receita: undefined;
};

export type GestorAbasParamList = {
  FilaAnalise: undefined;
  Perfil: undefined;
};

export type GestorStackParamList = TelasDaConta & {
  Abas: NavigatorScreenParams<GestorAbasParamList> | undefined;
  AnaliseEnvio: { id: string; nome: string };
};

/** Props de uma aba do cidadao: navega entre abas e tambem para as telas do stack. */
export type CidadaoAbaProps<T extends keyof CidadaoAbasParamList> = CompositeScreenProps<
  BottomTabScreenProps<CidadaoAbasParamList, T>,
  NativeStackScreenProps<CidadaoStackParamList>
>;

export type GestorAbaProps<T extends keyof GestorAbasParamList> = CompositeScreenProps<
  BottomTabScreenProps<GestorAbasParamList, T>,
  NativeStackScreenProps<GestorStackParamList>
>;
