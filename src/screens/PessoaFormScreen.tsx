/** Cadastro (POST) e edicao (PUT) de familiar, no mesmo formulario. */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { Opcoes } from '../components/Opcoes';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useSnackbar } from '../contexts/SnackbarContext';
import { mensagemDoErro } from '../errors/AppError';
import { usePessoa, useSalvarPessoa } from '../hooks/usePessoas';
import {
  dataBrParaIso,
  formatarData,
  formatarMoeda,
  mascaras,
  moedaParaNumero,
} from '../lib/formatar';
import { cores, espaco, raio } from '../lib/tema';
import {
  temErros,
  validar,
  validarDataNascimento,
  validarMembros,
  validarNome,
  validarRenda,
  validarRendaIndividual,
} from '../lib/validacao';
import { CidadaoStackParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<CidadaoStackParamList, 'PessoaForm'>;
type Campo = 'nome' | 'dataNascimento' | 'renda' | 'membros' | 'rendaIndividual';

/**
 * Renda da propria pessoa: tres respostas, porque "nao tenho renda" e "nao sei"
 * sao coisas diferentes. A primeira manda 0; a segunda manda null (nunca 0),
 * e o banco trata como POSSIVEL em vez de negar.
 */
type TipoRenda = 'VALOR' | 'SEM_RENDA' | 'NAO_INFORMADA';

const OPCOES_RENDA: { valor: TipoRenda; texto: string }[] = [
  { valor: 'VALOR', texto: 'Informar valor' },
  { valor: 'SEM_RENDA', texto: 'Não tenho renda' },
  { valor: 'NAO_INFORMADA', texto: 'Não sei / prefiro não informar' },
];

type Valores = Record<Campo, string> & { tipoRenda: TipoRenda | null };

const VAZIO: Valores = {
  nome: '',
  dataNascimento: '',
  renda: '',
  membros: '',
  rendaIndividual: '',
  tipoRenda: null,
};

function tipoDaRenda(rendaIndividual: number | null): TipoRenda {
  if (rendaIndividual === null) return 'NAO_INFORMADA';
  return rendaIndividual === 0 ? 'SEM_RENDA' : 'VALOR';
}

/**
 * Na edicao, primeiro carrega a pessoa e SO DEPOIS monta o formulario, ja com
 * os valores salvos. Assim o estado do formulario nasce certo, sem efeito
 * copiando dado da API para o estado.
 */
export function PessoaFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const completarRenda = route.params?.foco === 'renda';
  const atual = usePessoa(id);
  const aoTerminar = () => navigation.goBack();

  if (id === undefined) return <Formulario valoresIniciais={VAZIO} aoTerminar={aoTerminar} />;
  if (atual.isPending) return <EstadoCarregando />;
  if (atual.isError) {
    return <EstadoErro mensagem={mensagemDoErro(atual.error)} aoTentarNovamente={atual.refetch} />;
  }

  return (
    <Formulario
      id={id}
      aoTerminar={aoTerminar}
      valoresIniciais={{
        nome: atual.data.nome,
        dataNascimento: formatarData(atual.data.dataNascimento),
        renda: formatarMoeda(atual.data.rendaFamiliar),
        membros: String(atual.data.qtdMembrosFamilia),
        rendaIndividual: atual.data.rendaIndividual
          ? formatarMoeda(atual.data.rendaIndividual)
          : '',
        tipoRenda: tipoDaRenda(atual.data.rendaIndividual),
      }}
      completarRenda={completarRenda}
      nome={atual.data.nome}
    />
  );
}

type PropsFormulario = {
  id?: number;
  valoresIniciais: Valores;
  aoTerminar: () => void;
  /** Veio do botao "Completar informacao" de um direito POSSIVEL. */
  completarRenda?: boolean;
  nome?: string;
};

