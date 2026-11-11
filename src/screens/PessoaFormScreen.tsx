/** Cadastro (POST) e edicao (PUT) de familiar, no mesmo formulario. */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
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
import { espaco } from '../lib/tema';
import {
  temErros,
  validar,
  validarDataNascimento,
  validarMembros,
  validarNome,
  validarRenda,
} from '../lib/validacao';
import { CidadaoStackParamList } from '../navigation/tipos';

type Props = NativeStackScreenProps<CidadaoStackParamList, 'PessoaForm'>;
type Campo = 'nome' | 'dataNascimento' | 'renda' | 'membros';

const VAZIO: Record<Campo, string> = { nome: '', dataNascimento: '', renda: '', membros: '' };

/**
 * Na edicao, primeiro carrega a pessoa e SO DEPOIS monta o formulario, ja com
 * os valores salvos. Assim o estado do formulario nasce certo, sem efeito
 * copiando dado da API para o estado.
 */
export function PessoaFormScreen({ navigation, route }: Props) {
  const id = route.params?.id;
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
      }}
    />
  );
}

type PropsFormulario = {
  id?: number;
  valoresIniciais: Record<Campo, string>;
  aoTerminar: () => void;
};

function Formulario({ id, valoresIniciais, aoTerminar }: PropsFormulario) {
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
      </View>
    </Tela>
  );
}

const e = StyleSheet.create({
  formulario: { gap: espaco.lg },
});
