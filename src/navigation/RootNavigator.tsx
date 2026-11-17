/**
 * ---------------------------------------------------------------------------
 * NAVEGADOR RAIZ — com guarda de rotas
 * ---------------------------------------------------------------------------
 * QUATRO CAMINHOS:
 *
 *   1. carregandoSessao  ainda lendo o disco: so o carregando
 *   2. sem usuario       so login, cadastro e sobre existem
 *   3. CIDADAO           so as telas do cidadao existem
 *   4. GESTOR            so as telas do assistente social existem
 *
 * Cidadao e gestor tem uma BARRA DE ABAS embaixo com as telas principais. Ela
 * e a primeira tela do stack; os detalhes abrem por cima e cobrem a barra.
 *
 * Nenhum `navigate('Login')` depois do logout: as telas deixam de existir.
 * Assim o "voltar" do Android nunca leva quem saiu para uma tela interna, e
 * um cidadao nao alcanca a fila do gestor nem digitando a rota.
 * ---------------------------------------------------------------------------
 */

import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { EstadoCarregando } from '../components/EstadoCarregando';
import { NomeIcone } from '../components/Icone';
import { IconeAba } from '../components/IconeAba';
import { useAuth } from '../contexts/AuthContext';
import { cores, fontes } from '../lib/tema';
import { AnaliseEnvioScreen } from '../screens/AnaliseEnvioScreen';
import { CadastroScreen } from '../screens/CadastroScreen';
import { DireitoScreen } from '../screens/DireitoScreen';
import { DocumentosScreen } from '../screens/DocumentosScreen';
import { FilaAnaliseScreen } from '../screens/FilaAnaliseScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MeusDireitosScreen } from '../screens/MeusDireitosScreen';
import { NovoDocumentoScreen } from '../screens/NovoDocumentoScreen';
import { PedirAnaliseScreen } from '../screens/PedirAnaliseScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { PessoaFormScreen } from '../screens/PessoaFormScreen';
import { PessoaScreen } from '../screens/PessoaScreen';
import { ReceitaScreen } from '../screens/ReceitaScreen';
import { SobreScreen } from '../screens/SobreScreen';
import { TrocarSenhaScreen } from '../screens/TrocarSenhaScreen';
import {
  AuthStackParamList,
  CidadaoAbasParamList,
  CidadaoStackParamList,
  GestorAbasParamList,
  GestorStackParamList,
} from './tipos';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CidadaoStack = createNativeStackNavigator<CidadaoStackParamList>();
const CidadaoAbas = createBottomTabNavigator<CidadaoAbasParamList>();
const GestorStack = createNativeStackNavigator<GestorStackParamList>();
const GestorAbas = createBottomTabNavigator<GestorAbasParamList>();

const cabecalho: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.textoSobrePrimaria,
  headerTitleStyle: { fontFamily: fontes.tituloMedio },
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: cores.fundo },
};

/** Mesmo cabecalho azul nas abas, e a barra branca com a aba ativa em azul. */
const abas: BottomTabNavigationOptions = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.textoSobrePrimaria,
  headerTitleStyle: { fontFamily: fontes.tituloMedio },
  headerTitleAlign: 'left',
  sceneStyle: { backgroundColor: cores.fundo },
  tabBarActiveTintColor: cores.primaria,
  tabBarInactiveTintColor: cores.textoFraco,
  tabBarLabelStyle: { fontFamily: fontes.textoForte, fontSize: 12 },
  tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda },
  tabBarItemStyle: { paddingTop: 6 },
};

/** Opcoes de uma aba: titulo do cabecalho, rotulo curto e os dois icones. */
function aba(
  titulo: string,
  rotulo: string,
  nome: NomeIcone,
  nomeAtivo: NomeIcone,
): BottomTabNavigationOptions {
  return {
    title: titulo,
    tabBarLabel: rotulo,
    tabBarIcon: ({ focused }) => <IconeAba focado={focused} nome={nome} nomeAtivo={nomeAtivo} />,
  };
}

