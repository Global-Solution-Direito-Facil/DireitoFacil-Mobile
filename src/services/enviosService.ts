/**
 * ---------------------------------------------------------------------------
 * SERVICE DE ENVIOS (API .NET)
 * ---------------------------------------------------------------------------
 * Um envio e o pacote de documentos de um pedido, que o assistente social
 * analisa.  RASCUNHO -> ENVIADO -> APROVADO | DEVOLVIDO -> (corrige) -> ENVIADO
 * ---------------------------------------------------------------------------
 */

import { API_DOTNET, api } from '../api/client';
import { paraConstante } from '../lib/formatar';
import { DecisaoAnalise, Envio, StatusEnvio } from '../types/documento';
import { normalizarDocumento } from './documentosService';

function normalizarEnvio(envio: Envio): Envio {
  return {
    ...envio,
    status: paraConstante(envio.status) as StatusEnvio,
    documentos: (envio.documentos ?? []).map(normalizarDocumento),
  };
}

/** Envios do cidadao logado. */
export async function listarMeusEnvios(): Promise<Envio[]> {
  const resposta = await api.get<Envio[]>('/envios', API_DOTNET);
  return resposta.data.map(normalizarEnvio);
}

/** Fila do assistente social (papel GESTOR). */
export async function listarFila(status: StatusEnvio): Promise<Envio[]> {
  const resposta = await api.get<Envio[]>('/envios', { ...API_DOTNET, params: { status } });
  return resposta.data.map(normalizarEnvio);
}

export async function buscarEnvio(id: string): Promise<Envio> {
  const resposta = await api.get<Envio>(`/envios/${id}`, API_DOTNET);
  return normalizarEnvio(resposta.data);
}

export async function criarEnvio(codigoDireito: string, pessoaNome: string | null): Promise<Envio> {
  const resposta = await api.post<Envio>('/envios', { codigoDireito, pessoaNome }, API_DOTNET);
  return normalizarEnvio(resposta.data);
}

export async function anexarDocumentos(envioId: string, documentoIds: string[]): Promise<Envio> {
  const resposta = await api.post<Envio>(
    `/envios/${envioId}/documentos`,
    { documentoIds },
    API_DOTNET,
  );
  return normalizarEnvio(resposta.data);
}

/** Com Idempotency-Key: tocar duas vezes em "enviar" nao gera dois envios. */
export async function submeterEnvio(envioId: string, chaveIdempotencia: string): Promise<Envio> {
  const resposta = await api.post<Envio>(`/envios/${envioId}/submeter`, null, {
    ...API_DOTNET,
    headers: { 'Idempotency-Key': chaveIdempotencia },
  });
  return normalizarEnvio(resposta.data);
}

export async function decidirEnvio(
  envioId: string,
  decisao: DecisaoAnalise,
  observacao: string,
): Promise<Envio> {
  const resposta = await api.patch<Envio>(
    `/envios/${envioId}/status`,
    { decisao, observacao },
    API_DOTNET,
  );
  return normalizarEnvio(resposta.data);
}
