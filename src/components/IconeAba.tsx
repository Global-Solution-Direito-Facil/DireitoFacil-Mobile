/**
 * Icone da barra de abas. A aba ativa ganha uma pilula azul-clara atras do
 * icone e o icone cheio; as outras ficam so com o contorno. Assim a aba atual
 * nao depende so da cor para ser reconhecida.
 */
import { StyleSheet, View } from 'react-native';

import { cores, raio } from '../lib/tema';
import { Icone, NomeIcone } from './Icone';

type Props = { focado: boolean; nome: NomeIcone; nomeAtivo: NomeIcone };

export function IconeAba({ focado, nome, nomeAtivo }: Props) {
  return (
    <View style={[e.pilula, focado && e.pilulaAtiva]}>
      <Icone
        nome={focado ? nomeAtivo : nome}
        cor={focado ? 'primaria' : 'textoFraco'}
        tamanho={24}
      />
    </View>
  );
}

const e = StyleSheet.create({
  pilula: {
    width: 56,
    height: 30,
    borderRadius: raio.pilula,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pilulaAtiva: { backgroundColor: cores.primariaClara },
});
