/**
 * ---------------------------------------------------------------------------
 * SERVICE DE ENVIOS (API .NET)
 * ---------------------------------------------------------------------------
 * Um envio e o pacote de documentos de um pedido (um caso do Java), que o
 * assistente social analisa.
 *
 *   RASCUNHO -> ENVIADO -> APROVADO | DEVOLVIDO -> (corrige) -> ENVIADO
 *
 *   listar     GET  /envios                 paginado; o gestor filtra ?status=ENVIADO
 *   buscar     GET  /envios/{id}
 *   criar      POST /envios                 { casoId, direitoCodigo, documentoIds } + Idempotency-Key
 *   trocar     PUT  /envios/{id}            { documentoIds } (so em RASCUNHO ou DEVOLVIDO)
 *   submeter   POST /envios/{id}/submeter   + Idempotency-Key
 *   analisar   POST /envios/{id}/analise    { decisao: APROVAR | DEVOLVER, observacao }
 *
 * A resposta da .NET traz so o id do caso e os ids dos documentos. Para a
 * tela do gestor, o service completa com o nome do familiar (caso no Java) e
 * o detalhe de cada documento.
 * ---------------------------------------------------------------------------
 */

import { API_DOTNET, api } from '../api/client';
import { paraConstante } from '../lib/formatar';
import {
  DecisaoAnalise,
  Documento,
  Envio,
  EnvioApi,
  PaginaDotnet,
  StatusEnvio,
} from '../types/documento';
import { buscarCaso } from './casosService';
import { PAGINA_DOTNET, buscarDocumento } from './documentosService';

/** EnvioResponse da .NET -> o envio que as telas usam. */
function paraEnvio(envio: EnvioApi): Envio {
  return {
    id: envio.id,
    casoId: envio.casoId,
    codigoDireito: envio.direitoCodigo,
    donoEmail: envio.cidadaoId,
    pessoaNome: null,
    status: paraConstante(envio.status) as StatusEnvio,
    observacao: envio.observacao,
    documentoIds: envio.documentoIds ?? [],
    documentos: [],
    dataCriacao: envio.criadoEm,
    dataEnvio: envio.enviadoEm,
  };
}

/** Nome do familiar, pelo caso no Java. Se o caso nao abrir, a tela mostra so o e-mail. */
async function comNomeDaPessoa(envio: Envio): Promise<Envio> {
  try {
    const caso = await buscarCaso(envio.casoId);
    return { ...envio, pessoaNome: caso.pessoa.nome };
  } catch {
    return envio;
  }
}

/** Envios do cidadao logado (a .NET filtra pelo dono do token). */
export async function listarMeusEnvios(): Promise<Envio[]> {
  const resposta = await api.get<PaginaDotnet<EnvioApi>>('/envios', {
    ...API_DOTNET,
    params: PAGINA_DOTNET,
  });
  return resposta.data.items.map(paraEnvio);
}

/** Fila do assistente social (papel GESTOR). */
export async function listarFila(status: StatusEnvio): Promise<Envio[]> {
  const resposta = await api.get<PaginaDotnet<EnvioApi>>('/envios', {
    ...API_DOTNET,
    params: { ...PAGINA_DOTNET, status },
  });
  return Promise.all(resposta.data.items.map((envio) => comNomeDaPessoa(paraEnvio(envio))));
}

/** Um envio completo, com o nome do familiar e o detalhe de cada documento. */
export async function buscarEnvio(id: string): Promise<Envio> {
  const resposta = await api.get<EnvioApi>(`/envios/${id}`, API_DOTNET);
  const envio = await comNomeDaPessoa(paraEnvio(resposta.data));
  const documentos = await Promise.all(
    envio.documentoIds.map((docId) => buscarDocumento(docId).catch(() => null)),
  );
  return { ...envio, documentos: documentos.filter((d): d is Documento => d !== null) };
}

/** Cria o envio ja com o caso e os documentos escolhidos. */
export async function criarEnvio(
  casoId: number,
  direitoCodigo: string,
  documentoIds: string[],
  chaveIdempotencia: string,
): Promise<Envio> {
  const resposta = await api.post<EnvioApi>(
    '/envios',
    { casoId, direitoCodigo, documentoIds },
    { ...API_DOTNET, headers: { 'Idempotency-Key': chaveIdempotencia } },
  );
  return paraEnvio(resposta.data);
}

/** Troca os documentos de um envio em RASCUNHO ou DEVOLVIDO. */
export async function trocarDocumentos(envioId: string, documentoIds: string[]): Promise<Envio> {
  const resposta = await api.put<EnvioApi>(`/envios/${envioId}`, { documentoIds }, API_DOTNET);
  return paraEnvio(resposta.data);
}

/** Com Idempotency-Key: tocar duas vezes em "enviar" nao gera dois envios. */
export async function submeterEnvio(envioId: string, chaveIdempotencia: string): Promise<Envio> {
  const resposta = await api.post<EnvioApi>(`/envios/${envioId}/submeter`, null, {
    ...API_DOTNET,
    headers: { 'Idempotency-Key': chaveIdempotencia },
  });
  return paraEnvio(resposta.data);
}

/** Decisao do assistente social. Devolver exige observacao (a .NET responde 400 sem ela). */
export async function decidirEnvio(
  envioId: string,
  decisao: DecisaoAnalise,
  observacao: string,
): Promise<Envio> {
  const resposta = await api.post<EnvioApi>(
    `/envios/${envioId}/analise`,
    { decisao, observacao },
    API_DOTNET,
  );
  return paraEnvio(resposta.data);
}
