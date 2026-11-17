/**
 * Trocar senha (PATCH /auth/senha no Java). A API exige a senha atual e
 * responde 422 quando ela esta errada: o erro aparece embaixo desse campo.
 */
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { Tela } from '../components/Tela';
import { useSnackbar } from '../contexts/SnackbarContext';
import { ehAppError, mensagemDoErro } from '../errors/AppError';
import { useTrocarSenha } from '../hooks/useConta';
import { espaco } from '../lib/tema';
import {
  temErros,
  validar,
  validarConfirmacao,
  validarNovaSenha,
  validarSenhaLogin,
} from '../lib/validacao';

type Campo = 'atual' | 'nova' | 'confirmacao';

export function TrocarSenhaScreen() {
  const { mostrar } = useSnackbar();
  const navigation = useNavigation();
  const troca = useTrocarSenha();
  const [form, setForm] = useState<Record<Campo, string>>({ atual: '', nova: '', confirmacao: '' });
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const mudar = (campo: Campo) => (valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  async function aoSalvar() {
    const encontrados = validar<Campo>({
      atual: () => validarSenhaLogin(form.atual),
      nova: () =>
        validarNovaSenha(form.nova) ??
        (form.nova === form.atual ? 'A senha nova precisa ser diferente da atual.' : null),
      confirmacao: () => validarConfirmacao(form.nova, form.confirmacao),
    });
    setErros(encontrados);
    setErroGeral(null);
    if (temErros(encontrados)) return;

    try {
      await troca.mutateAsync({ senhaAtual: form.atual, novaSenha: form.nova });
      mostrar('Senha trocada. Use a nova no próximo login.');
      navigation.goBack();
    } catch (falha) {
      if (ehAppError(falha) && falha.status === 422) {
        setErros({ atual: 'A senha atual não confere.' });
      } else {
        if (ehAppError(falha) && falha.campos.novaSenha) setErros({ nova: falha.campos.novaSenha });
        setErroGeral(mensagemDoErro(falha));
      }
    }
  }

  return (
    <Tela rodape={<Botao titulo="Trocar senha" aoTocar={aoSalvar} carregando={troca.isPending} />}>
      {erroGeral ? <Aviso tipo="perigo" texto={erroGeral} /> : null}
      <View style={e.formulario}>
        <CampoTexto
          rotulo="Senha atual"
          value={form.atual}
          onChangeText={mudar('atual')}
          erro={erros.atual}
          senha
          autoComplete="current-password"
          textContentType="password"
        />
        <CampoTexto
          rotulo="Senha nova"
          dica="Pelo menos 8 caracteres, com letras e números."
          value={form.nova}
          onChangeText={mudar('nova')}
          erro={erros.nova}
          senha
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <CampoTexto
          rotulo="Confirme a senha nova"
          value={form.confirmacao}
          onChangeText={mudar('confirmacao')}
          erro={erros.confirmacao}
          senha
          returnKeyType="go"
          onSubmitEditing={aoSalvar}
        />
      </View>
    </Tela>
  );
}

const e = StyleSheet.create({
  formulario: { gap: espaco.lg },
});
