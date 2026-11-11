/**
 * Login. Repare no que esta tela NAO faz: nao navega depois de entrar.
 * O `entrar` muda o usuario no AuthContext e o RootNavigator troca as telas.
 */
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ComponentRef, useRef, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { config } from '../config/env';
import { useAuth } from '../contexts/AuthContext';
import { mensagemDoErro } from '../errors/AppError';
import { espaco } from '../lib/tema';
import { temErros, validar, validarEmail, validarSenhaLogin } from '../lib/validacao';
import { AuthStackParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { entrar, avisoSessao } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Esta tela nao tem o cabecalho azul: a barra de status precisa de texto escuro.
  const focada = useIsFocused();
  const campoSenha = useRef<ComponentRef<typeof TextInput>>(null);

  async function aoEntrar() {
    const encontrados = validar({
      email: () => validarEmail(email),
      senha: () => validarSenhaLogin(senha),
    });
    setErros(encontrados);
    setErroGeral(null);
    if (temErros(encontrados)) return;

    setEnviando(true);
    try {
      await entrar({ email: email.trim().toLowerCase(), senha });
    } catch (erro) {
      setErroGeral(mensagemDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <Tela bordas={['top', 'bottom']}>
      {focada ? <StatusBar style="dark" /> : null}
      <View style={e.topo}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={e.logo}
          accessibilityLabel="Logo do Direito Fácil: uma porta aberta com um sinal de certo"
        />
        <Texto variante="destaque" centro>
          Direito Fácil
        </Texto>
        <Texto cor="textoFraco" centro>
          O laudo que abre portas. Descubra e acompanhe os direitos da sua família.
        </Texto>
      </View>

      {avisoSessao ? <Aviso tipo="alerta" texto={avisoSessao} /> : null}
      {erroGeral ? <Aviso tipo="perigo" texto={erroGeral} /> : null}

      <View style={e.formulario}>
        <CampoTexto
          rotulo="E-mail"
          value={email}
          onChangeText={setEmail}
          erro={erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => campoSenha.current?.focus()}
          placeholder="seu@email.com"
        />
        <CampoTexto
          ref={campoSenha}
          rotulo="Senha"
          value={senha}
          onChangeText={setSenha}
          erro={erros.senha}
          senha
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={aoEntrar}
        />
        <Botao titulo="Entrar" aoTocar={aoEntrar} carregando={enviando} />
      </View>

      <View style={e.rodape}>
        <Texto centro>Ainda não tem conta?</Texto>
        <Botao
          titulo="Criar conta"
          variante="secundario"
          aoTocar={() => navigation.navigate('Cadastro')}
        />
        <Botao
          titulo="Sobre o app"
          variante="discreto"
          aoTocar={() => navigation.navigate('Sobre')}
        />
      </View>

      {config.usarMock ? (
        <Texto variante="pequeno" cor="textoFraco" centro>
          Modo demonstração, com dados fictícios. Teste com ana.almeida@email.com (cidadã) ou
          rafaela.gomes@cras.gov.br (assistente social), senha Senha@123.
        </Texto>
      ) : null}
    </Tela>
  );
}

const e = StyleSheet.create({
  topo: { alignItems: 'center', gap: espaco.sm, marginTop: espaco.xl },
  logo: { width: 96, height: 96 },
  formulario: { gap: espaco.lg },
  rodape: { gap: espaco.sm },
});
