/**
 * Icones do app: um conjunto so (Material Design Icons, do @expo/vector-icons),
 * no mesmo traco, para combinar com o Android. Icone que so enfeita fica fora
 * do leitor de tela; o texto ao lado ja diz o que e.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

import { NomeCor, cores } from '../lib/tema';

export type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = { nome: NomeIcone; cor?: NomeCor; tamanho?: number };

export function Icone({ nome, cor = 'texto', tamanho = 22 }: Props) {
  return (
    <MaterialCommunityIcons
      name={nome}
      size={tamanho}
      color={cores[cor]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
