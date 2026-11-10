/**
 * ---------------------------------------------------------------------------
 * PRESSIONAVEL — a microinteracao de toque, em um lugar so
 * ---------------------------------------------------------------------------
 * Encolhe o conteudo enquanto o dedo esta em cima. Sem esse retorno, a pessoa
 * nao sabe se o toque pegou e toca de novo: num "enviar", isso vira envio
 * duplicado.
 *
 * O `useSharedValue` vive na thread de UI: mudar ele nao re-renderiza nada e
 * a animacao roda a 60fps mesmo com a thread de JS ocupada.
 * ---------------------------------------------------------------------------
 */
import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ESCALA_PRESSIONADO, MOLA_TOQUE } from '../lib/animacoes';

const AreaAnimada = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  semAnimacao?: boolean;
};

export function Pressionavel({ children, style, semAnimacao, ...resto }: Props) {
  const escala = useSharedValue(1);

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: escala.get() }],
  }));

  return (
    <AreaAnimada
      {...resto}
      style={[style, estiloAnimado]}
      onPressIn={(evento) => {
        if (!semAnimacao) escala.set(withSpring(ESCALA_PRESSIONADO, MOLA_TOQUE));
        resto.onPressIn?.(evento);
      }}
      onPressOut={(evento) => {
        if (!semAnimacao) escala.set(withSpring(1, MOLA_TOQUE));
        resto.onPressOut?.(evento);
      }}
    >
      {children}
    </AreaAnimada>
  );
}
