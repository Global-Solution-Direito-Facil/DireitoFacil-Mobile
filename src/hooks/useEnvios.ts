/** HOOKS DE ENVIOS (API .NET) — do cidadao e da fila do assistente social. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  buscarEnvio,
  criarEnvio,
  decidirEnvio,
  listarFila,
  listarMeusEnvios,
  submeterEnvio,
  trocarDocumentos,
} from '../services/enviosService';
import { DecisaoAnalise, Envio, StatusEnvio } from '../types/documento';

export const chavesEnvios = {
  todos: ['envios'] as const,
  meus: ['envios', 'meus'] as const,
  fila: (status: StatusEnvio) => ['envios', 'fila', status] as const,
  detalhe: (id: string) => ['envios', 'detalhe', id] as const,
};

export function useMeusEnvios() {
  return useQuery({ queryKey: chavesEnvios.meus, queryFn: listarMeusEnvios });
}

export function useFila(status: StatusEnvio) {
  return useQuery({ queryKey: chavesEnvios.fila(status), queryFn: () => listarFila(status) });
}

export function useEnvio(id: string) {
  return useQuery({ queryKey: chavesEnvios.detalhe(id), queryFn: () => buscarEnvio(id) });
}

/**
 * Pedir analise: se ja existe um rascunho ou devolvido, troca os documentos
 * (PUT); senao cria o envio com caso e documentos (POST). Depois submete.
 * Cada POST leva a sua Idempotency-Key, gerada uma vez pela tela.
 */
export function usePedirAnalise() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      existente: Envio | null;
      casoId: number;
      codigoDireito: string;
      documentoIds: string[];
      chaveCriar: string;
      chaveSubmeter: string;
    }) => {
      const envio = params.existente
        ? await trocarDocumentos(params.existente.id, params.documentoIds)
        : await criarEnvio(
            params.casoId,
            params.codigoDireito,
            params.documentoIds,
            params.chaveCriar,
          );
      return submeterEnvio(envio.id, params.chaveSubmeter);
    },
    onSuccess: () => cliente.invalidateQueries({ queryKey: chavesEnvios.todos }),
  });
}

export function useDecidirEnvio() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; decisao: DecisaoAnalise; observacao: string }) =>
      decidirEnvio(params.id, params.decisao, params.observacao),
    onSuccess: () => cliente.invalidateQueries({ queryKey: chavesEnvios.todos }),
  });
}
