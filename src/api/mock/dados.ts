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
    rendaPerCapita: Math.round((rendaFamiliar / qtdMembrosFamilia) * 100) / 100,
    dataCadastro,
  };
}

function usuario(id: number): UsuarioMock {
  return usuarios.find((u) => u.id === id)!;
}

export const pessoas: Pessoa[] = [
  montarPessoa(1, usuario(1), 'Lucas Almeida', '2019-03-14', 1200, 4),
  montarPessoa(2, usuario(2), 'Carlos Menezes', '1985-07-22', 6500, 2),
  montarPessoa(3, usuario(3), 'Helena Souza', '1958-01-30', 750, 2),
  montarPessoa(4, usuario(4), 'Marcos Teixeira', '1991-05-10', 1500, 1),
  montarPessoa(5, usuario(5), 'Rita Barbosa', '1960-03-02', 906, 2),
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

/** Os 15 direitos da tabela T_DF_DIREITO. */
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
    prazoDias: 30,
    statusVerificacao: 'VERIFICADO',
  },
  {
    id: 6,
    codigo: 'ISENCAO_IOF_VEICULO_PCD',
    nome: 'Isenção de IOF no financiamento de veículo',
    orgao: 'Receita Federal',
    baseLegal: 'Lei 8.383/1991, art. 72',
    grupoAlvo: 'PCD',
    prazoDias: 30,
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
    statusVerificacao: 'CONFIRMAR',
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
    statusVerificacao: 'CONFIRMAR',
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
    statusVerificacao: 'CONFIRMAR',
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
  PASSE_LIVRE_PCD: {
    passos: [
      'Separe documento com foto, CPF e o laudo (ou comprovante de BPC).',
      'Faça o pedido no site do Passe Livre do Ministério dos Transportes.',
      'Com a carteira aprovada, reserve a passagem na empresa de ônibus, trem ou barco interestadual.',
    ],
    fonte: 'Lei 8.899/1994',
  },
};

