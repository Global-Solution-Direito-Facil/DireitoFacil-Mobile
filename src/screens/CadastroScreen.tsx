/** Cadastro que ja entra: a API devolve o token junto com a conta criada. */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useAuth } from '../contexts/AuthContext';
import { ehAppError, mensagemDoErro } from '../errors/AppError';
import { mascaras } from '../lib/formatar';
import { espaco } from '../lib/tema';
import {
  temErros,
  validar,
  validarConfirmacao,
  validarCpf,
  validarEmail,
  validarNome,
  validarNovaSenha,
} from '../lib/validacao';

type Campo = 'nome' | 'cpf' | 'email' | 'senha' | 'confirmacao';

export function CadastroScreen() {
  const { cadastrar } = useAuth();
  const [form, setForm] = useState<Record<Campo, string>>({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmacao: '',
  });
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const mudar = (campo: Campo) => (valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  async function aoCadastrar() {
    const encontrados = validar<Campo>({
      nome: () => validarNome(form.nome),
      cpf: () => validarCpf(form.cpf),
      email: () => validarEmail(form.email),
      senha: () => validarNovaSenha(form.senha),
      confirmacao: () => validarConfirmacao(form.senha, form.confirmacao),
    });
    setErros(encontrados);
    setErroGeral(null);
    if (temErros(encontrados)) return;

    setEnviando(true);
    try {
      await cadastrar({
        nome: form.nome.trim(),
        cpf: form.cpf,
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
      });
    } catch (erro) {
      // Erro por campo da API (ex.: e-mail ja cadastrado) aparece embaixo do campo.
      if (ehAppError(erro)) setErros(erro.campos as Partial<Record<Campo, string>>);
      setErroGeral(mensagemDoErro(erro));
      setEnviando(false);
    }
  }

  return (
    <Tela>
      <Texto cor="textoFraco">
        Crie sua conta para cadastrar a família, enviar laudos e acompanhar cada pedido.
      </Texto>
      {erroGeral ? <Aviso tipo="perigo" texto={erroGeral} /> : null}
      <View style={e.formulario}>
        <CampoTexto
          rotulo="Nome completo"
          value={form.nome}
          onChangeText={mudar('nome')}
          erro={erros.nome}
          autoComplete="name"
          autoCapitalize="words"
        />
        <CampoTexto
          rotulo="CPF"
          value={form.cpf}
          onChangeText={(v) => mudar('cpf')(mascaras.cpf(v))}
          erro={erros.cpf}
          keyboardType="number-pad"
          placeholder="000.000.000-00"
        />
        <CampoTexto
          rotulo="E-mail"
          value={form.email}
          onChangeText={mudar('email')}
          erro={erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        <CampoTexto
          rotulo="Senha"
          dica="Pelo menos 8 caracteres, com letras e números."
          value={form.senha}
          onChangeText={mudar('senha')}
          erro={erros.senha}
          senha
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <CampoTexto
          rotulo="Confirme a senha"
          value={form.confirmacao}
          onChangeText={mudar('confirmacao')}
          erro={erros.confirmacao}
          senha
          returnKeyType="go"
          onSubmitEditing={aoCadastrar}
        />
        <Texto variante="pequeno" cor="textoFraco">
          Seus dados são usados só para encontrar e acompanhar os direitos da sua família, conforme
          a LGPD.
        </Texto>
        <Botao titulo="Criar conta" aoTocar={aoCadastrar} carregando={enviando} />
      </View>
    </Tela>
  );
}

const e = StyleSheet.create({
  formulario: { gap: espaco.lg },
});
