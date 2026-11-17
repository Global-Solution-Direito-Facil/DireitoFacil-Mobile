/**
 * Inicio do cidadao: um resumo dos pedidos, a familia cadastrada e os
 * caminhos para as outras areas. Quatro estados: carregando, erro, vazio e
 * com dados.
 *
 * Os caminhos ficam numa lista so (linhas com icone e divisor, como no
 * Material), e nao em cartoes iguais empilhados: lista e para escolher,
 * cartao e para conteudo.
 */
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Aviso } from '../components/Aviso';
import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { EstadoCarregando } from '../components/EstadoCarregando';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoVazio } from '../components/EstadoVazio';
import { Icone, NomeIcone } from '../components/Icone';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useAuth } from '../contexts/AuthContext';
import { mensagemDoErro } from '../errors/AppError';
import { useCasos } from '../hooks/useCasos';
import { usePessoas } from '../hooks/usePessoas';
import { entradaDaLista } from '../lib/animacoes';
import { formatarMoeda, primeiroNome } from '../lib/formatar';
import { AREA_TOQUE, cores, elevacao, espaco, raio } from '../lib/tema';
import { CidadaoAbaProps } from '../navigation/tipos';

type Props = CidadaoAbaProps<'Inicio'>;

const CAMINHOS: {
  tela: 'MeusDireitos' | 'Documentos' | 'Receita';
  titulo: string;
  texto: string;
  icone: NomeIcone;
}[] = [
  {
    tela: 'MeusDireitos',
    titulo: 'Meus direitos',
    texto: 'Cada pedido, com status e prazo',
    icone: 'scale-balance',
  },
  {
    tela: 'Documentos',
    titulo: 'Documentos',
    texto: 'Laudos, RG e comprovantes enviados',
    icone: 'file-document-multiple-outline',
  },
  {
    tela: 'Receita',
    titulo: 'Minha receita',
    texto: 'Remédios de graça na Farmácia Popular',
    icone: 'pill',
  },
];

