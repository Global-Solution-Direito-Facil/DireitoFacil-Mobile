/**
 * SERVICE DA RECEITA (API Java).
 *
 * Dois passos, de proposito separados:
 *   1. extrair    a IA le a foto e devolve os remedios
 *   2. consultar  depois que a PESSOA confere, a tabela da Farmacia Popular decide
 *
 * A leitura pode errar (letra de mao, nome comercial); por isso a tela
 * obriga a conferencia entre um passo e outro, e o app avisa o banco se a
 * pessoa corrigiu alguma coisa (corrigido = S/N).
 */

import { api } from '../api/client';
import {
  Medicamento,
  RemedioConferido,
  ResultadoFarmacia,
  ResultadoMedicamento,
} from '../types/receita';

/** Formato de cada item no corpo e na resposta da API (colunas de T_DF_RECEITA_ITEM). */
type ItemApi = {
  nomeLido: string;
  nome: string;
  principioAtivo: string;
  concentracao: string;
  corrigido: 'S' | 'N';
};

type ItemResultadoApi = ItemApi & { resultado: ResultadoFarmacia; orientacao: string };

export async function extrairReceita(documentoId: string): Promise<Medicamento[]> {
  const resposta = await api.post<Medicamento[]>('/receitas/extracao', { documentoId });
  return resposta.data;
}

export async function consultarFarmaciaPopular(
  documentoId: string,
  remedios: RemedioConferido[],
): Promise<ResultadoMedicamento[]> {
  const itens: ItemApi[] = remedios.map((r) => ({
    nomeLido: r.nomeLido,
    nome: r.nome.trim(),
    principioAtivo: r.principioAtivo.trim(),
    concentracao: r.dosagem.trim(),
    corrigido: r.corrigido ? 'S' : 'N',
  }));
  const resposta = await api.post<ItemResultadoApi[]>('/receitas/consulta', {
    documentoId,
    itens,
  });
  return resposta.data.map((item) => ({
    nome: item.nome || item.nomeLido,
    principioAtivo: item.principioAtivo,
    dosagem: item.concentracao,
    corrigido: item.corrigido === 'S',
    resultado: item.resultado,
    orientacao: item.orientacao,
  }));
}
