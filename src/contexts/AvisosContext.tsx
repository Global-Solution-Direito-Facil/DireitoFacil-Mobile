/**
 * ---------------------------------------------------------------------------
 * AVISOS DOS PEDIDOS — so para o cidadao
 * ---------------------------------------------------------------------------
 * Quando o assistente social aprova ou devolve um envio, a familia precisa
 * saber. Sem push (e sem Firebase), o proprio app percebe a mudanca:
 *
 *   1. a lista de envios e reconsultada a cada minuto com o app aberto, e
 *      tambem quando ele volta para a frente (focusManager no queryClient);
 *   2. um envio que chegou a APROVADO ou DEVOLVIDO e ainda nao foi avisado
 *      dispara uma NOTIFICACAO LOCAL no celular (so no APK; no Expo Go fica
 *      desligada);
 *   3. enquanto a pessoa nao abre o pedido, ele aparece como NOVIDADE: cartao
 *      no Inicio e numero na aba Direitos.
 *
 * O que ja foi visto e avisado fica no celular, por conta. Na primeira vez
 * que roda, o app so anota o estado atual: decisoes antigas nao viram aviso.
 * ---------------------------------------------------------------------------
 */

import { ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useCasos } from '../hooks/useCasos';
import { useMeusEnvios } from '../hooks/useEnvios';
import { navegacaoCidadao } from '../navigation/navegacaoRef';
import { notificar, ouvirToques, prepararNotificacoes } from '../services/notificacoesService';
import { guardarLocal, lerLocal } from '../storage/armazenamentoLocal';
import { CHAVES } from '../storage/chavesArmazenamento';
import { Caso } from '../types/caso';
import { Envio } from '../types/documento';
import { useAuth } from './AuthContext';

/** Reconsulta dos envios com o app aberto. */
const INTERVALO_MS = 60_000;

type Decisao = 'APROVADO' | 'DEVOLVIDO';

export type Novidade = {
  envioId: string;
  casoId: number;
  status: Decisao;
  direito: string;
  pessoa: string | null;
  observacao: string | null;
};

/** envioId -> ultimo status visto (ou avisado). */
type Marcas = Record<string, string>;
type Guardado = { vistos: Marcas; notificados: Marcas };

type AvisosValor = {
  novidades: Novidade[];
  /** Chamado ao abrir o pedido: a novidade sai do Inicio e da aba. */
  marcarVisto: (casoId: number) => void;
};

const AvisosContext = createContext<AvisosValor>({ novidades: [], marcarVisto: () => {} });

function ehDecisao(envio: Envio): envio is Envio & { status: Decisao } {
  return envio.status === 'APROVADO' || envio.status === 'DEVOLVIDO';
}

function paraNovidade(envio: Envio & { status: Decisao }, caso: Caso | undefined): Novidade {
  return {
    envioId: envio.id,
    casoId: envio.casoId,
    status: envio.status,
    direito: caso?.direito.nome ?? envio.codigoDireito,
    pessoa: caso?.pessoa.nome ?? null,
    observacao: envio.observacao,
  };
}

/** Frase da notificacao e do cartao: "Passe Livre de Lucas Almeida foi aprovado." */
export function textoDaNovidade(n: Novidade): string {
  const de = n.pessoa ? `${n.direito}, de ${n.pessoa},` : n.direito;
  if (n.status === 'APROVADO') return `${de} foi aprovado pelo assistente social.`;
  return n.observacao
    ? `${de} voltou para correção: ${n.observacao}`
    : `${de} voltou para correção.`;
}

export function AvisosProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const envios = useMeusEnvios(INTERVALO_MS);
  const casos = useCasos();
  const chave = CHAVES.avisos(usuario?.email ?? '');

  /** undefined: ainda lendo o celular. null: primeira vez nesta conta. */
  const [marcas, setMarcas] = useState<Guardado | null | undefined>(undefined);
  const [podeNotificar, setPodeNotificar] = useState(false);
  // Barreira sincrona: o estado so muda depois de gravar no celular, e nesse
  // meio-tempo o efeito pode rodar de novo. Isto impede notificar duas vezes.
  const avisadosNaSessao = useRef(new Set<string>());

  useEffect(() => {
    lerLocal<Guardado>(chave).then(setMarcas);
  }, [chave]);

  useEffect(() => {
    prepararNotificacoes().then(setPodeNotificar);
  }, []);

  const casoPorId = useMemo(() => new Map((casos.data ?? []).map((c) => [c.id, c])), [casos.data]);

  // Toque na notificacao: abre o pedido daquele caso.
  useEffect(
    () =>
      ouvirToques((casoId) => {
        const abrir = (tentativas: number) => {
          if (navegacaoCidadao.isReady()) {
            const nome = casoPorId.get(casoId)?.direito.nome ?? 'Pedido';
            navegacaoCidadao.navigate('Direito', { id: casoId, nome });
          } else if (tentativas > 0) {
            setTimeout(() => abrir(tentativas - 1), 300);
          }
        };
        abrir(10);
      }),
    [casoPorId],
  );

  // Compara os envios com o que ja foi avisado e notifica o que e novo.
  useEffect(() => {
    if (marcas === undefined || !envios.data) return;
    // Sem os casos, a notificacao sairia sem o nome do direito: espera um pouco.
    if (!casos.data && !casos.isError) return;

    if (marcas === null) {
      const atual: Marcas = Object.fromEntries(envios.data.map((e) => [e.id, e.status]));
      const base = { vistos: atual, notificados: atual };
      guardarLocal(chave, base).then(() => setMarcas(base));
      return;
    }

    const novas = envios.data
      .filter(ehDecisao)
      .filter((e) => marcas.notificados[e.id] !== e.status)
      .filter((e) => !avisadosNaSessao.current.has(`${e.id}:${e.status}`));
    if (novas.length === 0) return;
    for (const envio of novas) avisadosNaSessao.current.add(`${envio.id}:${envio.status}`);

    if (podeNotificar) {
      for (const envio of novas) {
        const novidade = paraNovidade(envio, casoPorId.get(envio.casoId));
        notificar(
          envio.status === 'APROVADO' ? 'Pedido aprovado' : 'Pedido devolvido',
          textoDaNovidade(novidade),
          envio.casoId,
        );
      }
    }
    const notificados = { ...marcas.notificados };
    for (const envio of novas) notificados[envio.id] = envio.status;
    const proximo = { ...marcas, notificados };
    guardarLocal(chave, proximo).then(() => setMarcas(proximo));
  }, [envios.data, casos.data, casos.isError, marcas, podeNotificar, casoPorId, chave]);

  const novidades = useMemo(() => {
    if (!marcas || !envios.data) return [];
    return envios.data
      .filter(ehDecisao)
      .filter((e) => marcas.vistos[e.id] !== e.status)
      .map((e) => paraNovidade(e, casoPorId.get(e.casoId)));
  }, [marcas, envios.data, casoPorId]);

  function marcarVisto(casoId: number) {
    if (!marcas || !envios.data) return;
    const doCaso = envios.data.filter((e) => e.casoId === casoId);
    if (doCaso.every((e) => marcas.vistos[e.id] === e.status)) return;
    const vistos = { ...marcas.vistos };
    for (const envio of doCaso) vistos[envio.id] = envio.status;
    const proximo = { ...marcas, vistos };
    setMarcas(proximo);
    guardarLocal(chave, proximo);
  }

  return (
    <AvisosContext.Provider value={{ novidades, marcarVisto }}>{children}</AvisosContext.Provider>
  );
}

export function useAvisos(): AvisosValor {
  return useContext(AvisosContext);
}
