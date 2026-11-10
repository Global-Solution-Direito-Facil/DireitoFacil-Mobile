/**
 * SERVICE DA RECEITA (API Java).
 *
 * Dois passos, de proposito separados:
 *   1. extrair    a IA le a foto e devolve os remedios
 *   2. consultar  depois que a PESSOA confere, a tabela da Farmacia Popular decide
 *
 * A leitura pode errar (letra de mao, nome comercial); por isso a tela
 * obriga a conferencia entre um passo e outro.
 */

import { api } from '../api/client';
import { Medicamento, ResultadoMedicamento } from '../types/receita';

export async function extrairReceita(documentoId: string): Promise<Medicamento[]> {
  const resposta = await api.post<Medicamento[]>('/receitas/extracao', { documentoId });
  return resposta.data;
}

export async function consultarFarmaciaPopular(
  medicamentos: Medicamento[],
): Promise<ResultadoMedicamento[]> {
  const resposta = await api.post<ResultadoMedicamento[]>('/receitas/consulta', { medicamentos });
  return resposta.data;
}
