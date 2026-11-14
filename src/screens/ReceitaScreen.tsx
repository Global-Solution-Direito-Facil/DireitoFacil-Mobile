/**
 * ---------------------------------------------------------------------------
 * MINHA RECEITA
 * ---------------------------------------------------------------------------
 *   foto -> leitura pela IA -> a PESSOA confere e corrige -> elenco oficial
 *
 * A conferencia no meio e obrigatoria: a leitura erra em letra de mao e em
 * nome comercial. O app guarda o que a IA leu e avisa o banco se a pessoa
 * corrigiu (corrigido). A dosagem nao tem formato rigido: o banco normaliza
 * espacos, ponto e virgula. A receita fica registrada no familiar escolhido.
 *
 * O resultado tem tres estados (gratuito, dosagem diferente, fora do elenco)
 * e a orientacao do banco. O app nunca sugere trocar de remedio ou de
 * dosagem, e sempre manda confirmar na farmacia credenciada.
 * ---------------------------------------------------------------------------
 */
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { Cartao } from '../components/Cartao';
import { ConsentimentoLgpd } from '../components/ConsentimentoLgpd';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { ItemDeLista } from '../components/ItemDeLista';
import { Opcoes } from '../components/Opcoes';
import { SeletorImagem } from '../components/SeletorImagem';
import { Selo } from '../components/Selo';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { mensagemDoErro } from '../errors/AppError';
import { usePessoas } from '../hooks/usePessoas';
import { useConsultarFarmaciaPopular, useLerReceita } from '../hooks/useReceita';
import { novaChaveIdempotencia } from '../lib/confirmar';
import { primeiroNome } from '../lib/formatar';
import { Origem, escolherImagem } from '../lib/imagem';
import { Rotulo } from '../lib/rotulos';
import { espaco } from '../lib/tema';
import { ArquivoLocal } from '../types/documento';
import { Medicamento, RemedioConferido, ResultadoFarmacia } from '../types/receita';

type Etapa = 'foto' | 'conferir' | 'resultado';

/** Cada remedio na tela: o que a IA leu (fixo) e o que a pessoa confirmou (editavel). */
type Linha = { lido: Medicamento | null; atual: Medicamento };

const SELO_RESULTADO: Record<ResultadoFarmacia, Rotulo> = {
  GRATUITO: { texto: 'De graça', cor: 'sucesso', fundo: 'sucessoClaro' },
  DOSAGEM_DIVERGENTE: { texto: 'Dosagem diferente da lista', cor: 'alerta', fundo: 'alertaClaro' },
  NAO_ENCONTRADO: { texto: 'Fora da lista', cor: 'textoFraco', fundo: 'fundo' },
};

const comparar = (texto: string) => texto.trim().toLowerCase().replace(/\s+/g, ' ');

/** A pessoa mudou alguma coisa do que a IA leu? Remedio incluido a mao conta como corrigido. */
function foiCorrigido({ lido, atual }: Linha): boolean {
  if (!lido) return true;
  return (
    comparar(lido.nome) !== comparar(atual.nome) ||
    comparar(lido.principioAtivo) !== comparar(atual.principioAtivo) ||
    comparar(lido.dosagem) !== comparar(atual.dosagem)
  );
}

