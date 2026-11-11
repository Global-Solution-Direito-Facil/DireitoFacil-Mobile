/**
 * ---------------------------------------------------------------------------
 * DADOS FICTICIOS DE DEMONSTRACAO
 * ---------------------------------------------------------------------------
 * Os mesmos da carga do banco (repositorio DireitoFacil-DB, 03_CARGA.sql).
 * Nenhuma pessoa real. Senha de todos os usuarios: Senha@123
 * ---------------------------------------------------------------------------
 */

import type { Caso, Direito, ResultadoElegibilidade, StatusCaso } from '../../types/caso';
import type { Documento, Envio } from '../../types/documento';
import type { Laudo, Pessoa } from '../../types/pessoa';
import type { Medicamento } from '../../types/receita';
import type { Papel } from '../../types/usuario';

export const SENHA_DEMO = 'Senha@123';

export type UsuarioMock = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  papel: Papel;
};

export const usuarios: UsuarioMock[] = [
  {
    id: 1,
    nome: 'Ana Almeida',
    cpf: '111.111.111-11',
    email: 'ana.almeida@email.com',
    senha: SENHA_DEMO,
    papel: 'CIDADAO',
  },
  {
    id: 2,
    nome: 'Carlos Menezes',
    cpf: '222.222.222-22',
    email: 'carlos.menezes@email.com',
    senha: SENHA_DEMO,
    papel: 'CIDADAO',
  },
  {
    id: 3,
    nome: 'Paula Souza',
    cpf: '333.333.333-33',
    email: 'paula.souza@email.com',
    senha: SENHA_DEMO,
    papel: 'CIDADAO',
  },
  {
    id: 4,
    nome: 'Marcos Teixeira',
    cpf: '444.444.444-44',
    email: 'marcos.teixeira@email.com',
    senha: SENHA_DEMO,
    papel: 'CIDADAO',
  },
  {
    id: 5,
    nome: 'Rita Barbosa',
    cpf: '555.555.555-55',
    email: 'rita.barbosa@email.com',
    senha: SENHA_DEMO,
    papel: 'CIDADAO',
  },
  {
    id: 6,
    nome: 'Rafaela Gomes',
    cpf: '666.666.666-66',
    email: 'rafaela.gomes@cras.gov.br',
    senha: SENHA_DEMO,
    papel: 'GESTOR',
  },
];

function idadeEm(dataNascimento: string): number {
  const nasc = new Date(`${dataNascimento}T12:00:00`);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade -= 1;
  return idade;
}

/** Calcula idade e renda por pessoa, como faz a API Java. */
export function montarPessoa(
  id: number,
  responsavel: UsuarioMock,
  nome: string,
  dataNascimento: string,
  rendaFamiliar: number,
  qtdMembrosFamilia: number,
  rendaIndividual: number | null,
  dataCadastro = '2026-09-01T10:00:00',
): Pessoa {
  return {
    id,
    responsavel: { id: responsavel.id, nome: responsavel.nome, email: responsavel.email },
    nome,
    dataNascimento,
    idade: idadeEm(dataNascimento),
    rendaFamiliar,
    qtdMembrosFamilia,
    rendaIndividual,
    rendaPerCapita: Math.round((rendaFamiliar / qtdMembrosFamilia) * 100) / 100,
    dataCadastro,
  };
}

function usuario(id: number): UsuarioMock {
  return usuarios.find((u) => u.id === id)!;
}

export const pessoas: Pessoa[] = [
  montarPessoa(1, usuario(1), 'Lucas Almeida', '2019-03-14', 1200, 4, 0),
  montarPessoa(2, usuario(2), 'Carlos Menezes', '1985-07-22', 6500, 2, 4500),
  montarPessoa(3, usuario(3), 'Helena Souza', '1958-01-30', 750, 2, 750),
  montarPessoa(4, usuario(4), 'Marcos Teixeira', '1991-05-10', 1500, 1, 1500),
  montarPessoa(5, usuario(5), 'Rita Barbosa', '1960-03-02', 906, 2, 906),
];

