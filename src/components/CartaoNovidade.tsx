/**
 * Novidade de um pedido no Inicio: aprovado (verde) ou devolvido (alerta).
 * Icone e titulo dizem o resultado, entao nao depende so da cor.
 */
import { StyleSheet, View } from 'react-native';

import { Novidade, textoDaNovidade } from '../contexts/AvisosContext';
import { cores, espaco, raio } from '../lib/tema';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Texto } from './Texto';

type Props = { novidade: Novidade; aoAbrir: () => void };

export function CartaoNovidade({ novidade, aoAbrir }: Props) {
  const aprovado = novidade.status === 'APROVADO';
  return (
    <View
      style={[e.cartao, aprovado ? e.aprovado : e.devolvido]}
      accessibilityRole="summary"
      accessibilityLabel={textoDaNovidade(novidade)}
    >
      <View style={e.topo}>
        <Icone
          nome={aprovado ? 'check-circle' : 'arrow-u-left-top'}
          cor={aprovado ? 'sucesso' : 'alerta'}
        />
        <Texto variante="h3" cor={aprovado ? 'sucesso' : 'alerta'}>
          {aprovado ? 'Pedido aprovado' : 'Pedido devolvido'}
        </Texto>
      </View>
      <Texto>{textoDaNovidade(novidade)}</Texto>
      <Botao
        titulo={aprovado ? 'Ver pedido' : 'Corrigir pedido'}
        variante="secundario"
        aoTocar={aoAbrir}
      />
    </View>
  );
}

const e = StyleSheet.create({
  cartao: { gap: espaco.sm, padding: espaco.lg, borderRadius: raio.lg, borderWidth: 1 },
  aprovado: { backgroundColor: cores.sucessoClaro, borderColor: cores.sucesso },
  devolvido: { backgroundColor: cores.alertaClaro, borderColor: cores.alerta },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
});