export function ReceitaScreen() {
  const [etapa, setEtapa] = useState<Etapa>('foto');
  const [arquivo, setArquivo] = useState<ArquivoLocal | null>(null);
  const [consentimento, setConsentimento] = useState(false);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [pessoaId, setPessoaId] = useState<number | null>(null);
  const [erros, setErros] = useState<{
    pessoa?: string;
    arquivo?: string;
    consentimento?: string;
    lista?: string;
  }>({});
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const chave = useRef(novaChaveIdempotencia());

  const pessoas = usePessoas();
  const ler = useLerReceita();
  const consultar = useConsultarFarmaciaPopular();

  async function aoEscolher(origem: Origem) {
    setErroFoto(null);
    try {
      const escolhido = await escolherImagem(origem);
      if (escolhido) {
        setArquivo(escolhido);
        chave.current = novaChaveIdempotencia();
      }
    } catch (erro) {
      setErroFoto(mensagemDoErro(erro));
    }
  }

  function aoLer() {
    const encontrados = {
      ...(pessoaId ? {} : { pessoa: 'Escolha de quem é a receita.' }),
      ...(arquivo ? {} : { arquivo: 'Tire uma foto da receita ou escolha da galeria.' }),
      ...(consentimento ? {} : { consentimento: 'É preciso concordar para enviar.' }),
    };
    setErros(encontrados);
    if (!pessoaId || !arquivo || !consentimento) return;
    ler.mutate(
      { arquivo, pessoaId, chave: chave.current },
      {
        onSuccess: (lida) => {
          setLinhas(lida.map((m) => ({ lido: m, atual: { ...m } })));
          setEtapa('conferir');
        },
      },
    );
  }

  function aoConsultar() {
    const preenchidas = linhas.filter((l) => l.atual.principioAtivo.trim());
    if (preenchidas.length === 0 || !pessoaId) {
      setErros({ lista: 'Preencha o nome ou o princípio ativo de pelo menos um remédio.' });
      return;
    }
    setErros({});
    const remedios: RemedioConferido[] = preenchidas.map((l) => ({
      ...l.atual,
      nomeLido: l.lido?.nome ?? '',
      corrigido: foiCorrigido(l),
    }));
    consultar.mutate({ pessoaId, remedios }, { onSuccess: () => setEtapa('resultado') });
  }

  function recomecar() {
    setEtapa('foto');
    setArquivo(null);
    setConsentimento(false);
    setLinhas([]);
    setErros({});
    ler.reset();
    consultar.reset();
    chave.current = novaChaveIdempotencia();
  }

  const editar = (i: number, campo: keyof Medicamento) => (valor: string) =>
    setLinhas((lista) =>
      lista.map((l, j) => (j === i ? { ...l, atual: { ...l.atual, [campo]: valor } } : l)),
    );

  if (ler.isPending) return <EstadoCarregando mensagem="Lendo a receita..." />;
  if (consultar.isPending) return <EstadoCarregando mensagem="Consultando a Farmácia Popular..." />;

  // ---- 2. Conferir a leitura --------------------------------------------------
  if (etapa === 'conferir') {
    return (
      <Tela rodape={<Botao titulo="Consultar Farmácia Popular" aoTocar={aoConsultar} />}>
        <Texto variante="h2">Confira a leitura</Texto>
        <Aviso
          tipo="alerta"
          texto="A leitura automática pode errar, principalmente em letra de mão. Compare com a receita e corrija o que estiver diferente."
        />
        {erros.lista ? <Aviso tipo="perigo" texto={erros.lista} /> : null}
        {consultar.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(consultar.error)} /> : null}
        {linhas.map((linha, i) => (
          <Cartao key={i}>
            <View style={e.titulo}>
              <Texto variante="h3">Remédio {i + 1}</Texto>
              {foiCorrigido(linha) ? (
                <Selo texto="Corrigido por você" cor="info" fundo="infoClaro" />
              ) : null}
            </View>
            {linha.lido ? (
              <Texto variante="pequeno" cor="textoFraco">
                Lido na receita: {linha.lido.nome} · {linha.lido.principioAtivo} ·{' '}
                {linha.lido.dosagem}
              </Texto>
            ) : null}
            <CampoTexto
              rotulo="Nome do remédio"
              value={linha.atual.nome}
              onChangeText={editar(i, 'nome')}
              placeholder="ex.: Losartana"
            />
            <CampoTexto
              rotulo="Princípio ativo"
              dica="O nome da substância, que vem embaixo do nome comercial."
              value={linha.atual.principioAtivo}
              onChangeText={editar(i, 'principioAtivo')}
              placeholder="ex.: losartana potássica"
              autoCapitalize="none"
            />
            <CampoTexto
              rotulo="Dosagem"
              value={linha.atual.dosagem}
              onChangeText={editar(i, 'dosagem')}
              placeholder="50 mg"
              autoCapitalize="none"
            />
            <Botao
              titulo="Remover"
              icone="close"
              variante="discreto"
              aoTocar={() => setLinhas((lista) => lista.filter((_, j) => j !== i))}
            />
          </Cartao>
        ))}
        <Botao
          titulo="Adicionar remédio"
          icone="plus"
          variante="secundario"
          aoTocar={() =>
            setLinhas((lista) => [
              ...lista,
              { lido: null, atual: { nome: '', principioAtivo: '', dosagem: '' } },
            ])
          }
        />
      </Tela>
    );
  }

  // ---- 3. Resultado -------------------------------------------------------------
  if (etapa === 'resultado') {
    const resultados = consultar.data ?? [];
    const gratuitos = resultados.filter((r) => r.resultado === 'GRATUITO').length;
    return (
      <Tela rodape={<Botao titulo="Nova receita" variante="secundario" aoTocar={recomecar} />}>
        <Texto variante="h2">Resultado</Texto>
        <Texto cor="textoFraco">
          {gratuitos} de {resultados.length}{' '}
          {resultados.length === 1 ? 'remédio está' : 'remédios estão'} na lista gratuita.
        </Texto>
        {resultados.map((r, i) => (
          <ItemDeLista key={i} indice={i}>
            <Cartao>
              <Selo {...SELO_RESULTADO[r.resultado]} />
              <Texto variante="h3">{r.nome || r.principioAtivo}</Texto>
              <Texto cor="textoFraco">
                {r.principioAtivo} · {r.dosagem || 'dosagem não informada'}
              </Texto>
              <Texto>{r.orientacao}</Texto>
              {r.corrigido ? (
                <Texto variante="pequeno" cor="textoFraco">
                  Você corrigiu a leitura deste remédio.
                </Texto>
              ) : null}
            </Cartao>
          </ItemDeLista>
        ))}
        <Aviso
          tipo="info"
          texto={
            'Confirme sempre na farmácia credenciada (selo "Aqui tem Farmácia Popular"). ' +
            'Leve a receita válida e um documento oficial com foto e CPF. ' +
            'Não troque de remédio nem de dosagem sem falar com o médico.'
          }
        />
      </Tela>
    );
  }

  // ---- 1. Foto ----------------------------------------------------------------------
  return (
    <Tela rodape={<Botao titulo="Ler receita" aoTocar={aoLer} />}>
      <View style={e.topo}>
        <Texto variante="h2">Remédio de graça na Farmácia Popular</Texto>
        <Texto cor="textoFraco">
          Fotografe a receita. Você confere a leitura, e mostramos quais remédios estão na lista
          oficial do programa e o que levar na farmácia.
        </Texto>
      </View>
      {ler.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(ler.error)} /> : null}
      {erroFoto ? <Aviso tipo="perigo" texto={erroFoto} /> : null}
      {pessoas.data?.length === 0 ? (
        <Aviso
          tipo="alerta"
          texto="Cadastre um familiar na tela inicial antes de consultar a receita."
        />
      ) : (
        <Opcoes
          rotulo="De quem é a receita?"
          opcoes={(pessoas.data ?? []).map((p) => ({ valor: p.id, texto: primeiroNome(p.nome) }))}
          selecionada={pessoaId}
          aoEscolher={setPessoaId}
          erro={erros.pessoa}
        />
      )}
      <SeletorImagem arquivo={arquivo} aoEscolher={aoEscolher} erro={erros.arquivo} />
      <ConsentimentoLgpd
        aceito={consentimento}
        aoMudar={setConsentimento}
        erro={erros.consentimento}
      />
    </Tela>
  );
}

const e = StyleSheet.create({
  topo: { gap: espaco.sm },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexWrap: 'wrap' },
});
