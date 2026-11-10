/**
 * Faixa de mensagem dentro da tela: erro de envio, sucesso, alerta.
 * Cor de fundo, borda fina e icone dizem o tipo; o texto diz o resto.
 * Aparece com um fade curto (estado mudou) e o leitor de tela anuncia.
 */
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { entradaDeAviso, saidaDeAviso } from '../lib/animacoes';
import { cores, espaco, raio } from '../lib/tema';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

type Tipo = 'info' | 'sucesso' | 'alerta' | 'perigo';

const estilos: Record<Tipo, { cor: Tipo; fundo: `${Tipo}Claro`; icone: NomeIcone }> = {
  info: { cor: 'info', fundo: 'infoClaro', icone: 'information-outline' },
  sucesso: { cor: 'sucesso', fundo: 'sucessoClaro', icone: 'check-circle-outline' },
  alerta: { cor: 'alerta', fundo: 'alertaClaro', icone: 'alert-outline' },
  perigo: { cor: 'perigo', fundo: 'perigoClaro', icone: 'alert-circle-outline' },
};

export function Aviso({ tipo = 'info', texto }: { tipo?: Tipo; texto: string }) {
  const { cor, fundo, icone } = estilos[tipo];
  return (
    <Animated.View
      entering={entradaDeAviso}
      exiting={saidaDeAviso}
      style={[e.aviso, { backgroundColor: cores[fundo], borderColor: cores[cor] }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icone nome={icone} cor={cor} />
      <View style={e.flex}>
        <Texto>{texto}</Texto>
      </View>
    </Animated.View>
  );
}

const e = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    gap: espaco.sm,
    alignItems: 'flex-start',
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  flex: { flex: 1 },
});
