/**
 * ---------------------------------------------------------------------------
 * PONTO DE ENTRADA
 * ---------------------------------------------------------------------------
 * A ORDEM DOS PROVIDERS IMPORTA. De fora para dentro:
 *
 *   QueryClientProvider   nao depende de ninguem
 *     AuthProvider        usa o queryClient (limpa o cache no logout)
 *       SafeAreaProvider
 *         SnackbarProvider  mensagem rapida depois de salvar, enviar, excluir
 *           RootNavigator   usa o useAuth para decidir quais telas existem
 *
 * As fontes proprias carregam antes de tudo: sem isso, a primeira tela
 * apareceria com a fonte do sistema e trocaria um instante depois.
 * ---------------------------------------------------------------------------
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import { SnackbarProvider } from './src/contexts/SnackbarContext';
import { queryClient } from './src/lib/queryClient';
import { arquivosDeFonte } from './src/lib/tema';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const [fontesProntas, erroFontes] = useFonts(arquivosDeFonte);

  // Se a fonte falhar, o app segue com a do sistema em vez de travar.
  if (!fontesProntas && !erroFontes) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <SnackbarProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </SnackbarProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
