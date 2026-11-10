/**
 * Estado de erro. O "Tentar novamente" so aparece onde ha o que repetir:
 * botao que nao resolve nada ensina a pessoa a ignorar os botoes do app.
 */
import { StyleSheet, View } from 'react-native';

import { cores, espaco } from '../lib/tema';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Texto } from './Texto';

type Props = { mensagem: string; aoTentarNovamente?: () => void };

export function EstadoErro({ mensagem, aoTentarNovamente }: Props) {
  return (
    <View style={e.container}>
      <Icone nome="cloud-off-outline" cor="perigo" tamanho={44} />
      <Texto variante="h3" centro>
        Não deu para carregar
      </Texto>
      <Texto cor="textoFraco" centro>
        {mensagem}
      </Texto>
      {aoTentarNovamente && (
        <Botao
          titulo="Tentar novamente"
          icone="refresh"
          variante="secundario"
          aoTocar={aoTentarNovamente}
          larguraTotal={false}
        />
      )}
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
});
