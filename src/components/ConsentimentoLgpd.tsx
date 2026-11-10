/**
 * Consentimento explicito antes de enviar dado de saude (LGPD, art. 11).
 * A caixa comeca DESMARCADA: consentimento pre-marcado nao e consentimento.
 */
import { StyleSheet, View } from 'react-native';

import { cores, espaco, raio } from '../lib/tema';
import { CaixaMarcacao } from './CaixaMarcacao';
import { Texto } from './Texto';

type Props = { aceito: boolean; aoMudar: (aceito: boolean) => void; erro?: string | null };

export function ConsentimentoLgpd({ aceito, aoMudar, erro }: Props) {
  return (
    <View style={e.caixa}>
      <Texto variante="h3">Seus dados, sua decisão</Texto>
      <Texto>
        Laudos e receitas são dados de saúde. Eles serão usados só para conferir direitos e montar
        os pedidos da sua família. O arquivo fica guardado com acesso restrito e você pode apagá-lo
        quando quiser.
      </Texto>
      <CaixaMarcacao
        marcada={aceito}
        aoMudar={aoMudar}
        texto="Concordo em enviar este documento para essa finalidade."
        comErro={!!erro}
      />
      {erro ? (
        <Texto variante="pequeno" cor="perigo">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const e = StyleSheet.create({
  caixa: {
    backgroundColor: cores.primariaClara,
    borderRadius: raio.lg,
    padding: espaco.lg,
    gap: espaco.sm,
  },
});
