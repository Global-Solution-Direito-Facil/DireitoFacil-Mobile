/**
 * SERVICE DE PESSOAS (API Java) — o CRUD dos familiares.
 *
 *   listar    GET    /pessoas
 *   buscar    GET    /pessoas/{id}
 *   criar     POST   /pessoas
 *   atualizar PUT    /pessoas/{id}
 *   excluir   DELETE /pessoas/{id}
 */

import { api } from '../api/client';
import { DadosPessoa, Laudo, Pessoa } from '../types/pessoa';
import { Pagina } from '../types/usuario';

/** Familia cabe numa pagina so; o Spring pagina por padrao. */
const UMA_PAGINA = { page: 0, size: 50 };

export async function listarPessoas(): Promise<Pessoa[]> {
  const resposta = await api.get<Pagina<Pessoa>>('/pessoas', { params: UMA_PAGINA });
  return resposta.data.content;
}

export async function buscarPessoa(id: number): Promise<Pessoa> {
  const resposta = await api.get<Pessoa>(`/pessoas/${id}`);
  return resposta.data;
}

export async function criarPessoa(dados: DadosPessoa): Promise<Pessoa> {
  const resposta = await api.post<Pessoa>('/pessoas', dados);
  return resposta.data;
}

export async function atualizarPessoa(id: number, dados: DadosPessoa): Promise<Pessoa> {
  const resposta = await api.put<Pessoa>(`/pessoas/${id}`, dados);
  return resposta.data;
}

export async function excluirPessoa(id: number): Promise<void> {
  await api.delete(`/pessoas/${id}`);
}

/** Laudos de um familiar: GET /pessoas/{id}/laudos (lista simples, sem paginacao). */
export async function listarLaudos(pessoaId: number): Promise<Laudo[]> {
  const resposta = await api.get<Laudo[]>(`/pessoas/${pessoaId}/laudos`);
  return resposta.data;
}
