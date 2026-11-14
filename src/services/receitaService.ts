/**
 * SERVICE DA RECEITA (API Java).
 *
 *   1. extrair   POST /receitas/extracao      a IA le a foto e devolve os remedios
 *   2. registrar POST /receitas               { pessoaId } -> a receita do familiar
 *                POST /receitas/{id}/itens    um por remedio, ja conferido pela pessoa
 *                GET  /receitas/{id}          o resultado de cada item no elenco
 *
 * A leitura pode errar (letra de mao, nome comercial); por isso a tela
 * obriga a conferencia entre um passo e outro, e cada item avisa o banco
 * se a pessoa corrigiu alguma coisa (corrigido).
 *
 * O documentoId do Java e numerico e o da foto e o GUID da .NET, por isso a
 * receita e registrada so com o familiar.
 */

import { api } from '../api/client';
import { Medicamento, ReceitaApi, RemedioConferido, ResultadoMedicamento } from '../types/receita';

export async function extrairReceita(documentoId: string): Promise<Medicamento[]> {
  const resposta = await api.post<Medicamento[]>('/receitas/extracao', { documentoId });
  return resposta.data;
}

export async function consultarFarmaciaPopular(
  pessoaId: number,
  remedios: RemedioConferido[],
): Promise<ResultadoMedicamento[]> {
  const receita = await api.post<ReceitaApi>('/receitas', { pessoaId });
  const id = receita.data.id;

  // Em sequencia: a ordem dos itens e a ordem em que a pessoa conferiu.
  for (const r of remedios) {
    await api.post(`/receitas/${id}/itens`, {
      // nomeLido e obrigatorio no Java; remedio incluido a mao vai com o nome digitado.
      nomeLido: r.nomeLido || r.nome.trim() || r.principioAtivo.trim(),
      principioAtivo: r.principioAtivo.trim(),
      concentracao: r.dosagem.trim(),
      corrigido: r.corrigido,
    });
  }

  const final = await api.get<ReceitaApi>(`/receitas/${id}`);
  return final.data.itens.map((item, i) => ({
    nome: remedios[i]?.nome.trim() || item.nomeLido,
    principioAtivo: item.principioAtivo,
    dosagem: item.concentracao ?? '',
    corrigido: item.corrigido,
    resultado: item.resultado,
    orientacao: item.orientacao ?? '',
  }));
}
