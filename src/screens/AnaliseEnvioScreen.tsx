/** Analise de um envio: aprovar ou devolver com observacao (PATCH /envios/{id}/status). */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { Cartao } from '../components/Cartao';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { Selo } from '../components/Selo';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useSnackbar } from '../contexts/SnackbarContext';
import { mensagemDoErro } from '../errors/AppError';
import { useDecidirEnvio, useEnvio } from '../hooks/useEnvios';
import { formatarData, formatarTamanho } from '../lib/formatar';
import { statusEnvio, tipoDocumento } from '../lib/rotulos';
import { espaco } from '../lib/tema';
import { GestorStackParamList } from '../navigation/tipos';
import { DecisaoAnalise } from '../types/documento';

type Props = NativeStackScreenProps<GestorStackParamList, 'AnaliseEnvio'>;

export function AnaliseEnvioScreen({ navigation, route }: Props) {
  const envio = useEnvio(route.params.id);
  const decidir = useDecidirEnvio();
  const { mostrar } = useSnackbar();
  const [observacao, setObservacao] = useState('');
  const [erroObservacao, setErroObservacao] = useState<string | null>(null);

  function aoDecidir(decisao: DecisaoAnalise) {
    if (decisao === 'DEVOLVER' && !observacao.trim()) {
      setErroObservacao('Explique para a família o que precisa ser corrigido.');
      return;
    }
    setErroObservacao(null);
    decidir.mutate(
      { id: route.params.id, decisao, observacao: observacao.trim() },
      {
        onSuccess: () => {
          mostrar(decisao === 'APROVAR' ? 'Envio aprovado.' : 'Envio devolvido para a família.');
          navigation.goBack();
        },
      },
    );
  }

  if (envio.isPending) return <EstadoCarregando />;
  if (envio.isError) {
    return <EstadoErro mensagem={mensagemDoErro(envio.error)} aoTentarNovamente={envio.refetch} />;
  }

  const x = envio.data;
  const aguardando = x.status === 'ENVIADO';
  const decidindo = decidir.isPending ? decidir.variables?.decisao : undefined;

  return (
    <Tela
      rodape={
        aguardando ? (
          <View style={e.botoes}>
            <View style={e.flex}>
              <Botao
                titulo="Devolver"
                variante="perigo"
                carregando={decidindo === 'DEVOLVER'}
                desativado={decidir.isPending}
                aoTocar={() => aoDecidir('DEVOLVER')}
              />
            </View>
            <View style={e.flex}>
              <Botao
                titulo="Aprovar"
                carregando={decidindo === 'APROVAR'}
                desativado={decidir.isPending}
                aoTocar={() => aoDecidir('APROVAR')}
              />
            </View>
          </View>
        ) : undefined
      }
    >
      <Cartao>
        <Texto variante="h2">{x.pessoaNome ?? x.donoNome}</Texto>
        <Texto cor="textoFraco">
          Responsável: {x.donoNome} ({x.donoEmail})
        </Texto>
        <Texto variante="corpoForte" cor="primaria">
          {x.codigoDireito}
        </Texto>
        <Selo {...statusEnvio[x.status]} />
        <Texto variante="pequeno" cor="textoFraco">
          Enviado em {formatarData(x.dataEnvio)}
        </Texto>
      </Cartao>

      {decidir.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(decidir.error)} /> : null}
      {x.observacao ? <Aviso tipo="info" texto={`Observação: ${x.observacao}`} /> : null}

      <Texto variante="h2">Documentos</Texto>
      {x.documentos.map((d) => (
        <Cartao key={d.id}>
          <Texto variante="corpoForte">{tipoDocumento[d.tipo]}</Texto>
          <Texto variante="pequeno" cor="textoFraco" numberOfLines={1}>
            {d.nomeArquivo} · {formatarTamanho(d.tamanhoBytes)}
          </Texto>
        </Cartao>
      ))}

      {aguardando ? (
        <CampoTexto
          rotulo="Observação para a família"
          dica="Obrigatória para devolver. Escreva de forma simples."
          value={observacao}
          onChangeText={setObservacao}
          erro={erroObservacao}
          multiline
          numberOfLines={3}
          style={e.observacao}
        />
      ) : null}
    </Tela>
  );
}

const e = StyleSheet.create({
  botoes: { flexDirection: 'row', gap: espaco.sm },
  flex: { flex: 1 },
  observacao: { minHeight: 96, textAlignVertical: 'top' },
});
