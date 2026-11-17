/**
 * Perfil (aba), para o cidadao e o gestor:
 *
 *   quem esta logado    nome, e-mail e papel (da sessao, abre sem rede)
 *   dados da conta      CPF parcial e data de cadastro (GET /usuarios/me)
 *   resumo              cidadao: familia, pedidos e documentos; gestor: a fila
 *   privacidade         o que o app faz com os dados (LGPD)
 *   acoes               trocar senha, "Sobre o app" e sair
 *
 * O resumo reaproveita as consultas das outras abas: o TanStack Query guarda
 * o resultado, entao abrir o perfil quase nunca vai a rede de novo.
 */
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Botao } from '../components/Botao';
import { Cartao } from '../components/Cartao';
import { Icone, NomeIcone } from '../components/Icone';
import { LinhaInfo } from '../components/LinhaInfo';
import { Tela } from '../components/Tela';
import { Texto } from '../components/Texto';
import { useAuth } from '../contexts/AuthContext';
import { useCasos } from '../hooks/useCasos';
import { useMinhaConta } from '../hooks/useConta';
import { useDocumentos } from '../hooks/useDocumentos';
import { useFila } from '../hooks/useEnvios';
import { usePessoas } from '../hooks/usePessoas';
import { confirmar } from '../lib/confirmar';
import { cpfParcial, formatarData, iniciais } from '../lib/formatar';
import { cores, espaco, raio } from '../lib/tema';

type Destino = 'Sobre' | 'TrocarSenha' | 'Inicio' | 'MeusDireitos' | 'Documentos';
// Os dois stacks tem "Sobre" e "TrocarSenha"; as abas do resumo so existem no do cidadao.
type Navegacao = { navigate: (tela: Destino) => void };

export function PerfilScreen() {
  const { usuario, sair } = useAuth();
  const navigation = useNavigation<Navegacao>();
  const conta = useMinhaConta();
  const [saindo, setSaindo] = useState(false);

  async function aoSair() {
    const ok = await confirmar(
      'Sair da conta?',
      'Você vai precisar entrar de novo com e-mail e senha.',
      'Sair',
    );
    if (!ok) return;
    setSaindo(true);
    // Nao navega: sem usuario, o RootNavigator mostra o login sozinho.
    await sair();
  }

  if (!usuario) return null;
  const gestor = usuario.papel === 'GESTOR';
  // Enquanto carrega, "..."; se a API falhar, a linha some (o resto do perfil continua util).
  const carregando = conta.isPending ? '...' : null;

  return (
    <Tela atualizando={conta.isRefetching} aoAtualizar={() => conta.refetch()}>
      <Cartao style={e.centro}>
        <View style={e.avatar}>
          <Texto variante="h1" cor="primaria">
            {iniciais(usuario.nome)}
          </Texto>
        </View>
        <Texto variante="h2" centro>
          {usuario.nome}
        </Texto>
        <Texto cor="textoFraco" centro>
          {usuario.email}
        </Texto>
        <View style={e.selo}>
          <Texto variante="rotulo" cor="primaria">
            {gestor ? 'ASSISTENTE SOCIAL' : 'CIDADÃO'}
          </Texto>
        </View>
      </Cartao>

      <Cartao>
        <Texto variante="h3">Dados da conta</Texto>
        {conta.data || carregando ? (
          <>
            <LinhaInfo rotulo="CPF" valor={carregando ?? cpfParcial(conta.data!.cpf)} />
            <LinhaInfo
              rotulo="Conta criada em"
              valor={carregando ?? formatarData(conta.data!.dataCadastro)}
            />
          </>
        ) : null}
        <LinhaInfo rotulo="Login" valor={usuario.email} />
        <Texto variante="pequeno" cor="textoFraco">
          O nome, o CPF e o e-mail vêm do cadastro e não mudam pelo app.
        </Texto>
      </Cartao>

      {gestor ? <ResumoGestor /> : <ResumoCidadao aoAbrir={(tela) => navigation.navigate(tela)} />}

      <Cartao>
        <View style={e.tituloComIcone}>
          <Icone nome="shield-lock-outline" cor="primaria" />
          <Texto variante="h3">Seus dados</Texto>
        </View>
        <Texto cor="textoFraco">
          {gestor
            ? 'Você vê os documentos só dos envios que analisa. Laudos e receitas são dados de saúde: use-os apenas para conferir o pedido.'
            : 'Laudos e receitas são dados de saúde. Eles são usados só para conferir direitos e montar os pedidos da sua família, e você pode apagar documentos e familiares quando quiser.'}
        </Texto>
      </Cartao>

      <View style={e.acoes}>
        <Botao
          titulo="Trocar senha"
          icone="lock-reset"
          variante="secundario"
          aoTocar={() => navigation.navigate('TrocarSenha')}
        />
        <Botao
          titulo="Sobre o app"
          icone="information-outline"
          variante="secundario"
          aoTocar={() => navigation.navigate('Sobre')}
        />
        <Botao
          titulo="Sair"
          icone="logout"
          variante="perigo"
          carregando={saindo}
          aoTocar={aoSair}
        />
      </View>
    </Tela>
  );
}

