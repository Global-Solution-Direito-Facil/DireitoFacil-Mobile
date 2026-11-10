/** Uma linha "rotulo ........ valor", que quebra para baixo em tela estreita ou fonte grande. */
import { StyleSheet, View } from 'react-native';

import { espaco } from '../lib/tema';
import { Texto } from './Texto';

export function LinhaInfo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={e.linha}>
      <Texto cor="textoFraco">{rotulo}</Texto>
      <Texto variante="corpoForte" selectable>
        {valor}
      </Texto>
    </View>
  );
}

const e = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: espaco.md,
  },
});