function dataMaisDias(dataIso: string, dias: number): string {
  const d = new Date(`${dataIso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}T23:59:00`;
}

type LinhaCaso = [
  pessoaId: number,
  codigo: string,
  resultado: ResultadoElegibilidade,
  status: StatusCaso,
  motivo?: string,
];

/** 23 casos: a matriz de elegibilidade do banco. Marcos nao tem nenhum (teste negativo). */
const linhas: LinhaCaso[] = [
  [1, 'BPC_PCD', 'ELEGIVEL', 'DOCUMENTOS_PENDENTES'],
  [1, 'PASSE_LIVRE_PCD', 'ELEGIVEL', 'ABERTO'],
  [1, 'ISENCAO_IPI_VEICULO_PCD', 'ELEGIVEL', 'ABERTO'],
  [1, 'CIPTEA', 'ELEGIVEL', 'PROTOCOLADO'],
  [1, 'TARIFA_SOCIAL_ENERGIA', 'ELEGIVEL', 'CONCEDIDO'],
  [1, 'CADUNICO', 'ELEGIVEL', 'ABERTO'],
  [2, 'ISENCAO_IPI_VEICULO_PCD', 'ELEGIVEL', 'ABERTO'],
  [2, 'ISENCAO_IOF_VEICULO_PCD', 'ELEGIVEL', 'ABERTO'],
  [2, 'COTA_PCD_ENSINO_SUPERIOR', 'ELEGIVEL', 'ABERTO'],
  [2, 'COTA_PCD_CONCURSO', 'ELEGIVEL', 'ABERTO'],
  [2, 'COTA_PCD_EMPREGO', 'ELEGIVEL', 'ABERTO'],
  [3, 'BPC_IDOSO', 'ELEGIVEL', 'EM_ANALISE'],
  [3, 'PASSE_IDOSO_INTERESTADUAL', 'ELEGIVEL', 'ABERTO'],
  [3, 'TARIFA_SOCIAL_ENERGIA', 'ELEGIVEL', 'ABERTO'],
  [3, 'CADUNICO', 'ELEGIVEL', 'ABERTO'],
  [3, 'PRIORIDADE_IDOSO', 'ELEGIVEL', 'ABERTO'],
  [3, 'ISENCAO_IR_65MAIS', 'ELEGIVEL', 'ABERTO'],
  [
    5,
    'BPC_IDOSO',
    'POSSIVEL',
    'ABERTO',
    'Renda por pessoa de 0,2795 salário mínimo, perto do limite de 0,25. Confirme a renda no CadÚnico.',
  ],
  [5, 'PASSE_IDOSO_INTERESTADUAL', 'ELEGIVEL', 'ABERTO'],
  [5, 'TARIFA_SOCIAL_ENERGIA', 'ELEGIVEL', 'ABERTO'],
  [5, 'CADUNICO', 'ELEGIVEL', 'ABERTO'],
  [5, 'PRIORIDADE_IDOSO', 'ELEGIVEL', 'ABERTO'],
  [5, 'ISENCAO_IR_65MAIS', 'ELEGIVEL', 'ABERTO'],
];

const ABERTURA = '2026-11-05';

export const casos: Caso[] = linhas.map(([pessoaId, codigo, resultado, status, motivo], i) => {
  const id = i + 1;
  const pessoa = pessoas.find((p) => p.id === pessoaId)!;
  const direito = direitos.find((d) => d.codigo === codigo)!;
  const orientacao = orientacoes[codigo];
  return {
    id,
    pessoa: { id: pessoa.id, nome: pessoa.nome },
    direito: {
      id: direito.id,
      codigo: direito.codigo,
      nome: direito.nome,
      orgao: direito.orgao,
      baseLegal: direito.baseLegal,
    },
    status,
    resultadoAvaliacao: resultado,
    motivo: motivo ?? 'Atende aos critérios da regra.',
    dataAbertura: `${ABERTURA}T10:00:00`,
    dataPrazo: dataMaisDias(ABERTURA, direito.prazoDias),
    dataAtualizacao: `${ABERTURA}T10:00:00`,
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
});

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
    codigoDireito: 'TARIFA_SOCIAL_ENERGIA',
    donoEmail: 'paula.souza@email.com',
    donoNome: 'Paula Souza',
    pessoaNome: 'Helena Souza',
    status: 'DEVOLVIDO',
    observacao: 'A conta de luz precisa ser dos últimos 3 meses. Envie uma conta mais recente.',
    documentos: [...(documentos['paula.souza@email.com'] ?? [])],
    dataCriacao: '2026-11-04T16:00:00',
    dataEnvio: '2026-11-04T16:05:00',
  },
];

/** Lista de demonstracao da Farmacia Popular (a oficial fica na tabela T_DF_MEDICAMENTO_FP). */
export const farmaciaPopular = [
  { principioAtivo: 'losartana potássica', dosagem: '50 mg' },
  { principioAtivo: 'captopril', dosagem: '25 mg' },
  { principioAtivo: 'hidroclorotiazida', dosagem: '25 mg' },
  { principioAtivo: 'cloridrato de metformina', dosagem: '850 mg' },
  { principioAtivo: 'glibenclamida', dosagem: '5 mg' },
  { principioAtivo: 'sinvastatina', dosagem: '20 mg' },
  { principioAtivo: 'atenolol', dosagem: '25 mg' },
  { principioAtivo: 'sulfato de salbutamol', dosagem: '100 mcg' },
];

/** O que a "IA" de demonstracao le em qualquer foto de receita. */
export const receitaLida: Medicamento[] = [
  { nome: 'Losartana', principioAtivo: 'losartana potássica', dosagem: '50 mg' },
  { nome: 'Glifage XR', principioAtivo: 'cloridrato de metformina', dosagem: '850 mg' },
  { nome: 'Omeprazol', principioAtivo: 'omeprazol', dosagem: '20 mg' },
];
