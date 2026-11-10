/** HOOKS DE ENVIOS (API .NET) — do cidadao e da fila do assistente social. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  anexarDocumentos,
  buscarEnvio,
  criarEnvio,
  decidirEnvio,
  listarFila,
  listarMeusEnvios,
  submeterEnvio,
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
 * Pedir analise sao TRES chamadas em sequencia: criar o envio (se ainda nao
 * existe um rascunho ou devolvido), anexar os documentos e submeter. Ficam
 * numa mutacao so porque, para quem usa, e um botao so.
 */
export function usePedirAnalise() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      existente: Envio | null;
      codigoDireito: string;
      pessoaNome: string;
      documentoIds: string[];
      chave: string;
    }) => {
      const envio = params.existente ?? (await criarEnvio(params.codigoDireito, params.pessoaNome));
      await anexarDocumentos(envio.id, params.documentoIds);
      return submeterEnvio(envio.id, params.chave);
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
