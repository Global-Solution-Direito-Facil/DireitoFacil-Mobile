/** HOOKS DA CONTA (API Java): ver a conta e trocar a senha. */

import { useMutation, useQuery } from '@tanstack/react-query';

import { minhaConta, trocarSenha } from '../services/authService';

export function useTrocarSenha() {
  return useMutation({
    mutationFn: (params: { senhaAtual: string; novaSenha: string }) =>
      trocarSenha(params.senhaAtual, params.novaSenha),
  });
}

/** A conta de quem esta logado: CPF e data de cadastro, para o perfil. */
export function useMinhaConta() {
  return useQuery({ queryKey: ['conta', 'me'], queryFn: minhaConta });
}
