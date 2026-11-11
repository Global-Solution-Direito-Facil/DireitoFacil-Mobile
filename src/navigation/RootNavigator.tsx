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
 * Nenhum `navigate('Login')` depois do logout: as telas deixam de existir.
 * Assim o "voltar" do Android nunca leva quem saiu para uma tela interna, e
 * um cidadao nao alcanca a fila do gestor nem digitando a rota.
 * ---------------------------------------------------------------------------
 */

import { NavigationContainer } from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import { BotaoPerfil } from '../components/BotaoPerfil';
import { EstadoCarregando } from '../components/EstadoCarregando';
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
import { AuthStackParamList, CidadaoStackParamList, GestorStackParamList } from './tipos';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CidadaoStack = createNativeStackNavigator<CidadaoStackParamList>();
const GestorStack = createNativeStackNavigator<GestorStackParamList>();

const cabecalho: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.textoSobrePrimaria,
  headerTitleStyle: { fontFamily: fontes.tituloMedio },
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: cores.fundo },
};

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
        <GestorStack.Navigator
          screenOptions={({ navigation }) => ({
            ...cabecalho,
            headerRight: () => <BotaoPerfil aoTocar={() => navigation.navigate('Perfil')} />,
          })}
        >
          <GestorStack.Screen
            name="FilaAnalise"
            component={FilaAnaliseScreen}
            options={{ title: 'Fila de análise' }}
          />
          <GestorStack.Screen
            name="AnaliseEnvio"
            component={AnaliseEnvioScreen}
            options={({ route }) => ({ title: route.params.nome })}
          />
          <GestorStack.Screen
            name="Perfil"
            component={PerfilScreen}
            options={{ title: 'Perfil', headerRight: undefined }}
          />
          <GestorStack.Screen
            name="Sobre"
            component={SobreScreen}
            options={{ title: 'Sobre o app', headerRight: undefined }}
          />
        </GestorStack.Navigator>
      </NavigationContainer>
    );
  }

  // ---- 3. Cidadao -------------------------------------------------------------
  return (
    <NavigationContainer>
      <CidadaoStack.Navigator
        screenOptions={({ navigation }) => ({
          ...cabecalho,
          headerRight: () => <BotaoPerfil aoTocar={() => navigation.navigate('Perfil')} />,
        })}
      >
        <CidadaoStack.Screen
          name="Inicio"
          component={InicioScreen}
          options={{ title: 'Direito Fácil' }}
        />
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
            headerRight: undefined,
          })}
        />
        <CidadaoStack.Screen
          name="MeusDireitos"
          component={MeusDireitosScreen}
          options={{ title: 'Meus direitos' }}
        />
        <CidadaoStack.Screen
          name="Direito"
          component={DireitoScreen}
          options={({ route }) => ({ title: route.params.nome })}
        />
        <CidadaoStack.Screen
          name="Documentos"
          component={DocumentosScreen}
          options={{ title: 'Documentos' }}
        />
        <CidadaoStack.Screen
          name="NovoDocumento"
          component={NovoDocumentoScreen}
          options={{ title: 'Enviar documento', presentation: 'modal', headerRight: undefined }}
        />
        <CidadaoStack.Screen
          name="PedirAnalise"
          component={PedirAnaliseScreen}
          options={{ title: 'Pedir análise', presentation: 'modal', headerRight: undefined }}
        />
        <CidadaoStack.Screen
          name="Receita"
          component={ReceitaScreen}
          options={{ title: 'Minha receita' }}
        />
        <CidadaoStack.Screen
          name="Perfil"
          component={PerfilScreen}
          options={{ title: 'Perfil', headerRight: undefined }}
        />
        <CidadaoStack.Screen
          name="Sobre"
          component={SobreScreen}
          options={{ title: 'Sobre o app', headerRight: undefined }}
        />
      </CidadaoStack.Navigator>
    </NavigationContainer>
  );
}