/** Familia, pedidos em andamento e documentos; cada numero abre a aba dele. */
function ResumoCidadao({ aoAbrir }: { aoAbrir: (tela: Destino) => void }) {
  const pessoas = usePessoas();
  const casos = useCasos();
  const documentos = useDocumentos();
  const ativos = casos.data?.filter((c) => c.status !== 'CONCEDIDO' && c.status !== 'NEGADO');

  return (
    <Cartao>
      <Texto variante="h3">Resumo</Texto>
      <View style={e.numeros}>
        <Numero
          valor={pessoas.data?.length}
          rotulo="Familiares"
          icone="account-group-outline"
          aoTocar={() => aoAbrir('Inicio')}
        />
        <Numero
          valor={ativos?.length}
          rotulo="Pedidos em andamento"
          icone="scale-balance"
          aoTocar={() => aoAbrir('MeusDireitos')}
        />
        <Numero
          valor={documentos.data?.length}
          rotulo="Documentos"
          icone="file-document-outline"
          aoTocar={() => aoAbrir('Documentos')}
        />
      </View>
    </Cartao>
  );
}

/** A mesma consulta da aba Fila: o numero aparece sem nova ida a rede. */
function ResumoGestor() {
  const fila = useFila('ENVIADO');
  return (
    <Cartao>
      <Texto variante="h3">Resumo</Texto>
      <View style={e.numeros}>
        <Numero valor={fila.data?.length} rotulo="Aguardando análise" icone="inbox-outline" />
      </View>
    </Cartao>
  );
}

type NumeroProps = {
  valor: number | undefined;
  rotulo: string;
  icone: NomeIcone;
  aoTocar?: () => void;
};

function Numero({ valor, rotulo, icone, aoTocar }: NumeroProps) {
  const texto = valor === undefined ? '–' : String(valor);
  return (
    <Pressable
      onPress={aoTocar}
      disabled={!aoTocar}
      accessibilityRole={aoTocar ? 'button' : 'text'}
      accessibilityLabel={`${rotulo}: ${valor ?? 'carregando'}`}
      android_ripple={aoTocar ? { color: cores.primariaClara } : undefined}
      style={({ pressed }) => [e.numero, pressed && e.numeroPressionado]}
    >
      <Icone nome={icone} cor="primaria" />
      <Texto variante="h2" cor="primaria">
        {texto}
      </Texto>
      <Texto variante="pequeno" cor="textoFraco" centro>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

const e = StyleSheet.create({
  centro: { alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: raio.pilula,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selo: {
    backgroundColor: cores.primariaClara,
    borderRadius: raio.pilula,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
  },
  tituloComIcone: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  numeros: { flexDirection: 'row', gap: espaco.sm },
  numero: {
    flex: 1,
    alignItems: 'center',
    gap: espaco.xs,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.xs,
    borderRadius: raio.md,
    backgroundColor: cores.fundo,
  },
  numeroPressionado: { backgroundColor: cores.primariaClara },
  acoes: { gap: espaco.sm },
});
