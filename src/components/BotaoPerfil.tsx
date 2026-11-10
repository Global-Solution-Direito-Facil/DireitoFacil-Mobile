/** Botao do cabecalho que abre o perfil, com as iniciais de quem esta logado. */
import { Pressable, StyleSheet } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { cores } from '../lib/tema';
import { Texto } from './Texto';

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

export function BotaoPerfil({ aoTocar }: { aoTocar: () => void }) {
  const { usuario } = useAuth();
  return (
    <Pressable
      onPress={aoTocar}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Abrir perfil"
      style={e.botao}
    >
      <Texto variante="rotulo" cor="primaria">
        {iniciais(usuario?.nome ?? '')}
      </Texto>
    </Pressable>
  );
}

const e = StyleSheet.create({
  botao: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.destaqueClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
