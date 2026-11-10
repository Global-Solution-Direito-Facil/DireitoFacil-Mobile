/**
 * Caixa de marcar com area de toque grande e o texto inteiro tocavel.
 *
 * Feedback: ao marcar, o fundo enche de azul e o check cresce de 0,6 para 1
 * em 140 ms. Ao desmarcar, tudo volta pelo mesmo caminho. Com "reduzir
 * movimento", so a cor muda.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DURACAO, EASE_OUT } from '../lib/animacoes';
import { cores, espaco, raio } from '../lib/tema';
import { Icone } from './Icone';
import { Texto } from './Texto';

type Props = {
  marcada: boolean;
  aoMudar: (marcada: boolean) => void;
  texto: string;
  detalhe?: string;
  comErro?: boolean;
};

export function CaixaMarcacao({ marcada, aoMudar, texto, detalhe, comErro }: Props) {
  const progresso = useSharedValue(marcada ? 1 : 0);

  useEffect(() => {
    progresso.set(withTiming(marcada ? 1 : 0, { duration: DURACAO.toque, easing: EASE_OUT }));
  }, [marcada, progresso]);

  const estiloCaixa = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progresso.get(), [0, 1], [cores.superficie, cores.primaria]),
  }));
  const estiloCheck = useAnimatedStyle(() => ({
    opacity: progresso.get(),
    transform: [{ scale: 0.6 + progresso.get() * 0.4 }],
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcada }}
      accessibilityLabel={texto}
      onPress={() => aoMudar(!marcada)}
      style={[e.linha, marcada && e.linhaMarcada]}
    >
      <Animated.View style={[e.caixa, comErro && !marcada && e.caixaErro, estiloCaixa]}>
        <Animated.View style={estiloCheck}>
          <Icone nome="check-bold" cor="textoSobrePrimaria" tamanho={18} />
        </Animated.View>
      </Animated.View>
      <View style={e.flex}>
        <Texto variante="corpoForte">{texto}</Texto>
        {detalhe ? (
          <Texto variante="pequeno" cor="textoFraco" numberOfLines={1}>
            {detalhe}
          </Texto>
        ) : null}
      </View>
    </Pressable>
  );
}

const e = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: 56,
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  linhaMarcada: { borderColor: cores.primaria, backgroundColor: cores.primariaClara },
  caixa: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaErro: { borderColor: cores.perigo },
  flex: { flex: 1 },
});
