/**
 * Pedir analise: escolher os documentos da pessoa e mandar o pacote para o
 * assistente social. Se o envio foi devolvido, reaproveita o mesmo envio.
 */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CaixaMarcacao } from '../components/CaixaMarcacao';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useSnackbar } from '../contexts/SnackbarContext';
import { mensagemDoErro } from '../errors/AppError';
import { useCaso } from '../hooks/useCasos';
import { useDocumentos } from '../hooks/useDocumentos';
import { useMeusEnvios, usePedirAnalise } from '../hooks/useEnvios';
import { novaChaveIdempotencia } from '../lib/confirmar';
import { tipoDocumento } from '../lib/rotulos';
import { CidadaoStackParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<CidadaoStackParamList, 'PedirAnalise'>;

export function PedirAnaliseScreen({ navigation, route }: Props) {
  const caso = useCaso(route.params.casoId);
  const documentos = useDocumentos();
  const envios = useMeusEnvios();
  const pedir = usePedirAnalise();
  const { mostrar } = useSnackbar();
  const [selecionados, setSelecionados] = useState<string[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const chaveCriar = useRef(novaChaveIdempotencia());
  const chaveSubmeter = useRef(novaChaveIdempotencia());

  const c = caso.data;
  const existente =
    c && envios.data
      ? (envios.data.find(
          (x) => x.casoId === c.id && (x.status === 'RASCUNHO' || x.status === 'DEVOLVIDO'),
        ) ?? null)
      : null;

  if (caso.isPending || documentos.isPending || envios.isPending) return <EstadoCarregando />;
  const falha = caso.error ?? documentos.error ?? envios.error;
  if (falha || !c) {
    return (
      <EstadoErro
        mensagem={mensagemDoErro(falha)}
        aoTentarNovamente={() => {
          caso.refetch();
          documentos.refetch();
          envios.refetch();
        }}
      />
    );
  }

  // A .NET guarda os documentos da familia toda; quem escolhe o que vai no pedido e a pessoa.
  const daPessoa = documentos.data ?? [];
  // Enquanto a pessoa nao mexe, um envio devolvido comeca com os documentos que ja estavam nele.
  const marcados = selecionados ?? existente?.documentoIds ?? [];

  function alternar(id: string) {
    setSelecionados(marcados.includes(id) ? marcados.filter((x) => x !== id) : [...marcados, id]);
  }

  function aoEnviar() {
    if (!c) return;
    if (marcados.length === 0) {
      setErro('Escolha pelo menos um documento.');
      return;
    }
    setErro(null);
    pedir.mutate(
      {
        existente,
        casoId: c.id,
        codigoDireito: c.direito.codigo,
        documentoIds: marcados,
        chaveCriar: chaveCriar.current,
        chaveSubmeter: chaveSubmeter.current,
      },
      {
        onSuccess: () => {
          mostrar('Enviado para o assistente social.');
          navigation.goBack();
        },
      },
    );
  }

  return (
    <Tela
      rodape={
        <Botao
          titulo="Enviar para análise"
          aoTocar={aoEnviar}
          carregando={pedir.isPending}
          desativado={daPessoa.length === 0}
        />
      }
    >
      <Texto variante="h2">{c.direito.nome}</Texto>
      <Texto cor="textoFraco">
        Escolha os documentos de {c.pessoa.nome}. O assistente social confere e aprova ou pede
        correção.
      </Texto>
      {existente?.observacao ? (
        <Aviso tipo="alerta" texto={`Correção pedida: ${existente.observacao}`} />
      ) : null}
      {erro ? <Aviso tipo="perigo" texto={erro} /> : null}
      {pedir.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(pedir.error)} /> : null}

      {daPessoa.length === 0 ? (
        <Aviso tipo="info" texto="Você ainda não enviou documentos." />
      ) : (
        daPessoa.map((d) => (
          <CaixaMarcacao
            key={d.id}
            marcada={marcados.includes(d.id)}
            aoMudar={() => alternar(d.id)}
            texto={tipoDocumento[d.tipo]}
            detalhe={d.nomeArquivo}
          />
        ))
      )}

      <Botao
        titulo="Enviar outro documento"
        icone="plus"
        variante="discreto"
        aoTocar={() => navigation.navigate('NovoDocumento', { pessoaId: c.pessoa.id })}
      />
    </Tela>
  );
}
