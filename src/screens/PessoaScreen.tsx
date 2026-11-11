/** Detalhe do familiar: dados, laudos e direitos. Daqui se edita e se exclui (CRUD). */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { LinhaInfo } from '../components/LinhaInfo';
import { Selo } from '../components/Selo';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useSnackbar } from '../contexts/SnackbarContext';
import { mensagemDoErro } from '../errors/AppError';
import { useCasos } from '../hooks/useCasos';
import { useExcluirPessoa, useLaudos, usePessoa } from '../hooks/usePessoas';
import { confirmar } from '../lib/confirmar';
import { formatarData, formatarMoeda } from '../lib/formatar';
import { statusCaso, tipoCondicao } from '../lib/rotulos';
import { espaco } from '../lib/tema';
import { CidadaoStackParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<CidadaoStackParamList, 'Pessoa'>;

export function PessoaScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const pessoa = usePessoa(id);
  const laudos = useLaudos(id);
  const casos = useCasos(id);
  const excluir = useExcluirPessoa();
  const { mostrar } = useSnackbar();

  async function aoExcluir() {
    const ok = await confirmar(
      'Excluir familiar?',
      `Os dados de ${pessoa.data?.nome} e os pedidos ligados a essa pessoa serão apagados.`,
      'Excluir',
    );
    if (!ok) return;
    excluir.mutate(id, {
      onSuccess: () => {
        mostrar('Familiar excluído.');
        navigation.goBack();
      },
    });
  }

  if (pessoa.isPending) return <EstadoCarregando />;
  if (pessoa.isError) {
    return (
      <EstadoErro mensagem={mensagemDoErro(pessoa.error)} aoTentarNovamente={pessoa.refetch} />
    );
  }

  const p = pessoa.data;

  return (
    <Tela>
      {excluir.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(excluir.error)} /> : null}

      <Cartao>
        <Texto variante="h2">{p.nome}</Texto>
        <LinhaInfo
          rotulo="Nascimento"
          valor={`${formatarData(p.dataNascimento)} (${p.idade} anos)`}
        />
        <LinhaInfo rotulo="Renda da família" valor={formatarMoeda(p.rendaFamiliar)} />
        <LinhaInfo rotulo="Pessoas na casa" valor={String(p.qtdMembrosFamilia)} />
        <LinhaInfo rotulo="Renda por pessoa" valor={formatarMoeda(p.rendaPerCapita)} />
        <View style={e.acoes}>
          <View style={e.flex}>
            <Botao
              titulo="Editar"
              icone="pencil-outline"
              variante="secundario"
              aoTocar={() => navigation.navigate('PessoaForm', { id: p.id })}
            />
          </View>
          <View style={e.flex}>
            <Botao
              titulo="Excluir"
              icone="trash-can-outline"
              variante="perigo"
              carregando={excluir.isPending}
              aoTocar={aoExcluir}
            />
          </View>
        </View>
      </Cartao>

      <Texto variante="h2">Laudos</Texto>
      {laudos.isPending ? (
        <Texto cor="textoFraco">Carregando laudos...</Texto>
      ) : laudos.isError ? (
        <Aviso tipo="perigo" texto={mensagemDoErro(laudos.error)} />
      ) : laudos.data.length === 0 ? (
        <Cartao>
          <Texto cor="textoFraco">Nenhum laudo lido ainda.</Texto>
          <Botao
            titulo="Enviar laudo"
            aoTocar={() => navigation.navigate('NovoDocumento', { pessoaId: p.id, tipo: 'LAUDO' })}
          />
        </Cartao>
      ) : (
        laudos.data.map((l) => (
          <Cartao key={l.id}>
            <Texto variante="h3">{tipoCondicao[l.tipoCondicao]}</Texto>
            <Texto>{l.condicao}</Texto>
            <Texto cor="textoFraco">
              CID {l.codCid} · laudo de {formatarData(l.dataLaudo)}
            </Texto>
          </Cartao>
        ))
      )}

      <Texto variante="h2">Direitos</Texto>
      {casos.isPending ? (
        <Texto cor="textoFraco">Carregando direitos...</Texto>
      ) : casos.isError ? (
        <Aviso tipo="perigo" texto={mensagemDoErro(casos.error)} />
      ) : casos.data.length === 0 ? (
        <Cartao>
          <Texto cor="textoFraco">
            Pela regra oficial, nenhum direito do catálogo se aplica por enquanto. Se a situação
            mudar (renda, novo laudo), atualize os dados.
          </Texto>
        </Cartao>
      ) : (
        casos.data.map((c) => (
          <Cartao
            key={c.id}
            aoTocar={() => navigation.navigate('Direito', { id: c.id, nome: c.direito.nome })}
            rotuloAcessivel={`${c.direito.nome}, ${statusCaso[c.status].texto}`}
          >
            <Texto variante="corpoForte">{c.direito.nome}</Texto>
            <Selo {...statusCaso[c.status]} />
          </Cartao>
        ))
      )}
    </Tela>
  );
}

const e = StyleSheet.create({
  acoes: { flexDirection: 'row', gap: espaco.sm, marginTop: espaco.sm },
  flex: { flex: 1 },
});
