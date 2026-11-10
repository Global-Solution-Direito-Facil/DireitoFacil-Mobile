/** Estrutura de tela: area segura, rolagem, teclado, puxar-para-atualizar e rodape fixo. */
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { cores, espaco } from '../lib/tema';

type Props = {
  children: ReactNode;
  bordas?: Edge[];
  atualizando?: boolean;
  aoAtualizar?: () => void;
  rodape?: ReactNode;
};

export function Tela({ children, bordas = ['bottom'], atualizando, aoAtualizar, rodape }: Props) {
  return (
    <SafeAreaView style={e.area} edges={bordas}>
      <KeyboardAvoidingView style={e.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={e.conteudo}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            aoAtualizar ? (
              <RefreshControl
                refreshing={!!atualizando}
                onRefresh={aoAtualizar}
                tintColor={cores.primaria}
                colors={[cores.primaria]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
        {rodape ? <View style={e.rodape}>{rodape}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const e = StyleSheet.create({
  area: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  conteudo: { padding: espaco.lg, gap: espaco.lg, flexGrow: 1 },
  rodape: {
    padding: espaco.lg,
    gap: espaco.sm,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.superficie,
  },
});
