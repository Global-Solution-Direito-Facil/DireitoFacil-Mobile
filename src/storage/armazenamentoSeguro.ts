/**
 * ---------------------------------------------------------------------------
 * ARMAZENAMENTO SEGURO — para credenciais
 * ---------------------------------------------------------------------------
 * Envolve o expo-secure-store (Keychain no iOS, Keystore no Android).
 * Nenhuma tela importa SecureStore: o resto do app fala em "token".
 *
 * O SecureStore nao existe no navegador; este app roda em celular ou emulador.
 * ---------------------------------------------------------------------------
 */

import * as SecureStore from 'expo-secure-store';

export async function guardarSeguro(chave: string, valor: string): Promise<void> {
  await SecureStore.setItemAsync(chave, valor);
}

/** Devolve `null` quando nao ha nada guardado: e o caso normal de quem nunca entrou. */
export async function lerSeguro(chave: string): Promise<string | null> {
  return SecureStore.getItemAsync(chave);
}

export async function apagarSeguro(chave: string): Promise<void> {
  await SecureStore.deleteItemAsync(chave);
}
