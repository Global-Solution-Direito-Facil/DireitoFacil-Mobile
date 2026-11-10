/**
 * ---------------------------------------------------------------------------
 * SERVICE DE DOCUMENTOS (API .NET)
 * ---------------------------------------------------------------------------
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
import { paraConstante } from '../lib/formatar';
import { Documento, NovoDocumento } from '../types/documento';

const LIMITE_BYTES = 10 * 1024 * 1024;

/** O .NET pode mandar enums em PascalCase ("ComprovanteRenda"); o app usa COMPROVANTE_RENDA. */
export function normalizarDocumento(doc: Documento): Documento {
  return {
    ...doc,
    tipo: paraConstante(doc.tipo) as Documento['tipo'],
    status: paraConstante(doc.status) as Documento['status'],
  };
}

export async function listarDocumentos(): Promise<Documento[]> {
  const resposta = await api.get<Documento[]>('/documentos', API_DOTNET);
  return resposta.data.map(normalizarDocumento);
}

export async function enviarDocumento(
  { tipo, pessoaId, arquivo }: NovoDocumento,
  chaveIdempotencia: string,
): Promise<Documento> {
  // Falha cedo, antes de gastar o plano de dados de quem esta enviando.
  if ((arquivo.tamanhoBytes ?? 0) > LIMITE_BYTES) {
    throw new AppError({
      tipo: 'CLIENTE',
      mensagem: 'O arquivo é grande demais. O limite é 10 MB.',
    });
  }

  const form = new FormData();
  // A tipagem do FormData e a do navegador; no React Native o arquivo e { uri, name, type }.
  form.append('arquivo', { uri: arquivo.uri, name: arquivo.name, type: arquivo.type } as never);
  form.append('tipo', tipo);
  if (pessoaId != null) form.append('pessoaId', String(pessoaId));

  const resposta = await api.post<Documento>('/documentos', form, {
    ...API_DOTNET,
    headers: {
      'Content-Type': undefined as unknown as string,
      'Idempotency-Key': chaveIdempotencia,
    },
    // Foto de celular e pesada: o timeout padrao derrubaria envios legitimos.
    timeout: 60000,
  });
  return normalizarDocumento(resposta.data);
}

export async function excluirDocumento(id: string): Promise<void> {
  await api.delete(`/documentos/${id}`, API_DOTNET);
}