function laudo(
  id: number,
  pessoa: string,
  codCid: string,
  condicao: string,
  tipo: Laudo['tipoCondicao'],
  data: string,
): Laudo {
  return {
    id,
    pessoa: { id, nome: pessoa },
    documentoId: id,
    codCid,
    condicao,
    tipoCondicao: tipo,
    dataLaudo: data,
    dataCadastro: `${data}T09:00:00`,
  };
}

export const laudos: Laudo[] = [
  laudo(
    1,
    'Lucas Almeida',
    'F84.0',
    'Transtorno do espectro autista (autismo infantil)',
    'TEA',
    '2026-09-10',
  ),
  laudo(
    2,
    'Carlos Menezes',
    'G82.2',
    'Paraplegia, usuário de cadeira de rodas',
    'DEF_FISICA',
    '2025-06-18',
  ),
  laudo(3, 'Helena Souza', 'I10', 'Hipertensão arterial essencial', 'OUTRA', '2026-08-03'),
  laudo(
    4,
    'Marcos Teixeira',
    'F41.1',
    'Transtorno de ansiedade generalizada',
    'OUTRA',
    '2026-10-01',
  ),
  laudo(5, 'Rita Barbosa', 'M17.0', 'Gonartrose primária bilateral', 'OUTRA', '2026-07-21'),
];

