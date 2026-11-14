/**
 * ---------------------------------------------------------------------------
 * SERVICE DE DOCUMENTOS (API .NET)
 * ---------------------------------------------------------------------------
 *   listar   GET    /documentos          paginado: { page, pageSize, ..., items }
 *   buscar   GET    /documentos/{id}
 *   enviar   POST   /documentos          multipart + Idempotency-Key
 *   excluir  DELETE /documentos/{id}
 *
 * O arquivo sobe em multipart/form-data com o header Idempotency-Key: se a
 * internet cair e o app reenviar com a mesma chave, a API devolve a mesma
 * resposta e o documento nao duplica.
 *
 * Nao fixamos o Content-Type: quem gera o `boundary` do multipart e a camada
 * de rede. `undefined` tira o application/json padrao do cliente.
 * ---------------------------------------------------------------------------
 */

import { API_DOTNET, api } from '../api/client';
import { AppError } from '../errors/AppError';
import { paraConstante, paraPascal } from '../lib/formatar';
import { Documento, DocumentoApi, NovoDocumento, PaginaDotnet } from '../types/documento';

const LIMITE_BYTES = 10 * 1024 * 1024;

/** A lista de documentos de uma familia cabe numa pagina (o maximo da .NET e 100). */
export const PAGINA_DOTNET = { page: 1, pageSize: 100 };

/** DocumentoResponse da .NET -> o documento que as telas usam. */
export function paraDocumento(doc: DocumentoApi): Documento {
  return {
    id: doc.id,
    tipo: paraConstante(doc.tipo) as Documento['tipo'],
    nomeArquivo: doc.nomeArquivo,
    contentType: doc.contentType,
    tamanhoBytes: doc.tamanhoArquivo,
    status: paraConstante(doc.status) as Documento['status'],
    consentimentoSaude: doc.consentimentoSaude,
    dataEnvio: doc.criadoEm,
  };
}

export async function listarDocumentos(): Promise<Documento[]> {
  const resposta = await api.get<PaginaDotnet<DocumentoApi>>('/documentos', {
    ...API_DOTNET,
    params: PAGINA_DOTNET,
  });
  return resposta.data.items.map(paraDocumento);
}

export async function buscarDocumento(id: string): Promise<Documento> {
  const resposta = await api.get<DocumentoApi>(`/documentos/${id}`, API_DOTNET);
  return paraDocumento(resposta.data);
}

export async function enviarDocumento(
  { tipo, pessoaId, arquivo, consentimentoSaude }: NovoDocumento,
  chaveIdempotencia: string,
): Promise<Documento> {
  // Falha cedo, antes de gastar o plano de dados de quem esta enviando.
  if ((arquivo.tamanhoBytes ?? 0) > LIMITE_BYTES) {
    throw new AppError({
      tipo: 'CLIENTE',
      mensagem: 'O arquivo é grande demais. O limite é 10 MB.',
    });
  }

  // Campos do formulario da .NET: arquivo, tipo, consentimentoSaude e descricao (opcional).
  const form = new FormData();
  // A tipagem do FormData e a do navegador; no React Native o arquivo e { uri, name, type }.
  form.append('arquivo', { uri: arquivo.uri, name: arquivo.name, type: arquivo.type } as never);
  // O enum da .NET e "ComprovanteRenda": com underline o formulario nao converte.
  form.append('tipo', paraPascal(tipo));
  form.append('consentimentoSaude', String(consentimentoSaude));
  // A .NET repassa o familiar ao Java (o Pietro esta incluindo esse campo).
  if (pessoaId != null) form.append('pessoaId', String(pessoaId));

  const resposta = await api.post<DocumentoApi>('/documentos', form, {
    ...API_DOTNET,
    headers: {
      'Content-Type': undefined as unknown as string,
      'Idempotency-Key': chaveIdempotencia,
    },
    // Foto de celular e pesada: o timeout padrao derrubaria envios legitimos.
    timeout: 60000,
  });
  return paraDocumento(resposta.data);
}

export async function excluirDocumento(id: string): Promise<void> {
  await api.delete(`/documentos/${id}`, API_DOTNET);
}
