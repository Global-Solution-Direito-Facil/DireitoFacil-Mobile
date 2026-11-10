/** Texto com a tipografia do app. Respeita o tamanho de fonte escolhido no celular (ate 1,6x). */
import { Text, TextProps } from 'react-native';

import { NomeCor, cores, tipografia } from '../lib/tema';

type Props = TextProps & {
  variante?: keyof typeof tipografia;
  cor?: NomeCor;
  centro?: boolean;
};

const TITULOS = ['destaque', 'h1', 'h2', 'h3'];

export function Texto({ variante = 'corpo', cor = 'texto', centro, style, ...resto }: Props) {
  return (
    <Text
      accessibilityRole={TITULOS.includes(variante) ? 'header' : undefined}
      maxFontSizeMultiplier={1.6}
      style={[
        tipografia[variante],
        { color: cores[cor] },
        centro && { textAlign: 'center' },
        style,
      ]}
      {...resto}
    />
  );
}
