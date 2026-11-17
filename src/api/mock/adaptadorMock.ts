/**
 * ---------------------------------------------------------------------------
 * ADAPTADOR DE DEMONSTRACAO DO AXIOS
 * ---------------------------------------------------------------------------
 * O adaptador e a peca do Axios que de fato faz a requisicao. Trocando so
 * ele, o app inteiro roda sem backend e SEM saber disso: o token vai no
 * header pelo interceptor, o 401 derruba a sessao, os erros passam pelo
 * mesmo `traduzirErro`.
 *
 * Imita as regras das APIs Java e .NET: papeis, 401/403/404/409/413/415,
 * Idempotency-Key e limite de 10 MB. Os dados ficam so em memoria e voltam
 * ao estado inicial quando o app reinicia.
 * ---------------------------------------------------------------------------
 */

import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { config } from '../../config/env';
import { criarJwtDemonstracao, lerJwt } from '../../lib/jwt';
import type { DocumentoApi, EnvioApi } from '../../types/documento';
import type { Pessoa } from '../../types/pessoa';
import type { ReceitaApi, ReceitaItemApi, ResultadoFarmacia } from '../../types/receita';
import * as dados from './dados';
import type { UsuarioMock } from './dados';

const copiar = <T>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

/** O "banco" em memoria. */
const db = {
  usuarios: copiar(dados.usuarios),
  pessoas: copiar(dados.pessoas),
  laudos: copiar(dados.laudos),
  casos: copiar(dados.casos),
  documentos: copiar(dados.documentos),
  envios: copiar(dados.envios),
  idempotencia: new Map<string, { status: number; data: unknown }>(),
  receitas: [] as ReceitaApi[],
  sequencia: 1000,
};

const LIMITE_ARQUIVO = 10 * 1024 * 1024;
const TIPOS_ACEITOS = ['application/pdf', 'image/jpeg', 'image/png'];

class ErroHttp extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    public readonly campos?: Record<string, string>,
  ) {
    super(mensagem);
  }
}

type Contexto = {
  params: string[];
  corpo: Record<string, unknown>;
  query: Record<string, string>;
  chave: string | null;
  usuario: () => UsuarioMock;
};

type Resultado = { status?: number; data?: unknown };

type Rota = {
  api: 'java' | 'dotnet';
  metodo: string;
  padrao: RegExp;
  tratar: (ctx: Contexto) => Resultado | Promise<Resultado>;
};

// ---- Regras de acesso ---------------------------------------------------------

function exigirGestor(u: UsuarioMock) {
  if (u.papel !== 'GESTOR') throw new ErroHttp(403, 'Você não tem permissão para isso.');
}

function pessoaVisivel(u: UsuarioMock, id: number) {
  const pessoa = db.pessoas.find((p) => p.id === id);
  if (!pessoa) throw new ErroHttp(404, 'Pessoa não encontrada.');
  if (u.papel !== 'GESTOR' && pessoa.responsavel.id !== u.id) {
    throw new ErroHttp(403, 'Você não tem permissão para isso.');
  }
  return pessoa;
}

/** UsuarioResponse do Java (GET /usuarios/me). */
function contaApi(u: UsuarioMock) {
  return {
    id: u.id,
    nome: u.nome,
    cpf: u.cpf,
    email: u.email,
    perfil: u.papel,
    dataCadastro: '2026-11-01T10:00:00',
  };
}

function receitaVisivel(u: UsuarioMock, id: number): ReceitaApi {
  const receita = db.receitas.find((r) => r.id === id);
  if (!receita) throw new ErroHttp(404, 'Receita não encontrada.');
  pessoaVisivel(u, receita.pessoa.id);
  return receita;
}

function idsDasPessoas(u: UsuarioMock) {
  return db.pessoas.filter((p) => p.responsavel.id === u.id).map((p) => p.id);
}

/** Os nomes do enum TipoDocumento na .NET (o formulario de upload usa estes). */
const TIPOS_DOCUMENTO = [
  'Laudo',
  'Receita',
  'Rg',
  'Cpf',
  'ComprovanteRenda',
  'ComprovanteResidencia',
  'Outro',
];

