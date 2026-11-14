/** HOOKS DA RECEITA: enviar a foto e ler, depois consultar a Farmacia Popular. */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { enviarDocumento } from '../services/documentosService';
import { consultarFarmaciaPopular, extrairReceita } from '../services/receitaService';
import { ArquivoLocal } from '../types/documento';
import { RemedioConferido } from '../types/receita';
import { chavesDocumentos } from './useDocumentos';

/** Sobe a foto como documento RECEITA (API .NET) e pede a leitura (API Java). */
export function useLerReceita() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: async (params: { arquivo: ArquivoLocal; pessoaId: number; chave: string }) => {
      const documento = await enviarDocumento(
        // A tela so chega aqui com o consentimento marcado.
        {
          tipo: 'RECEITA',
          pessoaId: params.pessoaId,
          arquivo: params.arquivo,
          consentimentoSaude: true,
        },
        params.chave,
      );
      return extrairReceita(documento.id);
    },
    onSuccess: () => cliente.invalidateQueries({ queryKey: chavesDocumentos.lista }),
  });
}

export function useConsultarFarmaciaPopular() {
  return useMutation({
    mutationFn: (params: { pessoaId: number; remedios: RemedioConferido[] }) =>
      consultarFarmaciaPopular(params.pessoaId, params.remedios),
  });
}
