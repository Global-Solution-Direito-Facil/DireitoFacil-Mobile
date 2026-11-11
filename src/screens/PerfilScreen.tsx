/** Perfil: quem esta logado, "Sobre o app" e sair. Serve ao cidadao e ao gestor. */
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Botao } from '../components/Botao';
import { iniciais } from '../components/BotaoPerfil';
import { Cartao } from '../components/Cartao';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useAuth } from '../contexts/AuthContext';
import { confirmar } from '../lib/confirmar';
import { cores, raio } from '../lib/tema';

export function PerfilScreen() {
  const { usuario, sair } = useAuth();
  // As duas pilhas (cidadao e gestor) tem a tela "Sobre": o tipo minimo basta aqui.
  const navigation = useNavigation<{ navigate: (tela: 'Sobre') => void }>();
  const [saindo, setSaindo] = useState(false);

  async function aoSair() {
    const ok = await confirmar(
      'Sair da conta?',
      'Você vai precisar entrar de novo com e-mail e senha.',
      'Sair',
    );
    if (!ok) return;
    setSaindo(true);
    // Nao navega: sem usuario, o RootNavigator mostra o login sozinho.
    await sair();
  }

  if (!usuario) return null;

  return (
    <Tela>
      <Cartao style={e.centro}>
        <View style={e.avatar}>
          <Texto variante="h1" cor="primaria">
            {iniciais(usuario.nome)}
          </Texto>
        </View>
        <Texto variante="h2" centro>
          {usuario.nome}
        </Texto>
        <Texto cor="textoFraco" centro>
          {usuario.email}
        </Texto>
        <Texto variante="rotulo" cor="primaria">
          {usuario.papel === 'GESTOR' ? 'ASSISTENTE SOCIAL' : 'CIDADÃO'}
        </Texto>
      </Cartao>
      <Botao
        titulo="Sobre o app"
        icone="information-outline"
        variante="secundario"
        aoTocar={() => navigation.navigate('Sobre')}
      />
      <Botao titulo="Sair" icone="logout" variante="perigo" carregando={saindo} aoTocar={aoSair} />
    </Tela>
  );
}

const e = StyleSheet.create({
  centro: { alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: raio.pilula,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
