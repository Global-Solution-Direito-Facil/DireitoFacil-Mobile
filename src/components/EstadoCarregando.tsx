/**
 * Estado de carregamento. O texto pulsa devagar: um sinal de que o app esta
 * trabalhando, diferente de uma tela congelada. O leitor de tela anuncia a
 * mensagem.
 */
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MENSAGEM_DEMORA, useDemorou } from '../hooks/useDemorou';
import { cores, espaco, tipografia } from '../lib/tema';
import { Texto } from './Texto';

export function EstadoCarregando({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  const opacidade = useSharedValue(1);
  // Passou de alguns segundos: a mensagem da tela fica e ganha a explicacao embaixo.
  const demorou = useDemorou(true);
  const rotulo = demorou ? `${mensagem} ${MENSAGEM_DEMORA}` : mensagem;

  useEffect(() => {
    opacidade.set(
      withRepeat(
        withSequence(withTiming(0.35, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
      ),
    );
  }, [opacidade]);

  const estiloAnimado = useAnimatedStyle(() => ({ opacity: opacidade.get() }));

  return (
    <View style={e.container} accessibilityRole="progressbar" accessibilityLabel={rotulo}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Animated.Text style={[e.texto, estiloAnimado]}>{mensagem}</Animated.Text>
      {demorou ? (
        <Texto variante="pequeno" cor="textoFraco" centro style={e.demora}>
          {MENSAGEM_DEMORA}
        </Texto>
      ) : null}
    </View>
  );
}

const e = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.md,
    padding: espaco.xl,
    backgroundColor: cores.fundo,
  },
  texto: { ...tipografia.corpo, color: cores.textoFraco, textAlign: 'center' },
  demora: { maxWidth: 320 },
});
