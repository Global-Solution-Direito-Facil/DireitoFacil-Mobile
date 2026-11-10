/**
 * ---------------------------------------------------------------------------
 * ARMAZENAMENTO LOCAL — para dados nao sensiveis
 * ---------------------------------------------------------------------------
 *   Credencial  -> SecureStore   (token)
 *   Dado        -> AsyncStorage  (nome e papel do usuario, para abrir sem rede)
 *
 * Laudo, receita e documento NUNCA ficam aqui: sao dados de saude e vivem nas
 * APIs. O AsyncStorage guarda em texto puro.
 * ---------------------------------------------------------------------------
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export async function guardarLocal<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

/** Dado corrompido vira `null` (e e apagado) em vez de quebrar a abertura do app. */
export async function lerLocal<T>(chave: string): Promise<T | null> {
  const bruto = await AsyncStorage.getItem(chave);
  if (bruto === null) return null;
  try {
    return JSON.parse(bruto) as T;
  } catch {
    await AsyncStorage.removeItem(chave);
    return null;
  }
}

export async function apagarLocal(chave: string): Promise<void> {
  await AsyncStorage.removeItem(chave);
}
