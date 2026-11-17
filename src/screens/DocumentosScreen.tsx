/** Documentos enviados para a API .NET: listar, enviar e apagar. */
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { ItemDeLista } from '../components/ItemDeLista';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoVazio } from '../components/EstadoVazio';
import { Selo } from '../components/Selo';
import { Texto } from '../components/Texto';
import { useSnackbar } from '../contexts/SnackbarContext';
import { mensagemDoErro } from '../errors/AppError';
import { useDocumentos, useExcluirDocumento } from '../hooks/useDocumentos';
import { confirmar } from '../lib/confirmar';
import { formatarData, formatarTamanho } from '../lib/formatar';
import { statusDocumento, tipoDocumento } from '../lib/rotulos';
import { cores, espaco } from '../lib/tema';
import { CidadaoAbaProps } from '../navigation/tipos';
import { Documento } from '../types/documento';

type Props = CidadaoAbaProps<'Documentos'>;

export function DocumentosScreen({ navigation }: Props) {
  const documentos = useDocumentos();
  const excluir = useExcluirDocumento();
  const { mostrar } = useSnackbar();

  async function aoExcluir(doc: Documento) {
    const ok = await confirmar(
      'Apagar documento?',
      `${tipoDocumento[doc.tipo]} (${doc.nomeArquivo}) será apagado do servidor.`,
      'Apagar',
    );
    if (ok) excluir.mutate(doc.id, { onSuccess: () => mostrar('Documento apagado.') });
  }

  if (documentos.isPending) return <EstadoCarregando mensagem="Carregando documentos..." />;
  if (documentos.isError) {
    return (
      <EstadoErro
        mensagem={mensagemDoErro(documentos.error)}
        aoTentarNovamente={documentos.refetch}
      />
    );
  }

  return (
    <View style={e.tela}>
      <FlatList
        contentContainerStyle={e.conteudo}
        data={documentos.data}
        keyExtractor={(d) => d.id}
        refreshControl={
          <RefreshControl
            refreshing={documentos.isRefetching}
            onRefresh={() => void documentos.refetch()}
            tintColor={cores.primaria}
            colors={[cores.primaria]}
          />
        }
        ListHeaderComponent={
          excluir.isError ? (
            <Aviso tipo="perigo" texto={mensagemDoErro(excluir.error)} />
          ) : undefined
        }
        ListEmptyComponent={
          <EstadoVazio
            titulo="Nenhum documento"
            texto="Envie o laudo, o RG e os comprovantes para montar os pedidos."
          />
        }
        renderItem={({ item: d, index }) => (
          <ItemDeLista indice={index}>
            <Cartao>
              <Texto variante="corpoForte">{tipoDocumento[d.tipo]}</Texto>
              <Texto variante="pequeno" cor="textoFraco" numberOfLines={1}>
                {d.nomeArquivo} · {formatarTamanho(d.tamanhoBytes)} · {formatarData(d.dataEnvio)}
              </Texto>
              <View style={e.linha}>
                <Selo {...statusDocumento[d.status]} />
                <Botao
                  titulo="Apagar"
                  icone="trash-can-outline"
                  variante="perigo"
                  larguraTotal={false}
                  carregando={excluir.isPending && excluir.variables === d.id}
                  aoTocar={() => aoExcluir(d)}
                />
              </View>
            </Cartao>
          </ItemDeLista>
        )}
      />
      <View style={e.rodape}>
        <Botao titulo="Enviar documento" aoTocar={() => navigation.navigate('NovoDocumento')} />
      </View>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.md, flexGrow: 1 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rodape: {
    padding: espaco.lg,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.superficie,
  },
});
