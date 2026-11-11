/** Meus direitos: um caso por direito encontrado, com status, prazo e filtro. */
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
import { useCasos } from '../hooks/useCasos';
import { diasAte, formatarData } from '../lib/formatar';
import { resultadoAvaliacao, statusCaso } from '../lib/rotulos';
import { cores, espaco } from '../lib/tema';
import { CidadaoStackParamList } from '../navigation/tipos';
import { Caso } from '../types/caso';

type Props = NativeStackScreenProps<CidadaoStackParamList, 'MeusDireitos'>;
type Filtro = 'TODOS' | 'ACAO' | 'ANDAMENTO' | 'ENCERRADOS';

const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: 'TODOS', texto: 'Todos' },
  { valor: 'ACAO', texto: 'Precisa de você' },
  { valor: 'ANDAMENTO', texto: 'Em andamento' },
  { valor: 'ENCERRADOS', texto: 'Encerrados' },
];

const encerrado = (c: Caso) => c.status === 'CONCEDIDO' || c.status === 'NEGADO';

function passaNoFiltro(c: Caso, filtro: Filtro) {
  if (filtro === 'ACAO') return c.status === 'ABERTO' || c.status === 'DOCUMENTOS_PENDENTES';
  if (filtro === 'ANDAMENTO') return c.status === 'EM_ANALISE' || c.status === 'PROTOCOLADO';
  if (filtro === 'ENCERRADOS') return encerrado(c);
  return true;
}

function textoPrazo(c: Caso): { texto: string; urgente: boolean } | null {
  const dias = diasAte(c.dataPrazo);
  if (encerrado(c) || dias === null) return null;
  if (dias < 0) return { texto: `Prazo vencido em ${formatarData(c.dataPrazo)}`, urgente: true };
  return { texto: `Prazo: ${formatarData(c.dataPrazo)} (${dias} dias)`, urgente: dias <= 7 };
}

export function MeusDireitosScreen({ navigation }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const casos = useCasos();

  if (casos.isPending) return <EstadoCarregando mensagem="Buscando seus direitos..." />;
  if (casos.isError) {
    return <EstadoErro mensagem={mensagemDoErro(casos.error)} aoTentarNovamente={casos.refetch} />;
  }

  const lista = casos.data.filter((c) => passaNoFiltro(c, filtro));

  return (
    <FlatList
      style={e.lista}
      contentContainerStyle={e.conteudo}
      data={lista}
      keyExtractor={(c) => String(c.id)}
      refreshControl={
        <RefreshControl
          refreshing={casos.isRefetching}
          onRefresh={() => void casos.refetch()}
          tintColor={cores.primaria}
          colors={[cores.primaria]}
        />
      }
      ListHeaderComponent={
        <View style={e.topo}>
          <Texto cor="textoFraco">
            A regra oficial decide se a pessoa tem direito. Toque em um direito para ver o passo a
            passo.
          </Texto>
          <Opcoes opcoes={FILTROS} selecionada={filtro} aoEscolher={setFiltro} />
        </View>
      }
      ListEmptyComponent={
        <EstadoVazio
          titulo="Nada por aqui"
          texto={
            filtro === 'TODOS'
              ? 'Quando um laudo for lido, os direitos da família aparecem nesta lista.'
              : 'Nenhum direito neste filtro.'
          }
        />
      }
      renderItem={({ item: c, index }) => {
        const prazo = textoPrazo(c);
        return (
          <ItemDeLista indice={index}>
            <Cartao
              aoTocar={() => navigation.navigate('Direito', { id: c.id, nome: c.direito.nome })}
              rotuloAcessivel={`${c.direito.nome}, para ${c.pessoa.nome}, ${statusCaso[c.status].texto}`}
            >
              <View style={e.selos}>
                <Selo {...statusCaso[c.status]} />
                {c.resultadoAvaliacao === 'POSSIVEL' ? (
                  <Selo {...resultadoAvaliacao.POSSIVEL} />
                ) : null}
              </View>
              <Texto variante="h3">{c.direito.nome}</Texto>
              <Texto cor="textoFraco">
                {c.pessoa.nome} · {c.direito.orgao}
              </Texto>
              {prazo ? (
                <Texto variante="pequeno" cor={prazo.urgente ? 'perigo' : 'textoFraco'}>
                  {prazo.texto}
                </Texto>
              ) : null}
            </Cartao>
          </ItemDeLista>
        );
      }}
    />
  );
}

const e = StyleSheet.create({
  lista: { backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.md },
  topo: { gap: espaco.md, marginBottom: espaco.sm },
  selos: { flexDirection: 'row', gap: espaco.sm, flexWrap: 'wrap' },
});