/** PagedResponse da .NET: page comeca em 1 e pageSize vai de 1 a 100. */
function paginar<T>(lista: T[], query: Record<string, unknown>) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  if (!(page >= 1) || !(pageSize >= 1 && pageSize <= 100)) {
    throw new ErroHttp(400, 'Paginação inválida.');
  }
  const inicio = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    totalItems: lista.length,
    totalPages: Math.ceil(lista.length / pageSize),
    items: lista.slice(inicio, inicio + pageSize),
  };
}

/** A .NET recusa com 400 POST sem Idempotency-Key ou com chave que nao e GUID. */
function exigirChave(chave: string | null) {
  const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!chave || !guid.test(chave)) {
    throw new ErroHttp(400, 'Idempotency-Key ausente ou inválida.');
  }
}

/** O dono ve o proprio documento; o gestor ve os documentos dos envios que analisa. */
function documentoVisivel(u: UsuarioMock, id: string): DocumentoApi {
  const doc = db.documentos.find((d) => d.id === id);
  if (!doc || (u.papel !== 'GESTOR' && doc.cidadaoId !== u.email)) {
    throw new ErroHttp(404, 'Documento não encontrado.');
  }
  return doc;
}

/** documentoIds: de 1 a 20, todos do proprio cidadao. */
function validarDocumentos(u: UsuarioMock, valor: unknown): string[] {
  const ids = Array.isArray(valor) ? valor.map(String) : [];
  if (ids.length < 1 || ids.length > 20) {
    throw new ErroHttp(400, 'Escolha de 1 a 20 documentos.', { documentoIds: 'De 1 a 20.' });
  }
  for (const id of ids) {
    if (!db.documentos.some((d) => d.id === id && d.cidadaoId === u.email)) {
      throw new ErroHttp(404, 'Documento não encontrado.');
    }
  }
  return ids;
}

function envioVisivel(u: UsuarioMock, id: string): EnvioApi {
  const envio = db.envios.find((e) => e.id === id);
  if (!envio) throw new ErroHttp(404, 'Envio não encontrado.');
  if (u.papel !== 'GESTOR' && envio.cidadaoId !== u.email) {
    throw new ErroHttp(403, 'Você não tem permissão para isso.');
  }
  return envio;
}

// ---- Farmacia Popular (mesma regra de PKG_FARMACIA_POPULAR.P_AVALIAR) -------

/** Minusculas, sem acento, sem espacos repetidos; virgula e ponto valem igual na dosagem. */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizarDosagem(texto: string): string {
  return normalizar(texto).replace(/\s/g, '').replace(/\./g, ',');
}

/**
 * O principio digitado precisa estar contido no nome do elenco ("metformina"
 * acha "cloridrato de metformina"). Achou o principio com outra dosagem:
 * DOSAGEM_DIVERGENTE. A tabela decide; nada aqui sugere trocar de remedio.
 */
function avaliarNoElenco(principio: string, concentracao: string): ResultadoFarmacia {
  const p = normalizar(principio);
  const c = normalizarDosagem(concentracao);
  if (p.length < 4) return 'NAO_ENCONTRADO';
  const doPrincipio = dados.elencoFarmaciaPopular.filter((m) =>
    normalizar(m.principioAtivo).includes(p),
  );
  if (doPrincipio.length === 0) return 'NAO_ENCONTRADO';
  return doPrincipio.some((m) => normalizarDosagem(m.concentracao) === c)
    ? 'GRATUITO'
    : 'DOSAGEM_DIVERGENTE';
}

const ORIENTACAO_FARMACIA: Record<ResultadoFarmacia, string> = {
  GRATUITO:
    'Gratuito no Farmácia Popular. Leve a receita válida e um documento oficial com foto e CPF a uma farmácia credenciada (selo "Aqui tem Farmácia Popular").',
  DOSAGEM_DIVERGENTE:
    'O princípio ativo está no elenco, mas a dosagem da receita não. Confirme na farmácia credenciada. Não troque o remédio por conta própria.',
  NAO_ENCONTRADO:
    'Não consta no elenco gratuito do Farmácia Popular. Pergunte na farmácia ou na unidade de saúde.',
};

