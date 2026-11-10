/** Botoes de camera e galeria, com a previa da foto escolhida. */
import { Image, StyleSheet, View } from 'react-native';

import { Origem } from '../lib/imagem';
import { cores, espaco, raio } from '../lib/tema';
import { ArquivoLocal } from '../types/documento';
import { Botao } from './Botao';
import { Texto } from './Texto';

type Props = {
  arquivo: ArquivoLocal | null;
  aoEscolher: (origem: Origem) => void;
  erro?: string | null;
};

export function SeletorImagem({ arquivo, aoEscolher, erro }: Props) {
  return (
    <View style={e.container}>
      {arquivo ? (
        <Image
          source={{ uri: arquivo.uri }}
          style={e.previa}
          resizeMode="cover"
          accessibilityLabel="Prévia da foto escolhida"
        />
      ) : (
        <View style={[e.previa, e.vazia, !!erro && e.vaziaComErro]}>
          <Texto cor="textoFraco" centro>
            Tire a foto com boa luz, sem cortar as bordas do papel.
          </Texto>
        </View>
      )}
      {erro ? (
        <Texto variante="pequeno" cor="perigo">
          {erro}
        </Texto>
      ) : null}
      <View style={e.botoes}>
        <View style={e.flex}>
          <Botao
            titulo="Câmera"
            icone="camera-outline"
            variante="secundario"
            aoTocar={() => aoEscolher('camera')}
          />
        </View>
        <View style={e.flex}>
          <Botao
            titulo="Galeria"
            icone="image-outline"
            variante="secundario"
            aoTocar={() => aoEscolher('galeria')}
          />
        </View>
      </View>
    </View>
  );
}

const e = StyleSheet.create({
  container: { gap: espaco.sm },
  previa: {
    width: '100%',
    height: 260,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
  },
  vazia: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco.xl,
  },
  vaziaComErro: { borderColor: cores.perigo },
  botoes: { flexDirection: 'row', gap: espaco.sm },
  flex: { flex: 1 },
});
