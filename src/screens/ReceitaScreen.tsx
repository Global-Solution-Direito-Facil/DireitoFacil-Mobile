/**
 * ---------------------------------------------------------------------------
 * MINHA RECEITA
 * ---------------------------------------------------------------------------
 *   foto -> leitura pela IA -> a PESSOA confere e corrige -> lista oficial
 *
 * A conferencia no meio e obrigatoria: a leitura erra em letra de mao e em
 * nome comercial. O app nunca sugere trocar remedio ou dosagem; sempre
 * orienta a confirmar na farmacia.
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
import { SeletorImagem } from '../components/SeletorImagem';
import { Selo } from '../components/Selo';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { mensagemDoErro } from '../errors/AppError';
import { useConsultarFarmaciaPopular, useLerReceita } from '../hooks/useReceita';
import { novaChaveIdempotencia } from '../lib/confirmar';
import { Origem, escolherImagem } from '../lib/imagem';
import { espaco } from '../lib/tema';
import { ArquivoLocal } from '../types/documento';
import { Medicamento } from '../types/receita';

type Etapa = 'foto' | 'conferir' | 'resultado';

export function ReceitaScreen() {
  const [etapa, setEtapa] = useState<Etapa>('foto');
  const [arquivo, setArquivo] = useState<ArquivoLocal | null>(null);
  const [consentimento, setConsentimento] = useState(false);
  const [remedios, setRemedios] = useState<Medicamento[]>([]);
  const [erros, setErros] = useState<{ arquivo?: string; consentimento?: string; lista?: string }>(
    {},
  );
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const chave = useRef(novaChaveIdempotencia());

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
      ...(arquivo ? {} : { arquivo: 'Tire uma foto da receita ou escolha da galeria.' }),
      ...(consentimento ? {} : { consentimento: 'É preciso concordar para enviar.' }),
    };
    setErros(encontrados);
    if (!arquivo || !consentimento) return;
    ler.mutate(
      { arquivo, chave: chave.current },
      {
        onSuccess: (lidos) => {
          setRemedios(lidos);
          setEtapa('conferir');
        },
      },
    );
  }

  function aoConsultar() {
    const validos = remedios.filter((r) => r.principioAtivo.trim() && r.dosagem.trim());
    if (validos.length === 0) {
      setErros({ lista: 'Preencha o princípio ativo e a dosagem de pelo menos um remédio.' });
      return;
    }
    setErros({});
    consultar.mutate(validos, { onSuccess: () => setEtapa('resultado') });
  }

  function recomecar() {
    setEtapa('foto');
    setArquivo(null);
    setConsentimento(false);
    setRemedios([]);
    setErros({});
    ler.reset();
    consultar.reset();
    chave.current = novaChaveIdempotencia();
  }

  const editar = (i: number, campo: keyof Medicamento) => (valor: string) =>
    setRemedios((lista) => lista.map((r, j) => (j === i ? { ...r, [campo]: valor } : r)));

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
        {remedios.map((r, i) => (
          <Cartao key={i}>
            <Texto variante="h3">Remédio {i + 1}</Texto>
            <CampoTexto rotulo="Nome na receita" value={r.nome} onChangeText={editar(i, 'nome')} />
            <CampoTexto
              rotulo="Princípio ativo"
              value={r.principioAtivo}
              onChangeText={editar(i, 'principioAtivo')}
            />
            <CampoTexto
              rotulo="Dosagem"
              value={r.dosagem}
              onChangeText={editar(i, 'dosagem')}
              placeholder="ex.: 50 mg"
            />
            <Botao
              titulo="Remover"
              icone="close"
              variante="discreto"
              aoTocar={() => setRemedios((lista) => lista.filter((_, j) => j !== i))}
            />
          </Cartao>
        ))}
        <Botao
          titulo="Adicionar remédio"
          icone="plus"
          variante="secundario"
          aoTocar={() =>
            setRemedios((lista) => [...lista, { nome: '', principioAtivo: '', dosagem: '' }])
          }
        />
      </Tela>
    );
  }

  // ---- 3. Resultado -------------------------------------------------------------
  if (etapa === 'resultado') {
    return (
      <Tela rodape={<Botao titulo="Nova receita" variante="secundario" aoTocar={recomecar} />}>
        <Texto variante="h2">Resultado</Texto>
        {(consultar.data ?? []).map((r, i) => (
          <Cartao key={i}>
            <Texto variante="h3">{r.nome || r.principioAtivo}</Texto>
            <Texto cor="textoFraco">
              {r.principioAtivo} · {r.dosagem}
            </Texto>
            <Selo
              texto={r.gratuito ? 'De graça' : 'Fora da lista'}
              cor={r.gratuito ? 'sucesso' : 'textoFraco'}
              fundo={r.gratuito ? 'sucessoClaro' : 'fundo'}
            />
            <Texto>{r.observacao}</Texto>
          </Cartao>
        ))}
        <Aviso
          tipo="info"
          texto="Leve a receita válida, um documento com foto e o CPF a uma farmácia credenciada. Não troque de remédio nem de dosagem sem falar com o médico."
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
          Fotografe a receita. Mostramos quais remédios estão na lista do programa e o que levar na
          farmácia.
        </Texto>
      </View>
      {ler.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(ler.error)} /> : null}
      {erroFoto ? <Aviso tipo="perigo" texto={erroFoto} /> : null}
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
});