export function InicioScreen({ navigation }: Props) {
  const { usuario } = useAuth();
  const pessoas = usePessoas();
  const casos = useCasos();

  if (pessoas.isPending) return <EstadoCarregando mensagem="Carregando sua família..." />;
  if (pessoas.isError) {
    return (
      <EstadoErro mensagem={mensagemDoErro(pessoas.error)} aoTentarNovamente={pessoas.refetch} />
    );
  }

  const lista = casos.data ?? [];
  const pendentes = lista.filter((c) => c.status === 'DOCUMENTOS_PENDENTES').length;
  const ativos = lista.filter((c) => c.status !== 'CONCEDIDO' && c.status !== 'NEGADO').length;

  return (
    <Tela
      atualizando={pessoas.isRefetching}
      aoAtualizar={() => {
        pessoas.refetch();
        casos.refetch();
      }}
    >
      <View style={e.destaque}>
        <Texto variante="h1" cor="textoSobrePrimaria">
          Olá, {primeiroNome(usuario?.nome ?? '')}
        </Texto>
        <Texto cor="textoSobrePrimariaFraco">
          {ativos > 0
            ? `Você tem ${ativos} ${ativos === 1 ? 'pedido em andamento' : 'pedidos em andamento'}.`
            : 'Cadastre a família e envie um laudo para descobrir os direitos.'}
        </Texto>
        {pendentes > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${pendentes} pedido precisa de documento. Ver meus direitos`}
            onPress={() => navigation.navigate('MeusDireitos')}
            style={({ pressed }) => [e.pendente, pressed && e.pendentePressionado]}
          >
            <Icone nome="alert-outline" cor="alerta" tamanho={20} />
            <Texto variante="corpoForte" cor="alerta" style={e.textoPendente}>
              {pendentes} {pendentes === 1 ? 'pedido precisa' : 'pedidos precisam'} de documento
            </Texto>
            <Icone nome="chevron-right" cor="alerta" tamanho={20} />
          </Pressable>
        ) : null}
      </View>

      {casos.isError ? <Aviso tipo="alerta" texto={mensagemDoErro(casos.error)} /> : null}

      <View style={e.secao}>
        <Texto variante="h2">Família</Texto>
        <Botao
          titulo="Adicionar"
          icone="account-plus-outline"
          variante="discreto"
          larguraTotal={false}
          aoTocar={() => navigation.navigate('PessoaForm')}
        />
      </View>

      {pessoas.data.length === 0 ? (
        <EstadoVazio
          titulo="Ninguém cadastrado ainda"
          texto="Cadastre a pessoa com laudo (você ou um familiar) para ver os direitos dela."
        />
      ) : (
        pessoas.data.map((p, i) => {
          const quantos = lista.filter((c) => c.pessoa.id === p.id).length;
          return (
            <Animated.View key={p.id} entering={entradaDaLista(i)}>
              <Cartao
                aoTocar={() => navigation.navigate('Pessoa', { id: p.id, nome: p.nome })}
                rotuloAcessivel={`${p.nome}, ${p.idade} anos, ${quantos} direitos`}
              >
                <View style={e.linha}>
                  <View style={e.avatar}>
                    <Texto variante="h3" cor="primaria">
                      {p.nome[0]}
                    </Texto>
                  </View>
                  <View style={e.flex}>
                    <Texto variante="h3">{p.nome}</Texto>
                    <Texto cor="textoFraco">
                      {p.idade} anos · renda por pessoa {formatarMoeda(p.rendaPerCapita)}
                    </Texto>
                  </View>
                  <Icone nome="chevron-right" cor="textoFraco" />
                </View>
                <Texto variante="corpoForte" cor="primaria">
                  {quantos} {quantos === 1 ? 'direito encontrado' : 'direitos encontrados'}
                </Texto>
              </Cartao>
            </Animated.View>
          );
        })
      )}

      <Texto variante="h2" style={e.tituloSecao}>
        O que você quer fazer?
      </Texto>
      <View style={e.grupo}>
        {CAMINHOS.map((caminho, i) => (
          <Fragment key={caminho.tela}>
            {i > 0 ? <View style={e.divisor} /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${caminho.titulo}. ${caminho.texto}`}
              onPress={() => navigation.navigate(caminho.tela)}
              android_ripple={{ color: cores.primariaClara }}
              style={({ pressed }) => [e.item, pressed && e.itemPressionado]}
            >
              <View style={e.iconeItem}>
                <Icone nome={caminho.icone} cor="primaria" />
              </View>
              <View style={e.flex}>
                <Texto variante="h3">{caminho.titulo}</Texto>
                <Texto variante="pequeno" cor="textoFraco">
                  {caminho.texto}
                </Texto>
              </View>
              <Icone nome="chevron-right" cor="textoFraco" />
            </Pressable>
          </Fragment>
        ))}
      </View>

      <Cartao>
        <Texto variante="h3">Tem um laudo novo?</Texto>
        <Texto cor="textoFraco">
          Fotografe o laudo. A leitura é automática e a regra oficial confere cada direito.
        </Texto>
        <Botao
          titulo="Enviar laudo"
          icone="camera-outline"
          aoTocar={() => navigation.navigate('NovoDocumento', { tipo: 'LAUDO' })}
        />
      </Cartao>
    </Tela>
  );
}

const e = StyleSheet.create({
  destaque: {
    backgroundColor: cores.primaria,
    borderRadius: raio.lg,
    padding: espaco.xl,
    gap: espaco.sm,
  },
  pendente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: AREA_TOQUE,
    marginTop: espaco.xs,
    paddingHorizontal: espaco.md,
    backgroundColor: cores.alertaClaro,
    paddingVertical: espaco.sm,
    borderRadius: raio.md,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  pendentePressionado: { opacity: 0.85 },
  // Com fonte grande, o texto quebra linha em vez de empurrar a seta para fora.
  textoPendente: { flexShrink: 1 },
  secao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tituloSecao: { marginTop: espaco.sm },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grupo: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: cores.borda,
    overflow: 'hidden',
    ...elevacao.nivel1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: 72,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
  },
  itemPressionado: { backgroundColor: cores.primariaClara },
  iconeItem: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisor: { height: StyleSheet.hairlineWidth, backgroundColor: cores.borda, marginLeft: 72 },
  flex: { flex: 1 },
});
