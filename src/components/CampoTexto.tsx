/**
 * Campo de formulario: rotulo sempre visivel (placeholder some ao digitar e
 * nao serve de rotulo), dica, mensagem de erro e "mostrar senha".
 */
import { ComponentRef, forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { AREA_TOQUE, cores, espaco, fontes, raio } from '../lib/tema';
import { Texto } from './Texto';

type Props = TextInputProps & {
  rotulo: string;
  erro?: string | null;
  dica?: string;
  senha?: boolean;
};

export const CampoTexto = forwardRef<ComponentRef<typeof TextInput>, Props>(function CampoTexto(
  { rotulo, erro, dica, senha, style, onFocus, onBlur, ...resto },
  ref,
) {
  const [focado, setFocado] = useState(false);
  const [oculta, setOculta] = useState(true);

  return (
    <View style={e.container}>
      <Texto variante="corpoForte">{rotulo}</Texto>
      {dica && !erro ? (
        <Texto variante="pequeno" cor="textoFraco">
          {dica}
        </Texto>
      ) : null}
      <View style={[e.caixa, focado && e.caixaFocada, !!erro && e.caixaComErro]}>
        <TextInput
          ref={ref}
          accessibilityLabel={rotulo}
          accessibilityHint={erro ?? dica}
          placeholderTextColor={cores.textoFraco}
          secureTextEntry={senha && oculta}
          maxFontSizeMultiplier={1.6}
          onFocus={(evento) => {
            setFocado(true);
            onFocus?.(evento);
          }}
          onBlur={(evento) => {
            setFocado(false);
            onBlur?.(evento);
          }}
          style={[e.input, style]}
          {...resto}
        />
        {senha && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={oculta ? 'Mostrar senha' : 'Esconder senha'}
            onPress={() => setOculta((valor) => !valor)}
            hitSlop={8}
            style={e.mostrar}
          >
            <Texto variante="pequeno" cor="primaria">
              {oculta ? 'Mostrar' : 'Esconder'}
            </Texto>
          </Pressable>
        )}
      </View>
      {erro ? (
        <Texto variante="pequeno" cor="perigo" accessibilityLiveRegion="polite">
          {erro}
        </Texto>
      ) : null}
    </View>
  );
});

const e = StyleSheet.create({
  container: { gap: espaco.xs },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: AREA_TOQUE,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raio.md,
    backgroundColor: cores.superficie,
  },
  caixaFocada: { borderColor: cores.primaria },
  caixaComErro: { borderColor: cores.perigo },
  input: {
    flex: 1,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.md,
    fontFamily: fontes.texto,
    fontSize: 16,
    color: cores.texto,
  },
  mostrar: { paddingHorizontal: espaco.md, minHeight: AREA_TOQUE, justifyContent: 'center' },
});
