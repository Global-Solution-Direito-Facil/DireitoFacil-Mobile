/**
 * ---------------------------------------------------------------------------
 * LINHA DO TEMPO DO PEDIDO — o momento de destaque do app
 * ---------------------------------------------------------------------------
 * "Em que ponto meu pedido parou?" e a pergunta que o Direito Facil existe
 * para responder. Quatro etapas, da abertura ao resultado:
 *
 *   Aberto  ->  Documentos  ->  Protocolado  ->  Resultado
 *
 * Cor como estado: etapas feitas em azul, a atual na cor do status (ambar se
 * falta documento, verde se concedido, vermelho se negado), as futuras em
 * cinza. Cada etapa tambem tem icone e texto: a cor nunca fala sozinha.
 *
 * Movimento (uma vez, ao abrir o detalhe): a linha se preenche da esquerda
 * ate a etapa atual em 560 ms, ease-out forte, e a bolinha da etapa atual
 * cresce de 0,85 para 1 no fim. Explica o progresso; nao e enfeite. Com
 * "reduzir movimento", a linha ja aparece cheia.
 * ---------------------------------------------------------------------------
 */
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { DURACAO, EASE_OUT } from '../lib/animacoes';
import { NomeCor, cores, espaco } from '../lib/tema';
import { StatusCaso } from '../types/caso';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

const ETAPAS: { titulo: string; icone: NomeIcone }[] = [
  { titulo: 'Aberto', icone: 'folder-open-outline' },
  { titulo: 'Documentos', icone: 'file-document-multiple-outline' },
  { titulo: 'Protocolado', icone: 'stamper' },
  { titulo: 'Resultado', icone: 'flag-checkered' },
];

/** Em que etapa o status esta, e com que cor a etapa atual aparece. */
function etapaAtual(status: StatusCaso): { indice: number; cor: NomeCor; icone?: NomeIcone } {
  switch (status) {
    case 'ABERTO':
      return { indice: 0, cor: 'primaria' };
    case 'DOCUMENTOS_PENDENTES':
      return { indice: 1, cor: 'alerta', icone: 'alert-outline' };
    case 'EM_ANALISE':
      return { indice: 1, cor: 'info', icone: 'magnify' };
    case 'PROTOCOLADO':
      return { indice: 2, cor: 'primaria' };
    case 'CONCEDIDO':
      return { indice: 3, cor: 'sucesso', icone: 'check-decagram' };
    case 'NEGADO':
      return { indice: 3, cor: 'perigo', icone: 'close-octagon-outline' };
  }
}

const TAMANHO_BOLINHA = 36;

export function LinhaDoTempo({ status }: { status: StatusCaso }) {
  const atual = etapaAtual(status);
  const [largura, setLargura] = useState(0);
  const preenchimento = useSharedValue(0);
  const escalaAtual = useSharedValue(0.85);

  // A linha vai do centro da 1a bolinha ao centro da ultima; enche ate a etapa atual.
  const comprimento = Math.max(largura - TAMANHO_BOLINHA, 0);
  const alvo = atual.indice / (ETAPAS.length - 1);

  useEffect(() => {
    if (largura === 0) return;
    preenchimento.set(
      withTiming(alvo, {
        duration: DURACAO.destaque,
        easing: EASE_OUT,
        reduceMotion: ReduceMotion.System,
      }),
    );
    escalaAtual.set(
      withDelay(
        DURACAO.destaque - 160,
        withTiming(1, { duration: 200, easing: EASE_OUT, reduceMotion: ReduceMotion.System }),
      ),
    );
  }, [alvo, largura, preenchimento, escalaAtual]);

  // scaleX em vez de width: transform roda na thread de UI e nao recalcula o layout.
  const estiloLinha = useAnimatedStyle(() => ({ transform: [{ scaleX: preenchimento.get() }] }));
  const estiloAtual = useAnimatedStyle(() => ({ transform: [{ scale: escalaAtual.get() }] }));

  function aoMedir(evento: LayoutChangeEvent) {
    setLargura(evento.nativeEvent.layout.width);
  }

  return (
    <View
      accessible
      accessibilityLabel={`Etapa ${atual.indice + 1} de ${ETAPAS.length}: ${ETAPAS[atual.indice]?.titulo}`}
    >
      <View style={e.trilho} onLayout={aoMedir}>
        <View style={e.linhaFundo} />
        <Animated.View style={[e.linhaFeita, { width: comprimento }, estiloLinha]} />
        <View style={e.bolinhas}>
          {ETAPAS.map((etapa, i) => {
            const feita = i < atual.indice;
            const ehAtual = i === atual.indice;
            const fundo: NomeCor = ehAtual ? atual.cor : feita ? 'primaria' : 'superficie';
            const icone = ehAtual && atual.icone ? atual.icone : feita ? 'check' : etapa.icone;
            const corIcone: NomeCor = feita || ehAtual ? 'textoSobrePrimaria' : 'textoFraco';
            return (
              <Animated.View
                key={etapa.titulo}
                style={[
                  e.bolinha,
                  { backgroundColor: cores[fundo] },
                  !feita && !ehAtual && e.bolinhaFutura,
                  ehAtual && estiloAtual,
                ]}
              >
                <Icone nome={icone} cor={corIcone} tamanho={18} />
              </Animated.View>
            );
          })}
        </View>
      </View>
      <View style={e.rotulos}>
        {ETAPAS.map((etapa, i) => (
          <Texto
            key={etapa.titulo}
            variante="rotulo"
            cor={i === atual.indice ? atual.cor : i < atual.indice ? 'texto' : 'textoFraco'}
            style={[e.rotulo, i === 0 && e.rotuloInicio, i === ETAPAS.length - 1 && e.rotuloFim]}
            numberOfLines={1}
            // Com fonte grande, o rotulo encolhe so o necessario para caber inteiro.
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {etapa.titulo}
          </Texto>
        ))}
      </View>
    </View>
  );
}

const ESPESSURA = 4;

const e = StyleSheet.create({
  trilho: { height: TAMANHO_BOLINHA, justifyContent: 'center' },
  linhaFundo: {
    position: 'absolute',
    left: TAMANHO_BOLINHA / 2,
    right: TAMANHO_BOLINHA / 2,
    height: ESPESSURA,
    borderRadius: ESPESSURA,
    backgroundColor: cores.borda,
  },
  linhaFeita: {
    position: 'absolute',
    left: TAMANHO_BOLINHA / 2,
    height: ESPESSURA,
    borderRadius: ESPESSURA,
    backgroundColor: cores.primaria,
    transformOrigin: 'left',
  },
  bolinhas: { flexDirection: 'row', justifyContent: 'space-between' },
  bolinha: {
    width: TAMANHO_BOLINHA,
    height: TAMANHO_BOLINHA,
    borderRadius: TAMANHO_BOLINHA / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinhaFutura: { borderWidth: 2, borderColor: cores.borda },
  rotulos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: espaco.sm },
  rotulo: { width: 84, textAlign: 'center', marginHorizontal: -24 },
  rotuloInicio: { textAlign: 'left', marginLeft: 0 },
  rotuloFim: { textAlign: 'right', marginRight: 0 },
});
