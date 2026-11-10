/**
 * SERVICE DE CASOS (API Java).
 *
 * Um caso e o pedido de UM direito para UMA pessoa. Quem cria os casos e o
 * backend, depois que a regra PL/SQL avalia o laudo: o app so le.
 */

import { api } from '../api/client';
import { Caso } from '../types/caso';
import { Pagina } from '../types/usuario';

export async function listarCasos(pessoaId?: number): Promise<Caso[]> {
  const resposta = await api.get<Pagina<Caso>>('/casos', {
    params: { page: 0, size: 100, pessoaId },
  });
  return resposta.data.content;
}

export async function buscarCaso(id: number): Promise<Caso> {
  const resposta = await api.get<Caso>(`/casos/${id}`);
  return resposta.data;
}
