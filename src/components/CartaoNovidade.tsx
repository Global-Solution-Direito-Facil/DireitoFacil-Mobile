/**
 * Novidade de um pedido no Inicio: aprovado (verde) ou devolvido (alerta).
 * Icone e titulo dizem o resultado, entao nao depende so da cor.
 *
 * Movimento (momento raro, entao cabe um pouco de vida):
 *   o cartao sobe 8 px e aparece (entrada padrao das listas, 220 ms);
 *   logo depois, o icone cresce de 0,85 com uma mola de quique pequeno.
 * Com "reduzir movimento", o cartao so aparece e o icone ja esta no lugar.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { Novidade, textoDaNovidade } from '../contexts/AvisosContext';
import { DURACAO, MOLA_CELEBRACAO, entradaDaLista } from '../lib/animacoes';
import { cores, espaco, raio } from '../lib/tema';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Texto } from './Texto';

type Props = { novidade: Novidade; aoAbrir: () => void };

export function CartaoNovidade({ novidade, aoAbrir }: Props) {
  const aprovado = novidade.status === 'APROVADO';
  const escalaIcone = useSharedValue(0.85);

  useEffect(() => {
    // Espera o cartao quase terminar de entrar: as duas coisas nao disputam o olhar.
    escalaIcone.set(withDelay(DURACAO.entrada - 60, withSpring(1, MOLA_CELEBRACAO)));
  }, [escalaIcone]);

  const estiloIcone = useAnimatedStyle(() => ({ transform: [{ scale: escalaIcone.get() }] }));

  return (
    <Animated.View
      entering={entradaDaLista(0)}
      style={[e.cartao, aprovado ? e.aprovado : e.devolvido]}
      accessibilityRole="summary"
      accessibilityLabel={textoDaNovidade(novidade)}
    >
      <View style={e.topo}>
        <Animated.View style={estiloIcone}>
          <Icone
            nome={aprovado ? 'check-circle' : 'arrow-u-left-top'}
            cor={aprovado ? 'sucesso' : 'alerta'}
          />
        </Animated.View>
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
    </Animated.View>
  );
}

const e = StyleSheet.create({
  cartao: { gap: espaco.sm, padding: espaco.lg, borderRadius: raio.lg, borderWidth: 1 },
  aprovado: { backgroundColor: cores.sucessoClaro, borderColor: cores.sucesso },
  devolvido: { backgroundColor: cores.alertaClaro, borderColor: cores.alerta },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
});
