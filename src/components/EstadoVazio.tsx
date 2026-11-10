/** Estado vazio com a ilustracao do app. Diz o que fazer, nao so que "nao ha nada". */
import { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { espaco } from '../lib/tema';
import { Texto } from './Texto';

type Props = { titulo: string; texto: string; acao?: ReactNode };

export function EstadoVazio({ titulo, texto, acao }: Props) {
  return (
    <View style={e.container}>
      <Image
        source={require('../../assets/images/vazio.png')}
        style={e.ilustracao}
        accessible={false}
      />
      <Texto variante="h3" centro>
        {titulo}
      </Texto>
      <Texto cor="textoFraco" centro>
        {texto}
      </Texto>
      {acao}
    </View>
  );
}

const e = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: espaco.md, padding: espaco.xl },
  ilustracao: { width: 150, height: 150 },
});
