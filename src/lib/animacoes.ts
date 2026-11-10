/**
 * ---------------------------------------------------------------------------
 * MOVIMENTO — uma regua so para o app inteiro
 * ---------------------------------------------------------------------------
 * Cada animacao do app tem um motivo:
 *
 *   feedback     o toque foi ouvido (botao, caixa, pilula)        100-160 ms
 *   estado       algo mudou (aviso aparece, pilula selecionada)   150-250 ms
 *   continuidade a lista chega em cascata curta, sem "piscar"     220 ms + 40 ms por item
 *   destaque     a linha do tempo do pedido se preenche           560 ms (uma vez por tela)
 *
 * Curva: ease-out forte. Comeca rapido (a resposta aparece na hora) e
 * assenta devagar. Nunca ease-in em interface: atrasa justo o instante que a
 * pessoa esta olhando.
 *
 * Reduzir movimento: `ReduceMotion.System` segue a configuracao do celular.
 * Com ela ligada, as entradas viram corte seco e as cores continuam mudando,
 * porque cor e o que comunica o estado.
 * ---------------------------------------------------------------------------
 */

import { Easing, FadeIn, FadeInDown, FadeOut, ReduceMotion } from 'react-native-reanimated';

/** ease-out forte, cubic-bezier(0.23, 1, 0.32, 1). */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export const DURACAO = {
  toque: 140,
  estado: 200,
  entrada: 220,
  saida: 160,
  destaque: 560,
} as const;

/** Configuracao padrao para `withTiming`. */
export const TEMPO_ESTADO = {
  duration: DURACAO.estado,
  easing: EASE_OUT,
  reduceMotion: ReduceMotion.System,
} as const;

/** Quanto o elemento encolhe enquanto o dedo esta em cima. */
export const ESCALA_PRESSIONADO = 0.97;

/** Mola curta e firme, sem quicar: responde rapido e para no lugar. */
export const MOLA_TOQUE = {
  damping: 26,
  stiffness: 420,
  mass: 0.6,
  reduceMotion: ReduceMotion.System,
} as const;

/** Atraso maximo da cascata: do 7o item em diante, todos chegam juntos. */
const MAX_ITENS_CASCATA = 6;
const PASSO_CASCATA = 40;

/**
 * Entrada de item de lista: sobe 8 px e aparece, em cascata curta.
 * O total nunca passa de ~460 ms, entao uma lista longa nao faz ninguem esperar.
 */
export function entradaDaLista(indice: number) {
  return FadeInDown.duration(DURACAO.entrada)
    .delay(Math.min(indice, MAX_ITENS_CASCATA) * PASSO_CASCATA)
    .easing(EASE_OUT)
    .withInitialValues({ transform: [{ translateY: 8 }] })
    .reduceMotion(ReduceMotion.System);
}

/** Aviso ou mensagem que aparece por causa de algo que a pessoa fez. */
export const entradaDeAviso = FadeIn.duration(DURACAO.estado)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

/** Sai mais rapido do que entrou. */
export const saidaDeAviso = FadeOut.duration(DURACAO.saida).reduceMotion(ReduceMotion.System);
