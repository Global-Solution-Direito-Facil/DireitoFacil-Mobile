/**
 * ---------------------------------------------------------------------------
 * NOTIFICACOES LOCAIS (expo-notifications)
 * ---------------------------------------------------------------------------
 * Sem push e sem servidor de notificacao: quem dispara e o proprio celular,
 * quando o app percebe que um envio mudou de status (ver AvisosContext).
 *
 * O pacote e carregado por `require` dentro de funcao, e so fora do Expo Go.
 * No Expo Go o modulo nativo nao existe desde o SDK 53 e um import no topo
 * derrubaria o app inteiro na abertura. La a notificacao fica desligada (o
 * aviso dentro do app continua); no APK tudo funciona.
 * ---------------------------------------------------------------------------
 */

import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

type Modulo = typeof import('expo-notifications');
type Resposta = import('expo-notifications').NotificationResponse;

const CANAL = 'pedidos';

let modulo: Modulo | null = null;
let tentou = false;

function carregar(): Modulo | null {
  if (tentou) return modulo;
  tentou = true;
  if (isRunningInExpoGo()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pacote = require('expo-notifications') as Modulo;
    // Com o app aberto, o Android entrega a notificacao ao JS; sem este
    // handler, nada aparece na tela.
    pacote.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    modulo = pacote;
  } catch {
    modulo = null;
  }
  return modulo;
}

/**
 * Prepara o canal (no Android, e ele que decide se vira banner) e pede a
 * permissao uma vez. Devolve `false` se a pessoa negar ou se for o Expo Go:
 * o app segue normal, so sem notificar.
 */
export async function prepararNotificacoes(): Promise<boolean> {
  const n = carregar();
  if (!n) return false;
  try {
    if (Platform.OS === 'android') {
      await n.setNotificationChannelAsync(CANAL, {
        name: 'Andamento dos pedidos',
        importance: n.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const atual = await n.getPermissionsAsync();
    if (atual.granted) return true;
    if (!atual.canAskAgain) return false;
    return (await n.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Mostra a notificacao agora. O `casoId` volta no toque, para abrir o pedido. */
export async function notificar(titulo: string, texto: string, casoId: number): Promise<void> {
  const n = carregar();
  if (!n) return;
  try {
    await n.scheduleNotificationAsync({
      content: { title: titulo, body: texto, data: { casoId } },
      trigger: Platform.OS === 'android' ? { channelId: CANAL } : null,
    });
  } catch {
    // Notificacao e um extra: se falhar, o aviso dentro do app continua.
  }
}

/**
 * Chama `aoTocar(casoId)` quando a pessoa toca numa notificacao, inclusive a
 * que abriu o app. Devolve a funcao que cancela a escuta.
 */
export function ouvirToques(aoTocar: (casoId: number) => void): () => void {
  const n = carregar();
  if (!n) return () => {};

  const tratar = (resposta: Resposta) => {
    const casoId = Number(resposta.notification.request.content.data?.casoId);
    if (casoId) aoTocar(casoId);
  };

  const ultima = n.getLastNotificationResponse();
  if (ultima) {
    tratar(ultima);
    n.clearLastNotificationResponse();
  }
  const escuta = n.addNotificationResponseReceivedListener(tratar);
  return () => escuta.remove();
}
