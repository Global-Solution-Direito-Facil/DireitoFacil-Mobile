/** HOOKS DE DOCUMENTOS (API .NET). */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { enviarDocumento, excluirDocumento, listarDocumentos } from '../services/documentosService';
import { NovoDocumento } from '../types/documento';

export const chavesDocumentos = {
  lista: ['documentos'] as const,
};

export function useDocumentos() {
  return useQuery({ queryKey: chavesDocumentos.lista, queryFn: listarDocumentos });
}

/**
 * A chave de idempotencia vem de FORA (da tela), e nao e gerada aqui dentro.
 * Se fosse gerada a cada chamada, tocar em "tentar de novo" mandaria uma chave
 * nova e o documento duplicaria — exatamente o que ela existe para evitar.
 */
export function useEnviarDocumento() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (params: { documento: NovoDocumento; chave: string }) =>
      enviarDocumento(params.documento, params.chave),
    onSuccess: () => cliente.invalidateQueries({ queryKey: chavesDocumentos.lista }),
  });
}

export function useExcluirDocumento() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => excluirDocumento(id),
    onSuccess: () => cliente.invalidateQueries({ queryKey: chavesDocumentos.lista }),
  });
}
