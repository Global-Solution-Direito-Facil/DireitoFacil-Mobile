/**
 * Item de lista que chega em cascata curta (sobe 8 px e aparece, 40 ms depois
 * do anterior). Explica que a lista chegou, sem fazer ninguem esperar: do 7o
 * item em diante, todos entram juntos. Ver lib/animacoes.ts.
 */
import { ReactNode } from 'react';
import Animated from 'react-native-reanimated';

import { entradaDaLista } from '../lib/animacoes';

export function ItemDeLista({ indice, children }: { indice: number; children: ReactNode }) {
  return <Animated.View entering={entradaDaLista(indice)}>{children}</Animated.View>;
}
