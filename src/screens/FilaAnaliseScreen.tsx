/** Fila do assistente social (papel GESTOR): envios por status. */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Cartao } from '../components/Cartao';
import { ItemDeLista } from '../components/ItemDeLista';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoVazio } from '../components/EstadoVazio';
import { Opcoes } from '../components/Opcoes';
import { Selo } from '../components/Selo';
import { Texto } from '../components/Texto';
import { mensagemDoErro } from '../errors/AppError';
import { useFila } from '../hooks/useEnvios';
import { formatarData } from '../lib/formatar';
import { statusEnvio } from '../lib/rotulos';
import { cores, espaco } from '../lib/tema';
import { GestorStackParamList } from '../navigation/tipos';
import { StatusEnvio } from '../types/documento';

type Props = NativeStackScreenProps<GestorStackParamList, 'FilaAnalise'>;

const FILTROS: { valor: StatusEnvio; texto: string }[] = [
  { valor: 'ENVIADO', texto: 'Aguardando' },
  { valor: 'DEVOLVIDO', texto: 'Devolvidos' },
  { valor: 'APROVADO', texto: 'Aprovados' },
];

export function FilaAnaliseScreen({ navigation }: Props) {
  const [status, setStatus] = useState<StatusEnvio>('ENVIADO');
  const fila = useFila(status);

  const topo = (
    <View style={e.topo}>
      <Texto cor="textoFraco">
        Confira os documentos de cada família. Aprove ou devolva com uma orientação clara do que
        corrigir.
      </Texto>
      <Opcoes opcoes={FILTROS} selecionada={status} aoEscolher={setStatus} />
    </View>
  );

  return (
    <FlatList
      style={e.lista}
      contentContainerStyle={e.conteudo}
      data={fila.data ?? []}
      keyExtractor={(envio) => envio.id}
      refreshControl={
        <RefreshControl
          refreshing={fila.isRefetching}
          onRefresh={() => void fila.refetch()}
          tintColor={cores.primaria}
          colors={[cores.primaria]}
        />
      }
      ListHeaderComponent={topo}
      ListEmptyComponent={
        fila.isPending ? (
          <EstadoCarregando mensagem="Carregando a fila..." />
        ) : fila.isError ? (
          <EstadoErro mensagem={mensagemDoErro(fila.error)} aoTentarNovamente={fila.refetch} />
        ) : (
          <EstadoVazio titulo="Fila vazia" texto="Nenhum envio com esse status agora." />
        )
      }
      renderItem={({ item: envio, index }) => (
        <ItemDeLista indice={index}>
          <Cartao
            aoTocar={() =>
              navigation.navigate('AnaliseEnvio', {
                id: envio.id,
                nome: envio.pessoaNome ?? envio.donoNome,
              })
            }
            rotuloAcessivel={`Envio de ${envio.donoNome}, ${envio.codigoDireito}`}
          >
            <Texto variante="h3">{envio.pessoaNome ?? envio.donoNome}</Texto>
            <Texto cor="textoFraco">Responsável: {envio.donoNome}</Texto>
            <Texto variante="corpoForte" cor="primaria">
              {envio.codigoDireito}
            </Texto>
            <View style={e.linha}>
              <Selo {...statusEnvio[envio.status]} />
              <Texto variante="pequeno" cor="textoFraco">
                {envio.documentos.length} doc. · enviado em {formatarData(envio.dataEnvio)}
              </Texto>
            </View>
          </Cartao>
        </ItemDeLista>
      )}
    />
  );
}

const e = StyleSheet.create({
  lista: { backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.md, flexGrow: 1 },
  topo: { gap: espaco.md, marginBottom: espaco.sm },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexWrap: 'wrap' },
});
