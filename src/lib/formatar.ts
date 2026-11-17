/** Formatacao e mascaras para exibir e digitar no padrao brasileiro. */

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

/** "2026-11-05T10:00:00" ou "2026-11-05" -> "05/11/2026" */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [data = ''] = iso.split('T');
  const [ano, mes, dia] = data.split('-');
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** "05/11/2026" -> "2026-11-05", ou null se a data nao existir (31/02, por exemplo). */
export function dataBrParaIso(br: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br.trim());
  if (!m) return null;
  const [, dia, mes, ano] = m;
  const d = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const confere =
    d.getFullYear() === Number(ano) &&
    d.getMonth() === Number(mes) - 1 &&
    d.getDate() === Number(dia);
  return confere ? `${ano}-${mes}-${dia}` : null;
}

/** Dias que faltam ate a data (negativo se ja passou). */
export function diasAte(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const alvo = new Date(`${iso.split('T')[0]}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** "R$ 1.200,50" -> 1200.5 */
export function moedaParaNumero(valor: string): number {
  const digitos = valor.replace(/\D/g, '');
  return digitos ? Number(digitos) / 100 : NaN;
}

/** "ComprovanteRenda" -> "COMPROVANTE_RENDA". Ja em CONSTANTE, devolve igual. */
export function paraConstante(valor: string): string {
  if (/^[A-Z0-9_]+$/.test(valor)) return valor;
  return valor
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

/**
 * "COMPROVANTE_RENDA" -> "ComprovanteRenda". E o nome do enum na .NET, que o
 * formulario de upload aceita para todos os tipos (com underline, nao).
 */
export function paraPascal(valor: string): string {
  return valor
    .toLowerCase()
    .split('_')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join('');
}

/** Mascaras aplicadas enquanto a pessoa digita. */
export const mascaras = {
  cpf(valor: string) {
    return valor
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },
  data(valor: string) {
    return valor
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  },
  moeda(valor: string) {
    const centavos = valor.replace(/\D/g, '').slice(0, 10);
    return centavos ? formatarMoeda(Number(centavos) / 100) : '';
  },
};

/** Primeiro nome, para cumprimentos e chips. */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/** "Ana Paula Almeida" -> "AA": a primeira e a ultima inicial, para o avatar. */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

/** "12345678909" -> "***.456.789-**": o perfil mostra so o meio do CPF. */
export function cpfParcial(cpf: string): string {
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length !== 11) return '***';
  return `***.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-**`;
}
