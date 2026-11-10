/**
 * Leitura do payload do JWT. O app so LE o token (nome, e-mail, papel); quem
 * valida a assinatura sao as APIs.
 */
export type ConteudoJwt = {
  sub?: string;
  role?: string;
  nome?: string;
  name?: string;
  exp?: number;
};

function decodificarBase64Url(texto: string): string {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/');
  const completo = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binario = atob(completo);
  // Bytes UTF-8 -> texto (nomes com acento), sem depender de TextDecoder.
  const porcentos = Array.from(binario, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`);
  return decodeURIComponent(porcentos.join(''));
}

function codificarBase64Url(texto: string): string {
  const binario = encodeURIComponent(texto).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function lerJwt(token: string): ConteudoJwt | null {
  try {
    const partes = token.split('.');
    if (!partes[1]) return null;
    return JSON.parse(decodificarBase64Url(partes[1])) as ConteudoJwt;
  } catch {
    return null;
  }
}

/** Token no formato JWT, SEM assinatura, usado so pelo modo demonstracao. */
export function criarJwtDemonstracao(conteudo: ConteudoJwt): string {
  const cabecalho = codificarBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  return `${cabecalho}.${codificarBase64Url(JSON.stringify(conteudo))}.demo`;
}
