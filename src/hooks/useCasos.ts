/** HOOKS DE CASOS — os direitos encontrados para a familia. */

import { useQuery } from '@tanstack/react-query';

import { buscarCaso, listarCasos } from '../services/casosService';

export const chavesCasos = {
  todos: ['casos'] as const,
  lista: (pessoaId?: number) => ['casos', 'lista', pessoaId ?? 'todas'] as const,
  detalhe: (id: number) => ['casos', 'detalhe', id] as const,
};

export function useCasos(pessoaId?: number) {
  return useQuery({
    queryKey: chavesCasos.lista(pessoaId),
    queryFn: () => listarCasos(pessoaId),
  });
}

export function useCaso(id: number) {
  return useQuery({ queryKey: chavesCasos.detalhe(id), queryFn: () => buscarCaso(id) });
}
