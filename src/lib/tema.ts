/**
 * ---------------------------------------------------------------------------
 * TEMA — a identidade visual do Direito Facil em um lugar so
 * ---------------------------------------------------------------------------
 * Azul de confianca (servico publico), ambar de esperanca e um fundo cor de
 * papel, para lembrar um documento. Os pares texto/fundo usados nas telas
 * passam no contraste AA (4.5:1).
 *
 * Fontes (pasta assets/fonts, licenca OFL):
 *   Lexend               titulos. Criada para facilitar a leitura.
 *   Atkinson Hyperlegible texto. Criada para pessoas com baixa visao.
 * ---------------------------------------------------------------------------
 */

import { TextStyle } from 'react-native';

export const cores = {
  primaria: '#1F4E8C',
  primariaEscura: '#163A69',
  primariaClara: '#E5ECFB',
  destaque: '#F2A541',
  destaqueClaro: '#FDF1DE',

  fundo: '#F6F3EC',
  superficie: '#FFFFFF',
  borda: '#D9DEE6',
  /** Divisor entre linhas de uma mesma lista. */
  divisor: '#ECEEF2',

  texto: '#14202E',
  textoFraco: '#556274',
  textoSobrePrimaria: '#FFFFFF',
  /** Texto secundario sobre o azul: derivado do proprio azul, nunca cinza (contraste 5,8:1). */
  textoSobrePrimariaFraco: '#C9D7EE',

  sucesso: '#1B7A4B',
  sucessoClaro: '#E2F3EA',
  alerta: '#9A6400',
  alertaClaro: '#FBF0D9',
  perigo: '#B3362B',
  perigoClaro: '#FAE6E3',
  info: '#1F55C9',
  infoClaro: '#E5ECFB',
} as const;

export type NomeCor = keyof typeof cores;

/** Nomes registrados no useFonts (App.tsx). */
export const fontes = {
  titulo: 'Lexend_700Bold',
  tituloMedio: 'Lexend_600SemiBold',
  texto: 'AtkinsonHyperlegible_400Regular',
  textoForte: 'AtkinsonHyperlegible_700Bold',
} as const;

export const arquivosDeFonte = {
  [fontes.titulo]: require('../../assets/fonts/Lexend_700Bold.ttf'),
  [fontes.tituloMedio]: require('../../assets/fonts/Lexend_600SemiBold.ttf'),
  [fontes.texto]: require('../../assets/fonts/AtkinsonHyperlegible_400Regular.ttf'),
  [fontes.textoForte]: require('../../assets/fonts/AtkinsonHyperlegible_700Bold.ttf'),
};

/** Escala tipografica. Corpo com 16, o minimo que as guidelines recomendam. */
export const tipografia = {
  destaque: { fontFamily: fontes.titulo, fontSize: 30, lineHeight: 36 },
  h1: { fontFamily: fontes.titulo, fontSize: 24, lineHeight: 30 },
  h2: { fontFamily: fontes.tituloMedio, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fontes.tituloMedio, fontSize: 17, lineHeight: 22 },
  corpo: { fontFamily: fontes.texto, fontSize: 16, lineHeight: 23 },
  corpoForte: { fontFamily: fontes.textoForte, fontSize: 16, lineHeight: 23 },
  pequeno: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20 },
  rotulo: { fontFamily: fontes.textoForte, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
} satisfies Record<string, TextStyle>;

/** Espacos em multiplos de 4. Area de toque minima: 48 (Material) / 44 (Apple). */
export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const raio = { sm: 8, md: 12, lg: 16, pilula: 999 } as const;
export const AREA_TOQUE = 48;

/**
 * Elevacao: sombra com deslocamento e desfoque suave (iOS) e `elevation` (Android,
 * que desenha a sombra tonal do Material). Cartao fica no nivel 1.
 */
export const elevacao = {
  nivel1: {
    shadowColor: '#14202E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  nivel3: {
    shadowColor: '#14202E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
} as const;
