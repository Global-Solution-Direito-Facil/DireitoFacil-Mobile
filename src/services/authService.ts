/**
 * ---------------------------------------------------------------------------
 * SERVICE DE AUTENTICACAO (API Java)
 * ---------------------------------------------------------------------------
 * Traduz "entrar" para POST /auth/login e "criar conta" para
 * POST /auth/registrar. Nao guarda token, nao mexe em estado, nao navega:
 * quem decide o que fazer com a resposta e o AuthContext.
 * ---------------------------------------------------------------------------
 */

import { api } from '../api/client';
import { Credenciais, NovoUsuario, RespostaLogin } from '../types/usuario';

export async function login(credenciais: Credenciais): Promise<RespostaLogin> {
  const resposta = await api.post<RespostaLogin>('/auth/login', credenciais);
  return resposta.data;
}

/**
 * A API devolve o MESMO formato do login: quem se cadastra ja entra.
 *
 * Erros previsiveis:
 *   409  ja existe conta com este e-mail ou CPF
 *   400  CPF invalido, senha com menos de 8 caracteres
 */
export async function registrar(dados: NovoUsuario): Promise<RespostaLogin> {
  const resposta = await api.post<RespostaLogin>('/auth/registrar', dados);
  return resposta.data;
}

/** Resposta de GET /usuarios/me (UsuarioResponse). */
export type ContaApi = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  perfil: 'CIDADAO' | 'GESTOR';
  dataCadastro: string;
};

/** A conta de quem esta logado (o id vem do token). */
export async function minhaConta(): Promise<ContaApi> {
  const resposta = await api.get<ContaApi>('/usuarios/me');
  return resposta.data;
}

/**
 * Exige a senha atual. Erros previsiveis:
 *   422  senha atual errada
 *   400  senha nova com menos de 8 caracteres
 */
export async function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  await api.patch('/auth/senha', { senhaAtual, novaSenha });
}
