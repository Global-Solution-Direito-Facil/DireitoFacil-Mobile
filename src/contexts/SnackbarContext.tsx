/**
 * ---------------------------------------------------------------------------
 * SNACKBAR — confirmacao rapida depois de uma acao
 * ---------------------------------------------------------------------------
 * Salvar, enviar, excluir e aprovar fecham a tela. Sem um retorno, a pessoa
 * nao sabe se deu certo e repete a acao. O snackbar (padrao do Material)
 * confirma sem interromper: aparece embaixo, fica 3,5 s e some sozinho.
 *
 * Movimento: sobe 24 px e aparece em 220 ms (ease-out forte); sai pelo mesmo
 * caminho, mais rapido (160 ms). Com "reduzir movimento", so aparece e some.
 *
 * Fica num contexto porque quem dispara (a tela que fecha) nao e quem mostra
 * (a tela que fica embaixo dela).
 * ---------------------------------------------------------------------------
 */
import { ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone } from '../components/Icone';
import { Texto } from '../components/Texto';
import { DURACAO, EASE_OUT } from '../lib/animacoes';
import { cores, elevacao, espaco, raio } from '../lib/tema';

type Tipo = 'sucesso' | 'erro';
type Mensagem = { id: number; texto: string; tipo: Tipo };

type SnackbarValor = { mostrar: (texto: string, tipo?: Tipo) => void };

const SnackbarContext = createContext<SnackbarValor | null>(null);

const TEMPO_NA_TELA = 3500;

const entrada = FadeInDown.duration(DURACAO.entrada)
  .easing(EASE_OUT)
  .withInitialValues({ transform: [{ translateY: 24 }] })
  .reduceMotion(ReduceMotion.System);
const saida = FadeOutDown.duration(DURACAO.saida).reduceMotion(ReduceMotion.System);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const mostrar = useCallback((texto: string, tipo: Tipo = 'sucesso') => {
    if (temporizador.current) clearTimeout(temporizador.current);
    // Um id novo troca a mensagem com animacao, mesmo que o texto se repita.
    setMensagem({ id: Date.now(), texto, tipo });
    temporizador.current = setTimeout(() => setMensagem(null), TEMPO_NA_TELA);
  }, []);

  return (
    <SnackbarContext.Provider value={{ mostrar }}>
      {children}
      <View pointerEvents="none" style={[e.area, { bottom: insets.bottom + espaco.lg }]}>
        {mensagem ? (
          <Animated.View
            key={mensagem.id}
            entering={entrada}
            exiting={saida}
            style={e.snackbar}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Icone
              nome={mensagem.tipo === 'sucesso' ? 'check-circle' : 'alert-circle'}
              cor={mensagem.tipo === 'sucesso' ? 'destaque' : 'perigoClaro'}
            />
            <Texto cor="textoSobrePrimaria" style={e.texto}>
              {mensagem.texto}
            </Texto>
          </Animated.View>
        ) : null}
      </View>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarValor {
  const contexto = useContext(SnackbarContext);
  if (!contexto) throw new Error('useSnackbar precisa estar dentro de um SnackbarProvider');
  return contexto;
}

const e = StyleSheet.create({
  area: { position: 'absolute', left: espaco.lg, right: espaco.lg },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: 48,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.texto,
    ...elevacao.nivel3,
  },
  texto: { flex: 1 },
});