function Formulario({ id, valoresIniciais, aoTerminar, completarRenda, nome }: PropsFormulario) {
  const editando = id !== undefined;
  const salvar = useSalvarPessoa();
  const { mostrar } = useSnackbar();
  const [form, setForm] = useState(valoresIniciais);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});

  const mudar = (campo: Campo) => (valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  function aoSalvar() {
    const encontrados = validar<Campo>({
      nome: () => validarNome(form.nome),
      dataNascimento: () => validarDataNascimento(form.dataNascimento),
      renda: () => validarRenda(form.renda),
      membros: () => validarMembros(form.membros),
      rendaIndividual: () =>
        validarRendaIndividual(form.tipoRenda, form.rendaIndividual, form.renda),
    });
    setErros(encontrados);
    if (temErros(encontrados)) return;

    salvar.mutate(
      {
        id,
        dados: {
          nome: form.nome.trim(),
          dataNascimento: dataBrParaIso(form.dataNascimento) ?? '',
          rendaFamiliar: moedaParaNumero(form.renda),
          qtdMembrosFamilia: Number(form.membros),
          rendaIndividual:
            form.tipoRenda === 'VALOR'
              ? moedaParaNumero(form.rendaIndividual)
              : form.tipoRenda === 'SEM_RENDA'
                ? 0
                : null,
        },
      },
      {
        onSuccess: () => {
          mostrar(editando ? 'Dados atualizados.' : 'Familiar cadastrado.');
          aoTerminar();
        },
      },
    );
  }

  return (
    <Tela
      rodape={
        <Botao
          titulo={editando ? 'Salvar alterações' : 'Cadastrar'}
          aoTocar={aoSalvar}
          carregando={salvar.isPending}
        />
      }
    >
      <Texto cor="textoFraco">
        A renda e o número de pessoas na casa são usados pela regra oficial para conferir os
        direitos que têm limite de renda.
      </Texto>
      {completarRenda ? (
        <Aviso
          tipo="info"
          texto={`Complete a renda de ${nome ?? 'a pessoa'} para a regra conferir o direito de novo.`}
        />
      ) : null}
      {salvar.isError ? <Aviso tipo="perigo" texto={mensagemDoErro(salvar.error)} /> : null}
      <View style={e.formulario}>
        <CampoTexto
          rotulo="Nome completo"
          value={form.nome}
          onChangeText={mudar('nome')}
          erro={erros.nome}
          autoCapitalize="words"
        />
        <CampoTexto
          rotulo="Data de nascimento"
          value={form.dataNascimento}
          onChangeText={(v) => mudar('dataNascimento')(mascaras.data(v))}
          erro={erros.dataNascimento}
          keyboardType="number-pad"
          placeholder="dd/mm/aaaa"
        />
        <CampoTexto
          rotulo="Renda total da família por mês"
          dica="Some o que todos da casa recebem."
          value={form.renda}
          onChangeText={(v) => mudar('renda')(mascaras.moeda(v))}
          erro={erros.renda}
          keyboardType="number-pad"
          placeholder="R$ 0,00"
        />
        <CampoTexto
          rotulo="Quantas pessoas moram na casa"
          value={form.membros}
          onChangeText={(v) => mudar('membros')(v.replace(/\D/g, '').slice(0, 2))}
          erro={erros.membros}
          keyboardType="number-pad"
        />
        <View style={[e.bloco, completarRenda && e.blocoDestacado]}>
          <Opcoes
            rotulo="Renda da própria pessoa por mês"
            opcoes={OPCOES_RENDA}
            selecionada={form.tipoRenda}
            aoEscolher={(tipoRenda) => setForm((f) => ({ ...f, tipoRenda }))}
            erro={form.tipoRenda === 'VALOR' ? null : erros.rendaIndividual}
          />
          <Texto variante="pequeno" cor="textoFraco">
            Usamos para ver se você tem direito ao passe de ônibus para idosos.
          </Texto>
          {form.tipoRenda === 'VALOR' ? (
            <CampoTexto
              rotulo="Valor que a pessoa recebe"
              value={form.rendaIndividual}
              onChangeText={(v) => mudar('rendaIndividual')(mascaras.moeda(v))}
              erro={erros.rendaIndividual}
              keyboardType="number-pad"
              placeholder="R$ 0,00"
            />
          ) : null}
        </View>
      </View>
    </Tela>
  );
}

const e = StyleSheet.create({
  formulario: { gap: espaco.lg },
  bloco: { gap: espaco.sm },
  blocoDestacado: {
    padding: espaco.md,
    borderRadius: raio.md,
    backgroundColor: cores.primariaClara,
  },
});
