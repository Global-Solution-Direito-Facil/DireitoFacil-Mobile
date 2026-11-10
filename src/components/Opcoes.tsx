/**
 * Escolha unica em pilulas: mais facil de tocar que um select.
 * A pilula escolhida enche de azul em 200 ms (estado mudou) e ganha um check,
 * para a escolha nao depender so da cor.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { TEMPO_ESTADO } from '../lib/animacoes';
import { cores, espaco, raio } from '../lib/tema';
import { Icone } from './Icone';
import { Texto } from './Texto';

type Props<T extends string | number> = {
  rotulo?: string;
  opcoes: { valor: T; texto: string }[];
  selecionada: T | null;
  aoEscolher: (valor: T) => void;
  erro?: string | null;
};

export function Opcoes<T extends string | number>({
  rotulo,
  opcoes,
  selecionada,
  aoEscolher,
  erro,
}: Props<T>) {
  return (
    <View style={e.container}>
      {rotulo ? <Texto variante="corpoForte">{rotulo}</Texto> : null}
      <View style={e.linha} accessibilityRole="radiogroup">
        {opcoes.map((opcao) => (
          <Pilula
            key={String(opcao.valor)}
            texto={opcao.texto}
            ativa={opcao.valor === selecionada}
            aoTocar={() => aoEscolher(opcao.valor)}
          />
        ))}
      </View>
      {erro ? (
        <Texto variante="pequeno" cor="perigo">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

function Pilula({ texto, ativa, aoTocar }: { texto: string; ativa: boolean; aoTocar: () => void }) {
  const progresso = useSharedValue(ativa ? 1 : 0);

  useEffect(() => {
    progresso.set(withTiming(ativa ? 1 : 0, TEMPO_ESTADO));
  }, [ativa, progresso]);

  const estilo = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progresso.get(), [0, 1], [cores.superficie, cores.primaria]),
    borderColor: interpolateColor(progresso.get(), [0, 1], [cores.borda, cores.primaria]),
  }));

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: ativa }}
      accessibilityLabel={texto}
      onPress={aoTocar}
    >
      <Animated.View style={[e.pilula, estilo]}>
        {ativa ? <Icone nome="check" cor="textoSobrePrimaria" tamanho={18} /> : null}
        <Texto variante="corpoForte" cor={ativa ? 'textoSobrePrimaria' : 'texto'}>
          {texto}
        </Texto>
      </Animated.View>
    </Pressable>
  );
}

const e = StyleSheet.create({
  container: { gap: espaco.sm },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    minHeight: 44,
    paddingHorizontal: espaco.lg,
    borderRadius: raio.pilula,
    borderWidth: 1.5,
  },
});
