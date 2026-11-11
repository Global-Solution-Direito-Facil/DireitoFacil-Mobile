import { Alert } from 'react-native';

/** Pergunta antes de uma acao destrutiva (excluir, sair). Resolve `true` se a pessoa confirmar. */
export function confirmar(titulo: string, mensagem: string, textoAcao: string): Promise<boolean> {
  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolver(false) },
        { text: textoAcao, style: 'destructive', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}

/**
 * Chave do header Idempotency-Key. A tela gera UMA por acao e reaproveita a
 * mesma se a pessoa tentar de novo depois de uma falha de rede.
 */
export function novaChaveIdempotencia(): string {
  const aleatorio = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${aleatorio()}-${aleatorio()}`;
}
