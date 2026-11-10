/** Superficie branca com borda suave. Com `aoTocar`, vira botao (e ganha a animacao de toque). */
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { cores, elevacao, espaco, raio } from '../lib/tema';
import { Pressionavel } from './Pressionavel';

type Props = {
  children: ReactNode;
  aoTocar?: () => void;
  rotuloAcessivel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Cartao({ children, aoTocar, rotuloAcessivel, style }: Props) {
  if (aoTocar) {
    return (
      <Pressionavel
        accessibilityRole="button"
        accessibilityLabel={rotuloAcessivel}
        onPress={aoTocar}
        style={[e.cartao, style]}
      >
        {children}
      </Pressionavel>
    );
  }
  return <View style={[e.cartao, style]}>{children}</View>;
}

const e = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.sm,
    ...elevacao.nivel1,
  },
});