/** Salario minimo usado pela carga do banco (2026). */
const SALARIO_MINIMO = 1621;

/** "Nao sei" chega como null e continua null: nunca vira zero. */
function lerRendaIndividual(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  return Number(valor);
}

function validarRendaIndividual(rendaIndividual: number | null, rendaFamiliar: number) {
  if (rendaIndividual !== null && rendaIndividual > rendaFamiliar) {
    throw new ErroHttp(400, 'A renda da pessoa não pode ser maior que a renda da família.', {
      rendaIndividual: 'Maior que a renda da família.',
    });
  }
}

/**
 * Regra do passe do idoso (Lei 10.741/2003, art. 40), como no banco: 60+ com
 * renda INDIVIDUAL de ate 2 salarios minimos. Renda nao informada fica
 * POSSIVEL (o V6 do banco vai tratar assim). Acima do limite, o caso sai.
 */
function reavaliarPasseIdoso(pessoa: Pessoa) {
  const CODIGO = 'PASSE_IDOSO_INTERESTADUAL';
  if (pessoa.idade < 60) return;
  const existente = db.casos.find((c) => c.pessoa.id === pessoa.id && c.direito.codigo === CODIGO);

  let resultado: 'ELEGIVEL' | 'POSSIVEL' | null;
  let motivo: string;
  if (pessoa.rendaIndividual === null) {
    resultado = 'POSSIVEL';
    motivo = 'Renda individual nao informada; informe a renda para confirmar o passe do idoso';
  } else {
    const emSalarios = pessoa.rendaIndividual / SALARIO_MINIMO;
    resultado = emSalarios <= 2 ? 'ELEGIVEL' : null;
    motivo = `Renda individual ${emSalarios.toFixed(4)} SM ${resultado ? 'dentro do' : 'acima do'} limite de 2.0000 SM`;
  }

  if (!resultado) {
    db.casos = db.casos.filter((c) => c !== existente);
    return;
  }
  if (existente) {
    existente.resultadoAvaliacao = resultado;
    existente.motivo = motivo;
    existente.dataAtualizacao = new Date().toISOString();
    return;
  }
  const hoje = new Date().toISOString().slice(0, 10);
  db.casos.push(
    dados.montarCaso(
      ++db.sequencia,
      { id: pessoa.id, nome: pessoa.nome },
      CODIGO,
      'ABERTO',
      resultado,
      motivo,
      hoje,
      hoje,
    ),
  );
}

function pagina<T>(lista: T[]) {
  return {
    content: lista,
    page: 0,
    size: lista.length,
    totalElements: lista.length,
    totalPages: 1,
    first: true,
    last: true,
  };
}

function respostaLogin(u: UsuarioMock) {
  const expira = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return {
    token: criarJwtDemonstracao({
      sub: u.email,
      role: u.papel,
      nome: u.nome,
      exp: Math.floor(expira.getTime() / 1000),
    }),
    tipo: 'Bearer',
    expiraEm: expira.toISOString(),
    role: u.papel,
    usuarioId: u.id,
  };
}

/** Reenvio com a mesma chave devolve a mesma resposta, sem duplicar. */
function comIdempotencia(
  escopo: string,
  chave: string | null,
  executar: () => Resultado,
): Resultado {
  if (!chave) return executar();
  const id = `${escopo}:${chave}`;
  const anterior = db.idempotencia.get(id);
  if (anterior) return anterior;
  const resultado = executar();
  db.idempotencia.set(id, { status: resultado.status ?? 200, data: resultado.data });
  return resultado;
}

// ---- Rotas --------------------------------------------------------------------

