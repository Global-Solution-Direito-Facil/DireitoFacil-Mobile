/**
 * ---------------------------------------------------------------------------
 * CLIENTE HTTP
 * ---------------------------------------------------------------------------
 * REGRA: nenhuma tela importa axios.
 *
 *   Tela  ->  Hook  ->  Service  ->  client.ts  ->  API
 *
 * O app fala com DUAS APIs, mas existe UMA instancia de Axios:
 *
 *   API Java  (padrao)  login, pessoas, laudos, direitos, casos, receitas
 *   API .NET            documentos e envios  -> o service passa `API_DOTNET`
 *
 * Os dois aceitam o MESMO token: o login acontece no Java e o .NET confia
 * nele (nos dois o `sub` e o e-mail). Por isso um interceptor so resolve.
 *
 * QUEM PODE DERRUBAR A SESSAO: so o 401 do Java, que emite o token. Um 401 da
 * .NET costuma ser configuracao de JWT diferente entre as APIs (comum durante
 * a integracao), e deslogar a pessoa a cada upload seria pior: vira so um
 * erro na tela.
 *
 * MODO DEMONSTRACAO: com EXPO_PUBLIC_DATA_SOURCE=mock, so o ADAPTADOR muda
 * (a peca do Axios que faz a requisicao de fato). Interceptors, traducao de
 * erro, services e hooks continuam exatamente iguais.
 * ---------------------------------------------------------------------------
 */

import { AxiosError, AxiosInstance, AxiosRequestConfig, create } from 'axios';

import { config } from '../config/env';
import { AppError, TipoErro } from '../errors/AppError';
import { lerSeguro } from '../storage/armazenamentoSeguro';
import { CHAVES_SEGURAS } from '../storage/chavesArmazenamento';
import { notificarSessaoExpirada } from '../storage/sessaoExpirada';
import { adaptadorMock } from './mock/adaptadorMock';

/**
 * Prefixo das rotas da API Java (controllers em @RequestMapping("/api/v1/...")).
 * O .env guarda so o endereco do servidor; o prefixo fica aqui.
 */
const PREFIXO_JAVA = '/api/v1';

export const api: AxiosInstance = create({
  baseURL: config.urlJava + PREFIXO_JAVA,

  /** Sem timeout, uma API fora do ar deixa a tela em "Carregando..." para sempre. */
  timeout: 15000,

  headers: { 'Content-Type': 'application/json' },
});

/**
 * Prefixo das rotas da API .NET: /api (Controllers, como esta no Azure). Vem
 * de EXPO_PUBLIC_DOTNET_API_PREFIX (ver config/env.ts) para trocar sem mexer
 * no codigo.
 */
export const API_DOTNET: AxiosRequestConfig = {
  baseURL: config.urlDotnet + config.prefixoDotnet,
};

function ehDaApiDotnet(requisicao: AxiosRequestConfig | undefined): boolean {
  return requisicao?.baseURL === API_DOTNET.baseURL;
}

if (config.usarMock) {
  api.defaults.adapter = adaptadorMock;
}

// ---- Request: identidade do usuario (so depois do login) -------------------
api.interceptors.request.use(async (requisicao) => {
  const token = await lerSeguro(CHAVES_SEGURAS.token);
  if (token) {
    requisicao.headers.set('Authorization', `Bearer ${token}`);
  }
  if (__DEV__) {
    console.log(`[API] -> ${requisicao.method?.toUpperCase()} ${requisicao.url}`);
  }
  return requisicao;
});

