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

import { cores, espaco, tipografia } from '../lib/tema';

export function EstadoCarregando({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  const opacidade = useSharedValue(1);

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
    <View style={e.container} accessibilityRole="progressbar" accessibilityLabel={mensagem}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Animated.Text style={[e.texto, estiloAnimado]}>{mensagem}</Animated.Text>
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
});
