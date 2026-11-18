/** Configuracao do TanStack Query. */
import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { AppError } from '../errors/AppError';

/** Erros que nao melhoram tentando de novo. */
const SEM_NOVA_TENTATIVA = ['NAO_ENCONTRADO', 'NAO_AUTORIZADO', 'PROIBIDO', 'CLIENTE'];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Por 30 s o dado e fresco: voltar do detalhe para a lista e instantaneo. */
      staleTime: 1000 * 30,

      /**
       * Um 404 continua 404 na terceira tentativa, e o 401 ja derrubou a
       * sessao. Falha de rede, essa sim, pode passar.
       */
      retry: (tentativas, erro) => {
        if (erro instanceof AppError && SEM_NOVA_TENTATIVA.includes(erro.tipo)) return false;
        return tentativas < 2;
      },
    },
  },
});

/**
 * No celular nao existe "foco da janela": quem diz que o app voltou para a
 * frente e o AppState. Com isso, voltar ao app recarrega o que estiver velho
 * (por exemplo, a lista de envios logo depois da decisao do gestor).
 */
focusManager.setEventListener((mudouFoco) => {
  const escuta = AppState.addEventListener('change', (estado) => mudouFoco(estado === 'active'));
  return () => escuta.remove();
});
