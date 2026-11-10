/** Os codigos das APIs em linguagem simples, com a cor de cada um. */

import type { ResultadoElegibilidade, StatusCaso } from '../types/caso';
import type { StatusDocumento, StatusEnvio, TipoDocumento } from '../types/documento';
import type { TipoCondicao } from '../types/pessoa';
import type { NomeCor } from './tema';

export type Rotulo = { texto: string; cor: NomeCor; fundo: NomeCor };

export const statusCaso: Record<StatusCaso, Rotulo & { descricao: string }> = {
  ABERTO: {
    texto: 'Para começar',
    cor: 'info',
    fundo: 'infoClaro',
    descricao: 'Você tem direito. Siga o passo a passo para pedir.',
  },
  EM_ANALISE: {
    texto: 'Em análise',
    cor: 'info',
    fundo: 'infoClaro',
    descricao: 'O assistente social está conferindo os documentos.',
  },
  DOCUMENTOS_PENDENTES: {
    texto: 'Falta documento',
    cor: 'alerta',
    fundo: 'alertaClaro',
    descricao: 'Envie os documentos que faltam para seguir.',
  },
  PROTOCOLADO: {
    texto: 'Pedido feito',
    cor: 'primaria',
    fundo: 'primariaClara',
    descricao: 'O pedido foi protocolado no órgão. Agora é aguardar a resposta.',
  },
  CONCEDIDO: {
    texto: 'Concedido',
    cor: 'sucesso',
    fundo: 'sucessoClaro',
    descricao: 'O direito foi concedido.',
  },
  NEGADO: {
    texto: 'Negado',
    cor: 'perigo',
    fundo: 'perigoClaro',
    descricao: 'O pedido foi negado. Procure o CRAS para saber como recorrer.',
  },
};

export const resultadoAvaliacao: Record<ResultadoElegibilidade, Rotulo> = {
  ELEGIVEL: { texto: 'Tem direito', cor: 'sucesso', fundo: 'sucessoClaro' },
  POSSIVEL: { texto: 'Pode ter direito', cor: 'alerta', fundo: 'alertaClaro' },
  NAO_ELEGIVEL: { texto: 'Sem direito', cor: 'perigo', fundo: 'perigoClaro' },
};

export const statusEnvio: Record<StatusEnvio, Rotulo> = {
  RASCUNHO: { texto: 'Rascunho', cor: 'textoFraco', fundo: 'fundo' },
  ENVIADO: { texto: 'Aguardando análise', cor: 'info', fundo: 'infoClaro' },
  APROVADO: { texto: 'Aprovado', cor: 'sucesso', fundo: 'sucessoClaro' },
  DEVOLVIDO: { texto: 'Devolvido', cor: 'alerta', fundo: 'alertaClaro' },
  CANCELADO: { texto: 'Cancelado', cor: 'textoFraco', fundo: 'fundo' },
};

export const statusDocumento: Record<StatusDocumento, Rotulo> = {
  RECEBIDO: { texto: 'Recebido', cor: 'info', fundo: 'infoClaro' },
  PROCESSANDO: { texto: 'Lendo', cor: 'alerta', fundo: 'alertaClaro' },
  EXTRAIDO: { texto: 'Lido', cor: 'sucesso', fundo: 'sucessoClaro' },
  FALHA: { texto: 'Não deu para ler', cor: 'perigo', fundo: 'perigoClaro' },
};

export const tipoDocumento: Record<TipoDocumento, string> = {
  LAUDO: 'Laudo médico',
  RECEITA: 'Receita',
  RG: 'RG',
  CPF: 'CPF',
  COMPROVANTE_RENDA: 'Comprovante de renda',
  COMPROVANTE_RESIDENCIA: 'Comprovante de residência',
  OUTRO: 'Outro',
};

export const tipoCondicao: Record<TipoCondicao, string> = {
  TEA: 'Autismo (TEA)',
  DEF_FISICA: 'Deficiência física',
  DEF_VISUAL: 'Deficiência visual',
  DEF_AUDITIVA: 'Deficiência auditiva',
  DEF_INTELECTUAL: 'Deficiência intelectual',
  DEF_MULTIPLA: 'Deficiência múltipla',
  OUTRA: 'Outra condição',
};
