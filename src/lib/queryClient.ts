/** Configuracao do TanStack Query. */
import { QueryClient } from '@tanstack/react-query';

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