const rotas: Rota[] = [
  // Autenticacao (Java)
  {
    api: 'java',
    metodo: 'POST',
    padrao: /^\/auth\/login$/,
    tratar: ({ corpo }) => {
      const email = String(corpo.email ?? '')
        .trim()
        .toLowerCase();
      const u = db.usuarios.find((x) => x.email === email);
      if (!u || u.senha !== corpo.senha) throw new ErroHttp(401, 'E-mail ou senha incorretos.');
      return { data: respostaLogin(u) };
    },
  },
  {
    api: 'java',
    metodo: 'POST',
    padrao: /^\/auth\/registrar$/,
    tratar: ({ corpo }) => {
      const email = String(corpo.email ?? '')
        .trim()
        .toLowerCase();
      const cpf = String(corpo.cpf ?? '');
      if (db.usuarios.some((x) => x.email === email)) {
        throw new ErroHttp(409, 'Já existe uma conta com esse e-mail.', {
          email: 'E-mail já cadastrado.',
        });
      }
      if (db.usuarios.some((x) => x.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''))) {
        throw new ErroHttp(409, 'Já existe uma conta com esse CPF.', { cpf: 'CPF já cadastrado.' });
      }
      const u: UsuarioMock = {
        id: ++db.sequencia,
        nome: String(corpo.nome ?? '').trim(),
        cpf,
        email,
        senha: String(corpo.senha ?? ''),
        papel: 'CIDADAO',
      };
      db.usuarios.push(u);
      return { status: 201, data: respostaLogin(u) };
    },
  },

  {
    api: 'java',
    metodo: 'PATCH',
    padrao: /^\/auth\/senha$/,
    tratar: ({ usuario, corpo }) => {
      const u = usuario();
      const novaSenha = String(corpo.novaSenha ?? '');
      if (novaSenha.length < 8) {
        throw new ErroHttp(400, 'A senha nova precisa de pelo menos 8 caracteres.', {
          novaSenha: 'Pelo menos 8 caracteres.',
        });
      }
      if (corpo.senhaAtual !== u.senha) {
        throw new ErroHttp(422, 'A senha atual não confere.', { senhaAtual: 'Senha incorreta.' });
      }
      u.senha = novaSenha;
      return { status: 204 };
    },
  },
  {
    api: 'java',
    metodo: 'GET',
    padrao: /^\/usuarios\/me$/,
    tratar: ({ usuario }) => ({ data: contaApi(usuario()) }),
  },

  // Pessoas (Java)
  {
    api: 'java',
    metodo: 'GET',
    padrao: /^\/pessoas$/,
    tratar: ({ usuario }) => {
      const u = usuario();
      return { data: pagina(db.pessoas.filter((p) => p.responsavel.id === u.id)) };
    },
  },
  {
    api: 'java',
    metodo: 'GET',
    padrao: /^\/pessoas\/(\d+)$/,
    tratar: ({ usuario, params }) => ({ data: pessoaVisivel(usuario(), Number(params[0])) }),
  },
  {
    api: 'java',
    metodo: 'POST',
    padrao: /^\/pessoas$/,
    tratar: ({ usuario, corpo }) => {
      const u = usuario();
      const rendaIndividual = lerRendaIndividual(corpo.rendaIndividual);
      validarRendaIndividual(rendaIndividual, Number(corpo.rendaFamiliar));
      const pessoa = dados.montarPessoa(
        ++db.sequencia,
        u,
        String(corpo.nome).trim(),
        String(corpo.dataNascimento),
        Number(corpo.rendaFamiliar),
        Number(corpo.qtdMembrosFamilia),
        rendaIndividual,
        new Date().toISOString(),
      );
      db.pessoas.push(pessoa);
      reavaliarPasseIdoso(pessoa);
      return { status: 201, data: pessoa };
    },
  },
  {
    api: 'java',
    metodo: 'PUT',
    padrao: /^\/pessoas\/(\d+)$/,
    tratar: ({ usuario, params, corpo }) => {
      const atual = pessoaVisivel(usuario(), Number(params[0]));
      const responsavel = db.usuarios.find((x) => x.id === atual.responsavel.id)!;
      const rendaIndividual = lerRendaIndividual(corpo.rendaIndividual);
      validarRendaIndividual(rendaIndividual, Number(corpo.rendaFamiliar));
      const atualizada = dados.montarPessoa(
        atual.id,
        responsavel,
        String(corpo.nome).trim(),
        String(corpo.dataNascimento),
        Number(corpo.rendaFamiliar),
        Number(corpo.qtdMembrosFamilia),
        rendaIndividual,
        atual.dataCadastro,
      );
      db.pessoas = db.pessoas.map((p) => (p.id === atual.id ? atualizada : p));
      db.casos = db.casos.map((c) =>
        c.pessoa.id === atual.id ? { ...c, pessoa: { id: atual.id, nome: atualizada.nome } } : c,
      );
      reavaliarPasseIdoso(atualizada);
      return { data: atualizada };
    },
  },
  {
    api: 'java',
    metodo: 'DELETE',
    padrao: /^\/pessoas\/(\d+)$/,
    tratar: ({ usuario, params }) => {
      const pessoa = pessoaVisivel(usuario(), Number(params[0]));
      db.pessoas = db.pessoas.filter((p) => p.id !== pessoa.id);
      db.casos = db.casos.filter((c) => c.pessoa.id !== pessoa.id);
      db.laudos = db.laudos.filter((l) => l.pessoa.id !== pessoa.id);
      return { status: 204 };
    },
  },

  // Laudos, direitos e casos (Java)
  {
    api: 'java',
    metodo: 'GET',
    // Como no Java: os laudos ficam embaixo da pessoa e vem como lista simples.
    padrao: /^\/pessoas\/(\d+)\/laudos$/,
    tratar: ({ usuario, params }) => {
      const pessoa = pessoaVisivel(usuario(), Number(params[0]));
      return { data: db.laudos.filter((l) => l.pessoa.id === pessoa.id) };
    },
  },
  {
    api: 'java',
    metodo: 'GET',
    padrao: /^\/direitos$/,
    tratar: () => ({ data: pagina(dados.direitos) }),
  },
  {
    api: 'java',
    metodo: 'GET',
    padrao: /^\/casos$/,
    tratar: ({ usuario, query }) => {
      const u = usuario();
      const meus = idsDasPessoas(u);
      let lista =
        u.papel === 'GESTOR' ? db.casos : db.casos.filter((c) => meus.includes(c.pessoa.id));
      if (query.pessoaId) lista = lista.filter((c) => c.pessoa.id === Number(query.pessoaId));
      return { data: pagina(lista) };
    },
  },
  {
    api: 'java',
    metodo: 'GET',
    padrao: /^\/casos\/(\d+)$/,
    tratar: ({ usuario, params }) => {
      const caso = db.casos.find((c) => c.id === Number(params[0]));
      if (!caso) throw new ErroHttp(404, 'Caso não encontrado.');
      pessoaVisivel(usuario(), caso.pessoa.id);
      return { data: caso };
    },
  },

  // Receita (Java)
  {
    api: 'java',
    metodo: 'POST',
    padrao: /^\/receitas\/extracao$/,
    tratar: ({ usuario, corpo }) => {
      usuario();
      if (!corpo.documentoId) throw new ErroHttp(400, 'Envie a foto da receita primeiro.');
      return { data: dados.receitaLida };
    },
  },
  {
    api: 'java',
    metodo: 'POST',
    padrao: /^\/receitas$/,
    tratar: ({ usuario, corpo }) => {
      const u = usuario();
      if (!corpo.pessoaId) {
        throw new ErroHttp(400, 'Informe de quem é a receita.', { pessoaId: 'Obrigatório.' });
      }
      const pessoa = pessoaVisivel(u, Number(corpo.pessoaId));
      const receita: ReceitaApi = {
        id: ++db.sequencia,
        pessoa: { id: pessoa.id, nome: pessoa.nome },
        documentoId: corpo.documentoId ? Number(corpo.documentoId) : null,
        dataRegistro: new Date().toISOString(),
        totalItens: 0,
        totalGratuitos: 0,
        itens: [],
      };
      db.receitas.push(receita);
      return { status: 201, data: receita };
    },
  },
  {
    api: 'java',
    metodo: 'POST',
    padrao: /^\/receitas\/(\d+)\/itens$/,
    tratar: ({ usuario, params, corpo }) => {
      const receita = receitaVisivel(usuario(), Number(params[0]));
      const nomeLido = String(corpo.nomeLido ?? '').trim();
      const principioAtivo = String(corpo.principioAtivo ?? '').trim();
      if (!nomeLido || !principioAtivo) {
        throw new ErroHttp(400, 'Preencha o nome e o princípio ativo.', {
          ...(nomeLido ? {} : { nomeLido: 'Obrigatório.' }),
          ...(principioAtivo ? {} : { principioAtivo: 'Obrigatório.' }),
        });
      }
      const concentracao = corpo.concentracao ? String(corpo.concentracao) : null;
      const resultado = avaliarNoElenco(principioAtivo, concentracao ?? '');
      const item: ReceitaItemApi = {
        id: ++db.sequencia,
        nomeLido,
        principioAtivo,
        concentracao,
        corrigido: corpo.corrigido === true,
        resultado,
        medicamento: null,
        orientacao: ORIENTACAO_FARMACIA[resultado],
      };
      receita.itens.push(item);
      receita.totalItens = receita.itens.length;
      receita.totalGratuitos = receita.itens.filter((i) => i.resultado === 'GRATUITO').length;
      return { status: 201, data: item };
    },
  },
  {
    api: 'java',
    metodo: 'GET',
    padrao: /^\/receitas\/(\d+)$/,
    tratar: ({ usuario, params }) => ({ data: receitaVisivel(usuario(), Number(params[0])) }),
  },

  // Documentos (.NET)
  {
    api: 'dotnet',
    metodo: 'GET',
    padrao: /^\/documentos$/,
    tratar: ({ usuario, query }) => {
      const u = usuario();
      return {
        data: paginar(
          db.documentos.filter((d) => d.cidadaoId === u.email),
          query,
        ),
      };
    },
  },
  {
    api: 'dotnet',
    metodo: 'GET',
    padrao: /^\/documentos\/([\w-]+)$/,
    tratar: ({ usuario, params }) => ({ data: documentoVisivel(usuario(), params[0]!) }),
  },
  {
    api: 'dotnet',
    metodo: 'POST',
    padrao: /^\/documentos$/,
    tratar: ({ usuario, corpo, chave }) => {
      const u = usuario();
      exigirChave(chave);
      const arquivo = corpo.arquivo as
        { name?: string; type?: string; tamanhoBytes?: number } | undefined;
      if (!arquivo) throw new ErroHttp(400, 'Envie um arquivo.');
      const tipo = String(corpo.tipo ?? '');
      if (!TIPOS_DOCUMENTO.includes(tipo)) {
        throw new ErroHttp(400, 'Tipo de documento inválido.', { tipo: 'Valor não aceito.' });
      }
      if (!TIPOS_ACEITOS.includes(arquivo.type ?? '')) {
        throw new ErroHttp(415, 'Formato de arquivo não aceito. Use PDF, JPG ou PNG.');
      }
      if ((arquivo.tamanhoBytes ?? 0) > LIMITE_ARQUIVO) {
        throw new ErroHttp(413, 'O arquivo é grande demais. O limite é 10 MB.');
      }
      const consentimento = String(corpo.consentimentoSaude) === 'true';
      if ((tipo === 'Laudo' || tipo === 'Receita') && !consentimento) {
        throw new ErroHttp(422, 'Para laudo e receita é preciso aceitar o uso de dados de saúde.');
      }
      return comIdempotencia(`doc:${u.email}`, chave, () => {
        const agora = new Date().toISOString();
        const novo: DocumentoApi = {
          id: `doc-${++db.sequencia}`,
          cidadaoId: u.email,
          tipo,
          descricao: corpo.descricao ? String(corpo.descricao) : null,
          nomeArquivo: arquivo.name ?? 'documento.jpg',
          contentType: arquivo.type ?? 'image/jpeg',
          tamanhoArquivo: arquivo.tamanhoBytes ?? 0,
          status: 'Recebido',
          consentimentoSaude: consentimento,
          consentimentoSaudeEm: consentimento ? agora : null,
          criadoEm: agora,
          atualizadoEm: null,
        };
        db.documentos.unshift(novo);
        return { status: 201, data: novo };
      });
    },
  },
  {
    api: 'dotnet',
    metodo: 'DELETE',
    padrao: /^\/documentos\/([\w-]+)$/,
    tratar: ({ usuario, params }) => {
      const u = usuario();
      const indice = db.documentos.findIndex((d) => d.id === params[0] && d.cidadaoId === u.email);
      if (indice < 0) throw new ErroHttp(404, 'Documento não encontrado.');
      const emAnalise = db.envios.some(
        (e) => e.status === 'Enviado' && e.documentoIds.includes(params[0]!),
      );
      if (emAnalise) {
        throw new ErroHttp(
          409,
          'Esse documento está num envio em análise e não pode ser apagado agora.',
        );
      }
      db.documentos.splice(indice, 1);
      return { status: 204 };
    },
  },

  // Envios (.NET)
  {
    api: 'dotnet',
    metodo: 'GET',
    padrao: /^\/envios$/,
    tratar: ({ usuario, query }) => {
      const u = usuario();
      // O gestor ve a fila de todos; o cidadao, so os seus.
      const visiveis =
        u.papel === 'GESTOR' ? db.envios : db.envios.filter((e) => e.cidadaoId === u.email);
      const status = query.status ? String(query.status).toUpperCase() : null;
      const filtrados = status
        ? visiveis.filter((e) => e.status.toUpperCase() === status)
        : visiveis;
      return { data: paginar(filtrados, query) };
    },
  },
  {
    api: 'dotnet',
    metodo: 'GET',
    padrao: /^\/envios\/([\w-]+)$/,
    tratar: ({ usuario, params }) => ({ data: envioVisivel(usuario(), params[0]!) }),
  },
  {
    api: 'dotnet',
    metodo: 'POST',
    padrao: /^\/envios$/,
    tratar: ({ usuario, corpo, chave }) => {
      const u = usuario();
      exigirChave(chave);
      const casoId = Number(corpo.casoId);
      const direitoCodigo = String(corpo.direitoCodigo ?? '').trim();
      const ids = validarDocumentos(u, corpo.documentoIds);
      if (!casoId || !direitoCodigo) {
        throw new ErroHttp(400, 'Informe o caso e o direito do envio.', {
          ...(casoId ? {} : { casoId: 'Obrigatório.' }),
          ...(direitoCodigo ? {} : { direitoCodigo: 'Obrigatório.' }),
        });
      }
      return comIdempotencia(`envio-novo:${u.email}`, chave, () => {
        const envio: EnvioApi = {
          id: `env-${++db.sequencia}`,
          cidadaoId: u.email,
          casoId,
          direitoCodigo,
          status: 'Rascunho',
          observacao: null,
          gestorId: null,
          enviadoEm: null,
          analisadoEm: null,
          criadoEm: new Date().toISOString(),
          documentoIds: ids,
        };
        db.envios.unshift(envio);
        return { status: 201, data: envio };
      });
    },
  },
  {
    api: 'dotnet',
    metodo: 'PUT',
    padrao: /^\/envios\/([\w-]+)$/,
    tratar: ({ usuario, params, corpo }) => {
      const u = usuario();
      const envio = envioVisivel(u, params[0]!);
      if (envio.status !== 'Rascunho' && envio.status !== 'Devolvido') {
        throw new ErroHttp(409, 'Só dá para mudar os documentos antes de enviar.');
      }
      envio.documentoIds = validarDocumentos(u, corpo.documentoIds);
      return { data: envio };
    },
  },
  {
    api: 'dotnet',
    metodo: 'POST',
    padrao: /^\/envios\/([\w-]+)\/submeter$/,
    tratar: ({ usuario, params, chave }) => {
      exigirChave(chave);
      const envio = envioVisivel(usuario(), params[0]!);
      return comIdempotencia(`envio:${envio.id}`, chave, () => {
        if (envio.status !== 'Rascunho' && envio.status !== 'Devolvido') {
          throw new ErroHttp(409, 'Esse envio já foi enviado.');
        }
        envio.status = 'Enviado';
        envio.observacao = null;
        envio.enviadoEm = new Date().toISOString();
        return { data: copiar(envio) };
      });
    },
  },
  {
    api: 'dotnet',
    metodo: 'POST',
    padrao: /^\/envios\/([\w-]+)\/analise$/,
    tratar: ({ usuario, params, corpo }) => {
      const u = usuario();
      exigirGestor(u);
      const envio = envioVisivel(u, params[0]!);
      if (envio.status !== 'Enviado')
        throw new ErroHttp(409, 'Esse envio não está aguardando análise.');
      const decisao = String(corpo.decisao ?? '').toUpperCase();
      if (decisao !== 'APROVAR' && decisao !== 'DEVOLVER') {
        throw new ErroHttp(400, 'Decisão inválida.', { decisao: 'Use APROVAR ou DEVOLVER.' });
      }
      const observacao = String(corpo.observacao ?? '').trim();
      if (decisao === 'DEVOLVER' && !observacao) {
        throw new ErroHttp(400, 'Explique o que a família precisa corrigir.', {
          observacao: 'Obrigatório.',
        });
      }
      envio.status = decisao === 'APROVAR' ? 'Aprovado' : 'Devolvido';
      envio.observacao = observacao || null;
      envio.gestorId = u.email;
      envio.analisadoEm = new Date().toISOString();
      return { data: envio };
    },
  },
];

