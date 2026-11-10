/**
 * HOOKS DE PESSOAS — estado de servidor com TanStack Query.
 *
 * Toda mutacao invalida o que mudou. Excluir um familiar muda a lista de
 * pessoas E a de casos (os casos dele somem junto).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  atualizarPessoa,
  buscarPessoa,
  criarPessoa,
  excluirPessoa,
  listarLaudos,
  listarPessoas,
} from '../services/pessoasService';
import { DadosPessoa } from '../types/pessoa';
import { chavesCasos } from './useCasos';

export const chavesPessoas = {
  todas: ['pessoas'] as const,
  lista: ['pessoas', 'lista'] as const,
  /** O id PRECISA estar na chave: senao abrir a pessoa B mostraria a A do cache. */
  detalhe: (id: number) => ['pessoas', 'detalhe', id] as const,
  laudos: (id: number) => ['pessoas', 'laudos', id] as const,
};

export function usePessoas() {
  return useQuery({ queryKey: chavesPessoas.lista, queryFn: listarPessoas });
}

/** Sem `id` (formulario de cadastro), a query nem roda. */
export function usePessoa(id: number | undefined) {
  return useQuery({
    queryKey: chavesPessoas.detalhe(id ?? 0),
    queryFn: () => buscarPessoa(id ?? 0),
    enabled: id !== undefined,
  });
}

export function useLaudos(pessoaId: number) {
  return useQuery({
    queryKey: chavesPessoas.laudos(pessoaId),
    queryFn: () => listarLaudos(pessoaId),
  });
}

export function useSalvarPessoa() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (params: { id?: number; dados: DadosPessoa }) =>
      params.id ? atualizarPessoa(params.id, params.dados) : criarPessoa(params.dados),
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: chavesPessoas.todas });
      // O nome da pessoa aparece nos casos.
      cliente.invalidateQueries({ queryKey: chavesCasos.todos });
    },
  });
}

export function useExcluirPessoa() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => excluirPessoa(id),
    onSuccess: (_, id) => {
      cliente.removeQueries({ queryKey: chavesPessoas.detalhe(id) });
      cliente.invalidateQueries({ queryKey: chavesPessoas.lista });
      cliente.invalidateQueries({ queryKey: chavesCasos.todos });
    },
  });
}