function AbasCidadao() {
  return (
    <CidadaoAbas.Navigator screenOptions={abas} backBehavior="firstRoute">
      <CidadaoAbas.Screen
        name="Inicio"
        component={InicioScreen}
        options={aba('Direito Fácil', 'Início', 'home-outline', 'home')}
      />
      <CidadaoAbas.Screen
        name="MeusDireitos"
        component={MeusDireitosScreen}
        options={aba('Meus direitos', 'Direitos', 'scale-balance', 'scale-balance')}
      />
      <CidadaoAbas.Screen
        name="Documentos"
        component={DocumentosScreen}
        options={aba('Documentos', 'Documentos', 'file-document-outline', 'file-document')}
      />
      <CidadaoAbas.Screen
        name="Perfil"
        component={PerfilScreen}
        options={aba('Perfil', 'Perfil', 'account-circle-outline', 'account-circle')}
      />
    </CidadaoAbas.Navigator>
  );
}

function AbasGestor() {
  return (
    <GestorAbas.Navigator screenOptions={abas} backBehavior="firstRoute">
      <GestorAbas.Screen
        name="FilaAnalise"
        component={FilaAnaliseScreen}
        options={aba('Fila de análise', 'Fila', 'inbox-outline', 'inbox')}
      />
      <GestorAbas.Screen
        name="Perfil"
        component={PerfilScreen}
        options={aba('Perfil', 'Perfil', 'account-circle-outline', 'account-circle')}
      />
    </GestorAbas.Navigator>
  );
}

export function RootNavigator() {
  const { usuario, carregandoSessao } = useAuth();

  // ---- 1. Ainda lendo o disco ----------------------------------------------
  if (carregandoSessao) {
    return <EstadoCarregando mensagem="Abrindo..." />;
  }

  // ---- 2. Sem sessao --------------------------------------------------------
  if (!usuario) {
    return (
      <NavigationContainer>
        <AuthStack.Navigator screenOptions={cabecalho}>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <AuthStack.Screen
            name="Cadastro"
            component={CadastroScreen}
            options={{ title: 'Criar conta' }}
          />
          <AuthStack.Screen
            name="Sobre"
            component={SobreScreen}
            options={{ title: 'Sobre o app' }}
          />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

  // ---- 4. Assistente social -------------------------------------------------
  if (usuario.papel === 'GESTOR') {
    return (
      <NavigationContainer>
        <GestorStack.Navigator screenOptions={cabecalho}>
          <GestorStack.Screen name="Abas" component={AbasGestor} options={{ headerShown: false }} />
          <GestorStack.Screen
            name="AnaliseEnvio"
            component={AnaliseEnvioScreen}
            options={({ route }) => ({ title: route.params.nome })}
          />
          <GestorStack.Screen
            name="TrocarSenha"
            component={TrocarSenhaScreen}
            options={{ title: 'Trocar senha', presentation: 'modal' }}
          />
          <GestorStack.Screen
            name="Sobre"
            component={SobreScreen}
            options={{ title: 'Sobre o app' }}
          />
        </GestorStack.Navigator>
      </NavigationContainer>
    );
  }

  // ---- 3. Cidadao -------------------------------------------------------------
  return (
    <NavigationContainer>
      <CidadaoStack.Navigator screenOptions={cabecalho}>
        <CidadaoStack.Screen name="Abas" component={AbasCidadao} options={{ headerShown: false }} />
        <CidadaoStack.Screen
          name="Pessoa"
          component={PessoaScreen}
          options={({ route }) => ({ title: route.params.nome })}
        />
        <CidadaoStack.Screen
          name="PessoaForm"
          component={PessoaFormScreen}
          options={({ route }) => ({
            title: route.params?.id ? 'Editar familiar' : 'Novo familiar',
            presentation: 'modal',
          })}
        />
        <CidadaoStack.Screen
          name="Direito"
          component={DireitoScreen}
          options={({ route }) => ({ title: route.params.nome })}
        />
        <CidadaoStack.Screen
          name="NovoDocumento"
          component={NovoDocumentoScreen}
          options={{ title: 'Enviar documento', presentation: 'modal' }}
        />
        <CidadaoStack.Screen
          name="PedirAnalise"
          component={PedirAnaliseScreen}
          options={{ title: 'Pedir análise', presentation: 'modal' }}
        />
        <CidadaoStack.Screen
          name="Receita"
          component={ReceitaScreen}
          options={{ title: 'Minha receita' }}
        />
        <CidadaoStack.Screen
          name="TrocarSenha"
          component={TrocarSenhaScreen}
          options={{ title: 'Trocar senha', presentation: 'modal' }}
        />
        <CidadaoStack.Screen
          name="Sobre"
          component={SobreScreen}
          options={{ title: 'Sobre o app' }}
        />
      </CidadaoStack.Navigator>
    </NavigationContainer>
  );
}
