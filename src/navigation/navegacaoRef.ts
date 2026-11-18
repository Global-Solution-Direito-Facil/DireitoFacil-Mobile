/**
 * Referencia ao navegador do cidadao, para navegar de fora das telas: o toque
 * numa notificacao chega no AvisosContext, que fica acima das telas.
 */
import { createNavigationContainerRef } from '@react-navigation/native';

import { CidadaoStackParamList } from './tipos';

export const navegacaoCidadao = createNavigationContainerRef<CidadaoStackParamList>();
