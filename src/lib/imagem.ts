/**
 * Camera e galeria (expo-image-picker).
 *
 * Devolve `null` quando a pessoa cancela; lanca erro com mensagem para a tela
 * quando a permissao e negada. A permissao e pedida na hora do uso, nunca na
 * abertura do app: assim a pessoa entende por que o app quer a camera.
 */

import * as ImagePicker from 'expo-image-picker';

import { ArquivoLocal } from '../types/documento';

export type Origem = 'camera' | 'galeria';

export async function escolherImagem(origem: Origem): Promise<ArquivoLocal | null> {
  const permissao =
    origem === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissao.granted) {
    throw new Error(
      origem === 'camera'
        ? 'Sem permissão para usar a câmera. Libere nas configurações do celular.'
        : 'Sem permissão para abrir a galeria. Libere nas configurações do celular.',
    );
  }

  const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  const resultado =
    origem === 'camera'
      ? await ImagePicker.launchCameraAsync(opcoes)
      : await ImagePicker.launchImageLibraryAsync(opcoes);

  const foto = resultado.canceled ? undefined : resultado.assets[0];
  if (!foto) return null;

  const tipo =
    foto.mimeType ?? (foto.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
  const extensao = tipo === 'image/png' ? 'png' : 'jpg';
  return {
    uri: foto.uri,
    name: foto.fileName ?? `documento-${Date.now()}.${extensao}`,
    type: tipo,
    tamanhoBytes: foto.fileSize,
  };
}
