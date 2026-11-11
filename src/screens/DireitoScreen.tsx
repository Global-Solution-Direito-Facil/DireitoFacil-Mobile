/**
 * Detalhe do direito: resultado da regra, status, prazo, o passo a passo
 * escrito pela IA com a fonte, e a analise do assistente social.
 */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { LinhaDoTempo } from '../components/LinhaDoTempo';
import { Selo } from '../components/Selo';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { mensagemDoErro } from '../errors/AppError';
import { useCaso } from '../hooks/useCasos';
import { useMeusEnvios } from '../hooks/useEnvios';
import { diasAte, formatarData } from '../lib/formatar';
import { resultadoAvaliacao, statusCaso, statusEnvio } from '../lib/rotulos';
import { cores, espaco, raio } from '../lib/tema';
import { CidadaoStackParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<CidadaoStackParamList, 'Direito'>;

export function DireitoScreen({ navigation, route }: Props) {
  const caso = useCaso(route.params.id);
  const envios = useMeusEnvios();

  if (caso.isPending) return <EstadoCarregando />;
  if (caso.isError) {
    return <EstadoErro mensagem={mensagemDoErro(caso.error)} aoTentarNovamente={caso.refetch} />;
  }

  const c = caso.data;
  const status = statusCaso[c.status];
  const resultado = resultadoAvaliacao[c.resultadoAvaliacao];
  const fechado = c.status === 'CONCEDIDO' || c.status === 'NEGADO';
  const dias = diasAte(c.dataPrazo);
  const passos = (c.orientacao?.passoAPasso ?? '').split('\n').filter(Boolean);

  /** O envio deste direito para esta pessoa, se a familia ja montou um. */
  const envio = (envios.data ?? []).find(
    (x) =>
      x.codigoDireito === c.direito.codigo && (!x.pessoaNome || x.pessoaNome === c.pessoa.nome),
  );
  const podePedirAnalise =
    (c.status === 'ABERTO' || c.status === 'DOCUMENTOS_PENDENTES') &&
    (!envio || envio.status === 'RASCUNHO' || envio.status === 'DEVOLVIDO');

  return (
    <Tela atualizando={caso.isRefetching} aoAtualizar={caso.refetch}>
      <View style={e.cabecalho}>
        <Texto variante="h1">{c.direito.nome}</Texto>
        <Texto cor="textoFraco">
          Para {c.pessoa.nome} · {c.direito.orgao}
        </Texto>
        <View style={e.selos}>
          <Selo {...status} />
          <Selo {...resultado} />
        </View>
      </View>

      <Cartao>
        <Texto variante="h3">Onde está o pedido</Texto>
        <View style={e.linhaDoTempo}>
          <LinhaDoTempo status={c.status} />
        </View>
        <Texto>{status.descricao}</Texto>
        {!fechado && c.dataPrazo ? (
          <Texto variante="corpoForte" cor={dias !== null && dias <= 7 ? 'perigo' : 'primaria'}>
            Prazo: {formatarData(c.dataPrazo)}
            {dias !== null && dias >= 0 ? ` (faltam ${dias} dias)` : ' (vencido)'}
          </Texto>
        ) : null}
        <Texto variante="pequeno" cor="textoFraco">
          Aberto em {formatarData(c.dataAbertura)}
          {c.dataAtualizacao ? ` · atualizado em ${formatarData(c.dataAtualizacao)}` : ''}
        </Texto>
      </Cartao>

      <Cartao style={[e.resultado, { borderColor: cores[resultado.cor] }]}>
        <Texto variante="h3">{resultado.titulo}</Texto>
        {c.resultadoAvaliacao === 'POSSIVEL' ? (
          <>
            <Texto>
              Falta uma informação para a regra oficial ter certeza. Complete os dados de{' '}
              {c.pessoa.nome} e a regra confere de novo.
            </Texto>
            {c.motivo ? (
              <Texto variante="pequeno" cor="textoFraco">
                Motivo: {c.motivo}
              </Texto>
            ) : null}
            <Botao
              titulo="Completar informação"
              icone="account-edit-outline"
              variante="secundario"
              aoTocar={() => navigation.navigate('PessoaForm', { id: c.pessoa.id, foco: 'renda' })}
            />
          </>
        ) : (
          <Texto>
            A regra oficial encontrou este direito para {c.pessoa.nome}. Um assistente social
            confirma antes do pedido.
          </Texto>
        )}
      </Cartao>

      <Cartao>
        <Texto variante="h3">Passo a passo</Texto>
        {passos.length ? (
          passos.map((passo, i) => (
            <View key={i} style={e.passo}>
              <View style={e.numero}>
                <Texto variante="corpoForte" cor="textoSobrePrimaria">
                  {i + 1}
                </Texto>
              </View>
              <Texto style={e.flex}>{passo.replace(/^\d+\.\s*/, '')}</Texto>
            </View>
          ))
        ) : (
          <Texto cor="textoFraco">O passo a passo deste direito ainda está sendo preparado.</Texto>
        )}
        <Texto variante="pequeno" cor="textoFraco">
          Fonte: {c.orientacao?.fonte ?? c.direito.baseLegal}
        </Texto>
        <Texto variante="pequeno" cor="textoFraco">
          Texto explicado por IA a partir da lei. Quem decide o direito é a regra oficial.
        </Texto>
      </Cartao>

      {envio ? (
        <Cartao>
          <Texto variante="h3">Análise do assistente social</Texto>
          <Selo {...statusEnvio[envio.status]} />
          <Texto cor="textoFraco">{envio.documentos.length} documento(s) no envio</Texto>
          {envio.status === 'DEVOLVIDO' && envio.observacao ? (
            <Aviso tipo="alerta" texto={`O que corrigir: ${envio.observacao}`} />
          ) : null}
        </Cartao>
      ) : null}

      {podePedirAnalise ? (
        <Botao
          titulo={
            envio?.status === 'DEVOLVIDO' ? 'Corrigir e reenviar' : 'Enviar documentos para análise'
          }
          icone="send-outline"
          aoTocar={() => navigation.navigate('PedirAnalise', { casoId: c.id })}
        />
      ) : null}
    </Tela>
  );
}

const e = StyleSheet.create({
  cabecalho: { gap: espaco.sm },
  resultado: { borderWidth: 1.5 },
  linhaDoTempo: { marginVertical: espaco.sm },
  selos: { flexDirection: 'row', gap: espaco.sm, flexWrap: 'wrap' },
  passo: { flexDirection: 'row', gap: espaco.md, alignItems: 'flex-start' },
  numero: {
    width: 28,
    height: 28,
    borderRadius: raio.pilula,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
});
