/**
 * Botao com area de toque de 48, estado de carregamento e rotulo para leitor
 * de tela. Enquanto `carregando`, fica desativado: tocar de novo nao reenvia.
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AREA_TOQUE, NomeCor, cores, espaco, raio } from '../lib/tema';
import { Icone, NomeIcone } from './Icone';
import { Pressionavel } from './Pressionavel';
import { Texto } from './Texto';

type Variante = 'primario' | 'secundario' | 'discreto' | 'perigo';

type Props = {
  titulo: string;
  aoTocar: () => void;
  variante?: Variante;
  carregando?: boolean;
  desativado?: boolean;
  larguraTotal?: boolean;
  icone?: NomeIcone;
};

const aparencia: Record<Variante, { fundo: string; texto: NomeCor; borda: string }> = {
  primario: { fundo: cores.primaria, texto: 'textoSobrePrimaria', borda: cores.primaria },
  secundario: { fundo: cores.superficie, texto: 'primaria', borda: cores.primaria },
  discreto: { fundo: 'transparent', texto: 'primaria', borda: 'transparent' },
  perigo: { fundo: cores.superficie, texto: 'perigo', borda: cores.perigo },
};

export function Botao({
  titulo,
  aoTocar,
  variante = 'primario',
  carregando,
  desativado,
  larguraTotal = true,
  icone,
}: Props) {
  const a = aparencia[variante];
  const inativo = desativado || carregando;

  return (
    <Pressionavel
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
      disabled={inativo}
      semAnimacao={inativo}
      onPress={aoTocar}
      style={[
        e.base,
        { backgroundColor: a.fundo, borderColor: a.borda },
        larguraTotal && e.larguraTotal,
        inativo && e.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cores[a.texto]} />
      ) : (
        <View style={e.conteudo}>
          {icone ? <Icone nome={icone} cor={a.texto} tamanho={20} /> : null}
          <Texto variante="corpoForte" cor={a.texto}>
            {titulo}
          </Texto>
        </View>
      )}
    </Pressionavel>
  );
}

const e = StyleSheet.create({
  base: {
    minHeight: AREA_TOQUE,
    paddingHorizontal: espaco.lg,
    borderRadius: raio.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  larguraTotal: { alignSelf: 'stretch' },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  inativo: { opacity: 0.55 },
});
