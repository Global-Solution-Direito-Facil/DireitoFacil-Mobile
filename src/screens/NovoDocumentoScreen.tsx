/**
 * Enviar documento: tipo, de quem e, foto (camera ou galeria) e consentimento
 * LGPD. Sobe para a API .NET com Idempotency-Key.
 */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { ConsentimentoLgpd } from '../components/ConsentimentoLgpd';
import { Opcoes } from '../components/Opcoes';
import { SeletorImagem } from '../components/SeletorImagem';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useSnackbar } from '../contexts/SnackbarContext';
import { mensagemDoErro } from '../errors/AppError';
import { useEnviarDocumento } from '../hooks/useDocumentos';
import { usePessoas } from '../hooks/usePessoas';
import { novaChaveIdempotencia } from '../lib/confirmar';
import { primeiroNome } from '../lib/formatar';
import { Origem, escolherImagem } from '../lib/imagem';
import { tipoDocumento } from '../lib/rotulos';
import { CidadaoStackParamList } from '../navigation/tipos';
import { ArquivoLocal, TipoDocumento } from '../types/documento';

type Props = NativeStackScreenProps<CidadaoStackParamList, 'NovoDocumento'>;

/** A receita tem tela propria (Minha receita). */
const TIPOS = (Object.keys(tipoDocumento) as TipoDocumento[])
  .filter((t) => t !== 'RECEITA')
  .map((t) => ({ valor: t, texto: tipoDocumento[t] }));

type Erros = { tipo?: string; pessoa?: string; arquivo?: string; consentimento?: string };

export function NovoDocumentoScreen({ navigation, route }: Props) {
  const [tipo, setTipo] = useState<TipoDocumento | null>(route.params?.tipo ?? null);
  const [pessoaId, setPessoaId] = useState<number | null>(route.params?.pessoaId ?? null);
  const [arquivo, setArquivo] = useState<ArquivoLocal | null>(null);
  const [consentimento, setConsentimento] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  /**
   * UMA chave por documento. Se o envio falhar por rede e a pessoa tocar de
   * novo, a mesma chave vai junto e a API nao duplica. So muda com outra foto.
   */
  const chave = useRef(novaChaveIdempotencia());

  const pessoas = usePessoas();
  const enviar = useEnviarDocumento();
  const { mostrar } = useSnackbar();

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

  function aoEnviar() {
    const encontrados: Erros = {
      ...(tipo ? {} : { tipo: 'Escolha o tipo do documento.' }),
      ...(pessoaId ? {} : { pessoa: 'Escolha de quem é o documento.' }),
      ...(arquivo ? {} : { arquivo: 'Tire uma foto ou escolha da galeria.' }),
      ...(consentimento ? {} : { consentimento: 'É preciso concordar para enviar.' }),
    };
    setErros(encontrados);
    if (!tipo || !arquivo || !pessoaId || !consentimento) return;

    enviar.mutate(
      {
        documento: { tipo, pessoaId, arquivo, consentimentoSaude: consentimento },
        chave: chave.current,
      },
      {
        onSuccess: () => {
          mostrar('Documento enviado.');
          navigation.goBack();
        },
      },
    );
  }

  return (
    <Tela
      rodape={<Botao titulo="Enviar documento" aoTocar={aoEnviar} carregando={enviar.isPending} />}
    >
      {enviar.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(enviar.error)} /> : null}
      {erroFoto ? <Aviso tipo="perigo" texto={erroFoto} /> : null}

      <Opcoes
        rotulo="Que documento é?"
        opcoes={TIPOS}
        selecionada={tipo}
        aoEscolher={setTipo}
        erro={erros.tipo}
      />

      {pessoas.data?.length === 0 ? (
        <Aviso
          tipo="alerta"
          texto="Cadastre um familiar na tela inicial antes de enviar documentos."
        />
      ) : (
        <Opcoes
          rotulo="De quem é?"
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

      <Texto variante="pequeno" cor="textoFraco">
        Aceitamos JPG, PNG ou PDF de até 10 MB. Se a internet cair, toque em enviar de novo: o
        documento não é duplicado.
      </Texto>
    </Tela>
  );
}