// ---- O adaptador --------------------------------------------------------------

function esperar(ms: number) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

/** O FormData do React Native guarda as partes em `getParts()` (ou `_parts`). */
type ParteFormData = {
  fieldName: string;
  string?: string;
  uri?: string;
  name?: string;
  type?: string;
};

function lerCorpo(data: unknown): Record<string, unknown> {
  if (data == null) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  const form = data as { getParts?: () => ParteFormData[]; _parts?: [string, unknown][] };
  if (typeof form.getParts === 'function') {
    const corpo: Record<string, unknown> = {};
    for (const parte of form.getParts()) {
      corpo[parte.fieldName] = parte.uri ? { name: parte.name, type: parte.type } : parte.string;
    }
    return corpo;
  }
  if (Array.isArray(form._parts)) return Object.fromEntries(form._parts);
  return data as Record<string, unknown>;
}

function resposta(cfg: InternalAxiosRequestConfig, status: number, data: unknown): AxiosResponse {
  return { data, status, statusText: String(status), headers: {}, config: cfg };
}

export async function adaptadorMock(cfg: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  // Simula a rede para os indicadores de carregamento aparecerem.
  const ehUpload = cfg.data != null && typeof cfg.data !== 'string';
  await esperar(ehUpload ? 1200 : 400 + Math.random() * 350);

  // A .NET usa a URL dela mais o prefixo /api (ver API_DOTNET em client.ts).
  const apiAlvo = cfg.baseURL?.startsWith(config.urlDotnet) ? 'dotnet' : 'java';
  const metodo = (cfg.method ?? 'get').toUpperCase();
  const caminho = (cfg.url ?? '').split('?')[0] ?? '';
  const autorizacao = String(cfg.headers.get('Authorization') ?? '');
  const chave = cfg.headers.get('Idempotency-Key');

  const ctx: Contexto = {
    params: [],
    corpo: lerCorpo(cfg.data),
    query: Object.fromEntries(
      // Como o Axios real, parametro undefined/null nao vai na URL.
      Object.entries((cfg.params ?? {}) as Record<string, unknown>)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)]),
    ),
    chave: chave ? String(chave) : null,
    usuario: () => {
      const email = lerJwt(autorizacao.replace(/^Bearer /, ''))?.sub;
      const u = db.usuarios.find((x) => x.email === email);
      if (!u) throw new ErroHttp(401, 'Sua sessão expirou. Entre novamente.');
      return u;
    },
  };

  try {
    for (const rota of rotas) {
      if (rota.api !== apiAlvo || rota.metodo !== metodo) continue;
      const casamento = rota.padrao.exec(caminho);
      if (!casamento) continue;
      ctx.params = casamento.slice(1) as string[];
      const { status = 200, data = null } = await rota.tratar(ctx);
      return resposta(cfg, status, copiar(data));
    }
    throw new ErroHttp(404, 'Rota não encontrada no modo demonstração.');
  } catch (erro) {
    if (erro instanceof ErroHttp) {
      throw new AxiosError(
        erro.message,
        erro.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        cfg,
        null,
        resposta(cfg, erro.status, { mensagem: erro.message, campos: erro.campos }),
      );
    }
    throw erro;
  }
}