/** Os 20 direitos da tabela T_DF_DIREITO, todos com a base legal conferida (VERIFICADO). */
export const direitos: Direito[] = [
  {
    id: 1,
    codigo: 'BPC_IDOSO',
    nome: 'BPC/LOAS para idoso',
    orgao: 'INSS',
    baseLegal: 'Lei 8.742/1993, art. 20',
    grupoAlvo: 'IDOSO',
    prazoDias: 45,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 2,
    codigo: 'BPC_PCD',
    nome: 'BPC/LOAS para pessoa com deficiência',
    orgao: 'INSS',
    baseLegal: 'Lei 8.742/1993, art. 20',
    grupoAlvo: 'PCD',
    prazoDias: 45,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 3,
    codigo: 'PASSE_LIVRE_PCD',
    nome: 'Passe Livre interestadual',
    orgao: 'Ministério dos Transportes',
    baseLegal: 'Lei 8.899/1994',
    grupoAlvo: 'PCD',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 4,
    codigo: 'PASSE_IDOSO_INTERESTADUAL',
    nome: 'Vagas gratuitas interestaduais para idoso',
    orgao: 'ANTT / transportadora',
    baseLegal: 'Lei 10.741/2003, art. 40',
    grupoAlvo: 'IDOSO',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 5,
    codigo: 'ISENCAO_IPI_VEICULO_PCD',
    nome: 'Isenção de IPI na compra de veículo',
    orgao: 'Receita Federal',
    baseLegal: 'Lei 8.989/1995',
    grupoAlvo: 'PCD',
    prazoDias: 60,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 6,
    codigo: 'ISENCAO_IOF_VEICULO_PCD',
    nome: 'Isenção de IOF no financiamento de veículo',
    orgao: 'Receita Federal',
    baseLegal: 'Lei 8.383/1991, art. 72',
    grupoAlvo: 'PCD',
    prazoDias: 60,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 7,
    codigo: 'CIPTEA',
    nome: 'Carteira de Identificação da Pessoa com TEA',
    orgao: 'Governo estadual ou municipal',
    baseLegal: 'Lei 13.977/2020',
    grupoAlvo: 'AUTISMO',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 8,
    codigo: 'TARIFA_SOCIAL_ENERGIA',
    nome: 'Tarifa Social de Energia',
    orgao: 'ANEEL / distribuidora',
    baseLegal: 'Lei 12.212/2010',
    grupoAlvo: 'BAIXA_RENDA',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 9,
    codigo: 'BOLSA_FAMILIA',
    nome: 'Bolsa Família',
    orgao: 'MDS / Caixa',
    baseLegal: 'Lei 14.601/2023',
    grupoAlvo: 'BAIXA_RENDA',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 10,
    codigo: 'CADUNICO',
    nome: 'Cadastro Único',
    orgao: 'CRAS municipal',
    baseLegal: 'Decreto 11.016/2022',
    grupoAlvo: 'BAIXA_RENDA',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 11,
    codigo: 'COTA_PCD_ENSINO_SUPERIOR',
    nome: 'Reserva de vagas no ensino superior federal',
    orgao: 'MEC / instituição',
    baseLegal: 'Lei 13.409/2016',
    grupoAlvo: 'PCD',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 12,
    codigo: 'COTA_PCD_CONCURSO',
    nome: 'Reserva de vagas em concurso federal',
    orgao: 'Órgão / banca',
    baseLegal: 'Decreto 9.508/2018',
    grupoAlvo: 'PCD',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 13,
    codigo: 'COTA_PCD_EMPREGO',
    nome: 'Reserva de vagas em empresas',
    orgao: 'Ministério do Trabalho',
    baseLegal: 'Lei 8.213/1991, art. 93',
    grupoAlvo: 'PCD',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 14,
    codigo: 'PRIORIDADE_IDOSO',
    nome: 'Atendimento prioritário para idoso',
    orgao: 'Qualquer órgão público',
    baseLegal: 'Lei 10.048/2000',
    grupoAlvo: 'IDOSO',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 15,
    codigo: 'ISENCAO_IR_65MAIS',
    nome: 'Parcela isenta adicional de IR',
    orgao: 'Receita Federal',
    baseLegal: 'Lei 7.713/1988, art. 6º, XV',
    grupoAlvo: 'IDOSO',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 16,
    codigo: 'PRIORIDADE_PCD',
    nome: 'Atendimento prioritário para pessoa com deficiência',
    orgao: 'Qualquer órgão público',
    baseLegal: 'Lei 10.048/2000',
    grupoAlvo: 'PCD',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 17,
    codigo: 'ACOMPANHANTE_ESCOLAR_TEA',
    nome: 'Acompanhante especializado na escola',
    orgao: 'Escola / rede de ensino',
    baseLegal: 'Lei 12.764/2012, art. 3º, parágrafo único',
    grupoAlvo: 'AUTISMO',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 18,
    codigo: 'MEIA_ENTRADA_PCD',
    nome: 'Meia-entrada em eventos culturais e esportivos',
    orgao: 'Organizador do evento',
    baseLegal: 'Lei 12.933/2013, art. 1º, § 8º',
    grupoAlvo: 'PCD',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 19,
    codigo: 'CREDENCIAL_IDOSO',
    nome: 'Credencial de estacionamento para idoso',
    orgao: 'Órgão de trânsito municipal',
    baseLegal: 'Resolução CONTRAN 965/2022',
    grupoAlvo: 'IDOSO',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 20,
    codigo: 'CREDENCIAL_PCD',
    nome: 'Credencial de estacionamento para pessoa com deficiência',
    orgao: 'Órgão de trânsito municipal',
    baseLegal: 'Resolução CONTRAN 965/2022',
    grupoAlvo: 'PCD',
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
];

/** Passo a passo de exemplo, no formato que o RAG do Java vai devolver. */
const orientacoes: Record<string, { passos: string[]; fonte: string }> = {
  BPC_PCD: {
    passos: [
      'Atualize o Cadastro Único no CRAS da sua cidade (precisa ter sido atualizado nos últimos 24 meses).',
      'Faça o pedido pelo app ou site Meu INSS, ou ligue 135, escolhendo "Benefício Assistencial à Pessoa com Deficiência".',
      'Leve o laudo e os documentos de todos da família na avaliação médica e social marcada pelo INSS.',
      'Acompanhe o pedido pelo Meu INSS. Se for negado, você pode recorrer em até 30 dias.',
    ],
    fonte: 'Lei 8.742/1993, art. 20 · gov.br/inss',
  },
  BPC_IDOSO: {
    passos: [
      'Atualize o Cadastro Único no CRAS da sua cidade.',
      'Faça o pedido pelo Meu INSS ou pelo telefone 135, escolhendo "Benefício Assistencial ao Idoso".',
      'Acompanhe o pedido pelo Meu INSS e responda às exigências dentro do prazo.',
    ],
    fonte: 'Lei 8.742/1993, art. 20 · gov.br/inss',
  },
  CIPTEA: {
    passos: [
      'Separe o laudo de TEA, documento com foto, CPF, foto 3x4 e comprovante de residência.',
      'Procure o órgão que emite a carteira no seu estado ou município.',
      'Faça o pedido presencial ou online, conforme o órgão. A carteira é gratuita.',
    ],
    fonte: 'Lei 13.977/2020 (Lei Romeo Mion)',
  },
  TARIFA_SOCIAL_ENERGIA: {
    passos: [
      'Confira se a família está no Cadastro Único com o NIS em dia.',
      'Ligue ou vá até a distribuidora de energia com o NIS e a conta de luz.',
      'Peça a inclusão na Tarifa Social. O desconto aparece nas próximas contas.',
    ],
    fonte: 'Lei 12.212/2010 · ANEEL',
  },
  PASSE_IDOSO_INTERESTADUAL: {
    passos: [
      'Tenha em mãos um documento com foto e o comprovante de renda, ou a Carteira da Pessoa Idosa (emitida pelo CadÚnico).',
      'Peça o bilhete gratuito na bilheteria da empresa de ônibus interestadual, com antecedência.',
      'Se as vagas gratuitas do ônibus já acabaram, peça o desconto de pelo menos 50% na passagem.',
    ],
    fonte: 'Lei 10.741/2003, art. 40',
  },
  PASSE_LIVRE_PCD: {
    passos: [
      'Separe documento com foto, CPF e o laudo (ou comprovante de BPC).',
      'Faça o pedido no site do Passe Livre do Ministério dos Transportes.',
      'Com a carteira aprovada, reserve a passagem na empresa de ônibus, trem ou barco interestadual.',
    ],
    fonte: 'Lei 8.899/1994',
  },
};

type LinhaCaso = [
  pessoaId: number,
  codigo: string,
  status: StatusCaso,
  resultado: ResultadoElegibilidade,
  motivo: string,
  prazo: string,
  atualizacao: string,
];

const SEM_LIMITE = 'Criterios atendidos (sem limite de renda)';

/**
 * Os 31 casos da demonstracao, iguais aos que o Oracle gera (PRC_ABRIR_CASOS,
 * data de referencia 05/11/2026) e a carga do MongoDB: status, motivo e prazo.
 * O motivo vem como a API devolve. Marcos nao tem nenhum (teste negativo).
 */
const linhas: LinhaCaso[] = [
  [
    1,
    'BPC_PCD',
    'DOCUMENTOS_PENDENTES',
    'ELEGIVEL',
    'Renda per capita 0.1851 SM dentro do limite de 0.2500 SM',
    '2026-12-20',
    '2026-11-07',
  ],
  [
    1,
    'PASSE_LIVRE_PCD',
    'ABERTO',
    'ELEGIVEL',
    'Renda per capita 0.1851 SM dentro do limite de 1.0000 SM',
    '2026-12-05',
    '2026-11-05',
  ],
  [1, 'ISENCAO_IPI_VEICULO_PCD', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2027-01-04', '2026-11-05'],
  [1, 'CIPTEA', 'CONCEDIDO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-08'],
  [
    1,
    'TARIFA_SOCIAL_ENERGIA',
    'ABERTO',
    'ELEGIVEL',
    'Renda per capita 0.1851 SM dentro do limite de 0.5000 SM',
    '2026-12-05',
    '2026-11-05',
  ],
  [
    1,
    'CADUNICO',
    'ABERTO',
    'ELEGIVEL',
    'Renda per capita 0.1851 SM dentro do limite de 0.5000 SM',
    '2026-12-05',
    '2026-11-05',
  ],
  [1, 'PRIORIDADE_PCD', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [1, 'ACOMPANHANTE_ESCOLAR_TEA', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [1, 'MEIA_ENTRADA_PCD', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [2, 'ISENCAO_IPI_VEICULO_PCD', 'EM_ANALISE', 'ELEGIVEL', SEM_LIMITE, '2027-01-04', '2026-11-06'],
  [2, 'ISENCAO_IOF_VEICULO_PCD', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2027-01-04', '2026-11-05'],
  [2, 'COTA_PCD_ENSINO_SUPERIOR', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [2, 'COTA_PCD_CONCURSO', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [2, 'COTA_PCD_EMPREGO', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [2, 'PRIORIDADE_PCD', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [2, 'MEIA_ENTRADA_PCD', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [2, 'CREDENCIAL_PCD', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [
    3,
    'BPC_IDOSO',
    'PROTOCOLADO',
    'ELEGIVEL',
    'Renda per capita 0.2313 SM dentro do limite de 0.2500 SM',
    '2026-12-20',
    '2026-11-06',
  ],
  [
    3,
    'PASSE_IDOSO_INTERESTADUAL',
    'ABERTO',
    'ELEGIVEL',
    'Renda individual 0.4627 SM dentro do limite de 2.0000 SM',
    '2026-12-05',
    '2026-11-05',
  ],
  [
    3,
    'TARIFA_SOCIAL_ENERGIA',
    'CONCEDIDO',
    'ELEGIVEL',
    'Renda per capita 0.2313 SM dentro do limite de 0.5000 SM',
    '2026-12-05',
    '2026-11-07',
  ],
  [
    3,
    'CADUNICO',
    'ABERTO',
    'ELEGIVEL',
    'Renda per capita 0.2313 SM dentro do limite de 0.5000 SM',
    '2026-12-05',
    '2026-11-05',
  ],
  [3, 'PRIORIDADE_IDOSO', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [3, 'ISENCAO_IR_65MAIS', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [3, 'CREDENCIAL_IDOSO', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [
    5,
    'BPC_IDOSO',
    'DOCUMENTOS_PENDENTES',
    'POSSIVEL',
    'Renda per capita 0.2795 SM proxima do limite de 0.2500 SM; confirmar renda no CadUnico',
    '2026-12-20',
    '2026-11-06',
  ],
  [
    5,
    'PASSE_IDOSO_INTERESTADUAL',
    'ABERTO',
    'ELEGIVEL',
    'Renda individual 0.5589 SM dentro do limite de 2.0000 SM',
    '2026-12-05',
    '2026-11-05',
  ],
  [
    5,
    'TARIFA_SOCIAL_ENERGIA',
    'ABERTO',
    'ELEGIVEL',
    'Renda per capita 0.2795 SM dentro do limite de 0.5000 SM',
    '2026-12-05',
    '2026-11-05',
  ],
  [
    5,
    'CADUNICO',
    'NEGADO',
    'ELEGIVEL',
    'Renda per capita 0.2795 SM dentro do limite de 0.5000 SM',
    '2026-12-05',
    '2026-11-08',
  ],
  [5, 'PRIORIDADE_IDOSO', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [5, 'ISENCAO_IR_65MAIS', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
  [5, 'CREDENCIAL_IDOSO', 'ABERTO', 'ELEGIVEL', SEM_LIMITE, '2026-12-05', '2026-11-05'],
];

const ABERTURA = '2026-11-05';

/** Monta o caso no formato do CasoResponse da API Java. */
export function montarCaso(
  id: number,
  pessoa: { id: number; nome: string },
  codigo: string,
  status: StatusCaso,
  resultado: ResultadoElegibilidade,
  motivo: string,
  prazo: string,
  atualizacao: string,
): Caso {
  const direito = direitos.find((d) => d.codigo === codigo)!;
  const orientacao = orientacoes[codigo];
  return {
    id,
    pessoa,
    direito: {
      id: direito.id,
      codigo: direito.codigo,
      nome: direito.nome,
      orgao: direito.orgao,
      baseLegal: direito.baseLegal,
    },
    status,
    resultadoAvaliacao: resultado,
    motivo,
    dataAbertura: `${ABERTURA}T10:00:00`,
    dataPrazo: `${prazo}T23:59:00`,
    dataAtualizacao: `${atualizacao}T10:00:00`,
    orientacao: orientacao
      ? {
          id,
          passoAPasso: orientacao.passos.map((p, n) => `${n + 1}. ${p}`).join('\n'),
          fonte: orientacao.fonte,
          modelo: 'demonstracao',
          dataGeracao: `${ABERTURA}T10:00:00`,
        }
      : null,
  };
}

export const casos: Caso[] = linhas.map(
  ([pessoaId, codigo, status, resultado, motivo, prazo, atualizacao], i) => {
    const pessoa = pessoas.find((p) => p.id === pessoaId)!;
    return montarCaso(
      i + 1,
      { id: pessoa.id, nome: pessoa.nome },
      codigo,
      status,
      resultado,
      motivo,
      prazo,
      atualizacao,
    );
  },
);

function documento(
  id: string,
  tipo: Documento['tipo'],
  nomeArquivo: string,
  pessoaId: number,
): Documento {
  return {
    id,
    tipo,
    nomeArquivo,
    contentType: nomeArquivo.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
    tamanhoBytes: 380_000,
    status: tipo === 'LAUDO' ? 'EXTRAIDO' : 'RECEBIDO',
    pessoaId,
    dataEnvio: '2026-11-06T14:00:00',
  };
}

/** Documentos por e-mail do dono (a API .NET liga documento ao `sub` do token). */
export const documentos: Record<string, Documento[]> = {
  'ana.almeida@email.com': [
    documento('doc-0001', 'LAUDO', 'laudo_lucas_almeida.jpg', 1),
    documento('doc-0011', 'RG', 'rg_lucas_almeida.jpg', 1),
    documento('doc-0012', 'COMPROVANTE_RENDA', 'renda_familia_almeida.pdf', 1),
  ],
  'paula.souza@email.com': [
    documento('doc-0003', 'LAUDO', 'laudo_helena_souza.jpg', 3),
    documento('doc-0031', 'COMPROVANTE_RESIDENCIA', 'conta_luz_helena.pdf', 3),
  ],
  'rita.barbosa@email.com': [
    documento('doc-0005', 'LAUDO', 'laudo_rita_barbosa.jpg', 5),
    documento('doc-0051', 'COMPROVANTE_RENDA', 'renda_rita_barbosa.pdf', 5),
  ],
  'carlos.menezes@email.com': [documento('doc-0002', 'LAUDO', 'laudo_carlos_menezes.jpg', 2)],
  'marcos.teixeira@email.com': [documento('doc-0004', 'LAUDO', 'laudo_marcos_teixeira.pdf', 4)],
};

export const envios: Envio[] = [
  {
    id: 'env-0001',
    codigoDireito: 'BPC_PCD',
    donoEmail: 'ana.almeida@email.com',
    donoNome: 'Ana Almeida',
    pessoaNome: 'Lucas Almeida',
    status: 'ENVIADO',
    observacao: null,
    documentos: [...(documentos['ana.almeida@email.com'] ?? [])],
    dataCriacao: '2026-11-06T14:10:00',
    dataEnvio: '2026-11-06T14:12:00',
  },
  {
    id: 'env-0002',
    codigoDireito: 'BPC_IDOSO',
    donoEmail: 'rita.barbosa@email.com',
    donoNome: 'Rita Barbosa',
    pessoaNome: 'Rita Barbosa',
    status: 'ENVIADO',
    observacao: null,
    documentos: [...(documentos['rita.barbosa@email.com'] ?? [])],
    dataCriacao: '2026-11-07T09:30:00',
    dataEnvio: '2026-11-07T09:31:00',
  },
  {
    id: 'env-0003',
    codigoDireito: 'CADUNICO',
    donoEmail: 'paula.souza@email.com',
    donoNome: 'Paula Souza',
    pessoaNome: 'Helena Souza',
    status: 'DEVOLVIDO',
    observacao:
      'O comprovante de residência precisa ser dos últimos 3 meses. Envie uma conta mais recente.',
    documentos: [...(documentos['paula.souza@email.com'] ?? [])],
    dataCriacao: '2026-11-04T16:00:00',
    dataEnvio: '2026-11-04T16:05:00',
  },
];

/**
 * Medicamentos gratuitos do Farmacia Popular, como na tabela T_DF_MEDICAMENTO_FP.
 * Fonte: Elenco de Medicamentos e Insumos PFPB (gov.br/saude), atualizado em
 * 31/08/2026. Os 2 insumos (absorvente e fralda) nao entram na consulta por remedio.
 */
export const elencoFarmaciaPopular: { principioAtivo: string; concentracao: string }[] = [
  { principioAtivo: 'brometo de ipratrópio', concentracao: '0,02mg' },
  { principioAtivo: 'brometo de ipratrópio', concentracao: '0,25mg' },
  { principioAtivo: 'dipropionato de beclometasona', concentracao: '200mcg' },
  { principioAtivo: 'dipropionato de beclometasona', concentracao: '250mcg' },
  { principioAtivo: 'dipropionato de beclometasona', concentracao: '50mcg' },
  { principioAtivo: 'sulfato de salbutamol', concentracao: '100mcg' },
  { principioAtivo: 'sulfato de salbutamol', concentracao: '5mg' },
  { principioAtivo: 'cloridrato de metformina', concentracao: '500mg' },
  { principioAtivo: 'cloridrato de metformina', concentracao: '850mg' },
  { principioAtivo: 'glibenclamida', concentracao: '5mg' },
  { principioAtivo: 'insulina humana regular', concentracao: '100ui/ml' },
  { principioAtivo: 'insulina humana', concentracao: '100ui/ml' },
  { principioAtivo: 'atenolol', concentracao: '25mg' },
  { principioAtivo: 'besilato de anlodipino', concentracao: '5mg' },
  { principioAtivo: 'captopril', concentracao: '25mg' },
  { principioAtivo: 'cloridrato de propranolol', concentracao: '40mg' },
  { principioAtivo: 'hidroclorotiazida', concentracao: '25mg' },
  { principioAtivo: 'losartana potássica', concentracao: '50mg' },
  { principioAtivo: 'maleato de enalapril', concentracao: '10mg' },
  { principioAtivo: 'espironolactona', concentracao: '25mg' },
  { principioAtivo: 'furosemida', concentracao: '40mg' },
  { principioAtivo: 'succinato de metoprolol', concentracao: '25mg' },
  { principioAtivo: 'acetato de medroxiprogesterona', concentracao: '150mg' },
  { principioAtivo: 'etinilestradiol + levonorgestrel', concentracao: '0,03mg + 0,15mg' },
  { principioAtivo: 'noretisterona', concentracao: '0,35mg' },
  {
    principioAtivo: 'valerato de estradiol + enantato de noretisterona',
    concentracao: '5mg + 50mg',
  },
  { principioAtivo: 'alendronato de sódio', concentracao: '70mg' },
  { principioAtivo: 'sinvastatina', concentracao: '10mg' },
  { principioAtivo: 'sinvastatina', concentracao: '20mg' },
  { principioAtivo: 'sinvastatina', concentracao: '40mg' },
  { principioAtivo: 'carbidopa + levodopa', concentracao: '25mg + 250mg' },
  { principioAtivo: 'cloridrato de benserazida + levodopa', concentracao: '25mg + 100mg' },
  { principioAtivo: 'maleato de timolol', concentracao: '2,5mg' },
  { principioAtivo: 'maleato de timolol', concentracao: '5mg' },
  { principioAtivo: 'budesonida', concentracao: '32mcg' },
  { principioAtivo: 'budesonida', concentracao: '50mcg' },
  { principioAtivo: 'dipropionato de beclometasona', concentracao: '50mcg/dose' },
  { principioAtivo: 'dapagliflozina', concentracao: '10mg' },
];

/**
 * O que a "IA" de demonstracao le em qualquer foto de receita: a mesma receita
 * do teste 11 do banco (2 gratuitos, 1 com dosagem diferente, 1 fora do elenco).
 */
export const receitaLida: Medicamento[] = [
  { nome: 'Losartana', principioAtivo: 'losartana potássica', dosagem: '50 mg' },
  { nome: 'Glifage', principioAtivo: 'metformina', dosagem: '850 mg' },
  { nome: 'Atenol', principioAtivo: 'atenolol', dosagem: '100 mg' },
  { nome: 'Rivotril', principioAtivo: 'clonazepam', dosagem: '2 mg' },
];
