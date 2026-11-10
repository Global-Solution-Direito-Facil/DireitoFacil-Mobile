/** Selo de status. A cor nunca e a unica pista: o texto sempre diz o status. */
import { StyleSheet, View } from 'react-native';

import { Rotulo } from '../lib/rotulos';
import { cores, espaco, raio } from '../lib/tema';
import { Texto } from './Texto';

export function Selo({ texto, cor, fundo }: Rotulo) {
  return (
    <View style={[e.selo, { backgroundColor: cores[fundo], borderColor: cores[cor] }]}>
      <Texto variante="rotulo" cor={cor}>
        {texto.toUpperCase()}
      </Texto>
    </View>
  );
}

const e = StyleSheet.create({
  selo: {
    alignSelf: 'flex-start',
    paddingHorizontal: espaco.sm,
    paddingVertical: 3,
    borderRadius: raio.sm,
    borderWidth: 1,
  },
});