// ---- Response: 401 do Java derruba a sessao; todo erro vira AppError ------
api.interceptors.response.use(
  (resposta) => {
    if (__DEV__) console.log(`[API] <- ${resposta.status} ${resposta.config.url}`);
    return resposta;
  },
  async (erro: AxiosError) => {
    /**
     * No login (e no cadastro), 401 quer dizer "e-mail ou senha invalidos",
     * nao "sua sessao caiu".
     */
    const url = erro.config?.url ?? '';
    const ehAutenticacao = url.includes('/auth/login') || url.includes('/auth/registrar');

    if (erro.response?.status === 401 && ehDaApiDotnet(erro.config)) {
      return Promise.reject(
        new AppError({
          tipo: 'NAO_AUTORIZADO',
          mensagem: 'O serviço de documentos não aceitou o seu acesso. Tente de novo em instantes.',
          status: 401,
        }),
      );
    }
    if (erro.response?.status === 401 && !ehAutenticacao) {
      await notificarSessaoExpirada();
    }
    return Promise.reject(traduzirErro(erro));
  },
);

/**
 * Formatos de erro que as APIs podem mandar:
 *   Java (Spring)   { message } ou { mensagem, campos }
 *   .NET            ProblemDetails { title, detail, errors: { campo: [msg] } }
 */
type CorpoErro = {
  message?: string;
  mensagem?: string;
  detail?: string;
  campos?: Record<string, string>;
  errors?: Record<string, string | string[]>;
};

function camposDoErro(corpo: CorpoErro | undefined): Record<string, string> {
  const campos: Record<string, string> = { ...(corpo?.campos ?? {}) };
  for (const [campo, msg] of Object.entries(corpo?.errors ?? {})) {
    const texto = Array.isArray(msg) ? msg[0] : msg;
    if (texto) campos[campo] = texto;
  }
  return campos;
}

/**
 * A mensagem do servidor ganha da nossa (ele sabe que "ja existe conta com
 * este CPF"). A tabela abaixo e a rede de seguranca. Um 500 nunca mostra o
 * texto do servidor: pode conter detalhe interno.
 *
 * Ordem: do mais especifico para o mais geral.
 */
function traduzirErro(erro: AxiosError): AppError {
  if (erro.code === 'ECONNABORTED') {
    return new AppError({
      tipo: 'TIMEOUT',
      mensagem: 'O servidor demorou para responder. Tente novamente.',
    });
  }

  if (!erro.response) {
    return new AppError({
      tipo: 'REDE',
      mensagem: 'Sem conexão com o servidor. Verifique sua internet.',
    });
  }

  const status = erro.response.status;
  const corpo = erro.response.data as CorpoErro | undefined;
  const mensagemDaApi = corpo?.mensagem ?? corpo?.message ?? corpo?.detail;

  let tipo: TipoErro;
  let mensagemPadrao: string;

  if (status === 401) {
    tipo = 'NAO_AUTORIZADO';
    mensagemPadrao = 'Sua sessão expirou. Entre novamente.';
  } else if (status === 403) {
    tipo = 'PROIBIDO';
    mensagemPadrao = 'Você não tem permissão para isso.';
  } else if (status === 404) {
    tipo = 'NAO_ENCONTRADO';
    mensagemPadrao = 'Não encontramos o que você procura.';
  } else if (status === 409) {
    tipo = 'CONFLITO';
    mensagemPadrao = 'Esse registro já existe.';
  } else if (status === 413) {
    tipo = 'CLIENTE';
    mensagemPadrao = 'O arquivo é grande demais. O limite é 10 MB.';
  } else if (status === 429) {
    tipo = 'CLIENTE';
    mensagemPadrao = 'Muitas tentativas seguidas. Espere um pouco e tente de novo.';
  } else if (status >= 400 && status < 500) {
    tipo = 'CLIENTE';
    mensagemPadrao = 'Alguns dados não estão certos. Confira e tente de novo.';
  } else if (status >= 500) {
    tipo = 'SERVIDOR';
    mensagemPadrao = 'O servidor está com problemas. Tente mais tarde.';
  } else {
    tipo = 'DESCONHECIDO';
    mensagemPadrao = 'Algo deu errado. Tente novamente.';
  }

  const mensagem = status < 500 && mensagemDaApi ? mensagemDaApi : mensagemPadrao;
  return new AppError({ tipo, mensagem, status, campos: camposDoErro(corpo) });
}
