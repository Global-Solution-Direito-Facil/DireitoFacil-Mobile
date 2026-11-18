/**
 * Icone da barra de abas. A aba ativa ganha uma pilula azul-clara atras do
 * icone e o icone cheio; as outras ficam so com o contorno. Assim a aba atual
 * nao depende so da cor para ser reconhecida.
 *
 * Movimento: a pilula aparece abrindo dos lados (scaleX 0.6 -> 1) e some do
 * mesmo jeito, em 200 ms ease-out (TEMPO_ESTADO). Discreto de proposito: a
 * troca de aba acontece muitas vezes por dia. Com "reduzir movimento", vira
 * so troca de opacidade.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { TEMPO_ESTADO } from '../lib/animacoes';
import { cores, raio } from '../lib/tema';
import { Icone, NomeIcone } from './Icone';

type Props = { focado: boolean; nome: NomeIcone; nomeAtivo: NomeIcone };

export function IconeAba({ focado, nome, nomeAtivo }: Props) {
  const progresso = useSharedValue(focado ? 1 : 0);

  useEffect(() => {
    progresso.set(withTiming(focado ? 1 : 0, TEMPO_ESTADO));
  }, [focado, progresso]);

  // opacity + scaleX: transform roda na thread de UI e nao recalcula o layout.
  const estiloPilula = useAnimatedStyle(() => ({
    opacity: progresso.get(),
    transform: [{ scaleX: 0.6 + 0.4 * progresso.get() }],
  }));

  return (
    <View style={e.area}>
      <Animated.View style={[e.pilula, estiloPilula]} />
      <Icone
        nome={focado ? nomeAtivo : nome}
        cor={focado ? 'primaria' : 'textoFraco'}
        tamanho={24}
      />
    </View>
  );
}

const e = StyleSheet.create({
  area: { width: 56, height: 30, alignItems: 'center', justifyContent: 'center' },
  pilula: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: raio.pilula,
    backgroundColor: cores.primariaClara,
  },
});
