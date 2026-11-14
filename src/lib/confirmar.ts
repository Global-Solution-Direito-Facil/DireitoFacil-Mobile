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
 *
 * Formato UUID v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx): a API .NET recusa
 * com 400 qualquer chave que nao seja um GUID. Usa crypto.getRandomValues
 * quando o aparelho oferece, e Math.random como reserva; para idempotencia
 * basta que duas acoes nao gerem a mesma chave.
 */
export function novaChaveIdempotencia(): string {
  const bytes = new Uint8Array(16);
  const cripto = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => void } }).crypto;
  if (cripto?.getRandomValues) cripto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);

  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40; // versao 4
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // variante RFC 4122

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
