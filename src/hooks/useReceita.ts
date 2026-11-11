/** HOOKS DA RECEITA: enviar a foto e ler, depois consultar a Farmacia Popular. */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { enviarDocumento } from '../services/documentosService';
import { consultarFarmaciaPopular, extrairReceita } from '../services/receitaService';
import { ArquivoLocal } from '../types/documento';
import { RemedioConferido } from '../types/receita';
import { chavesDocumentos } from './useDocumentos';

/**
 * Sobe a foto como documento RECEITA (API .NET) e pede a leitura (API Java).
 * Devolve o id do documento junto: a consulta registra a receita ligada a ele.
 */
export function useLerReceita() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: async (params: { arquivo: ArquivoLocal; chave: string }) => {
      const documento = await enviarDocumento(
        { tipo: 'RECEITA', pessoaId: null, arquivo: params.arquivo },
        params.chave,
      );
      return { documentoId: documento.id, medicamentos: await extrairReceita(documento.id) };
    },
    onSuccess: () => cliente.invalidateQueries({ queryKey: chavesDocumentos.lista }),
  });
}

export function useConsultarFarmaciaPopular() {
  return useMutation({
    mutationFn: (params: { documentoId: string; remedios: RemedioConferido[] }) =>
      consultarFarmaciaPopular(params.documentoId, params.remedios),
  });
}
