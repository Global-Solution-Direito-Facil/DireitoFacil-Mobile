/**
 * Regras dos formularios. Cada funcao devolve a mensagem de erro ou null.
 * As mesmas regras do back-end, para o erro aparecer antes de ir a rede.
 */

import { dataBrParaIso, moedaParaNumero } from './formatar';

export function validarEmail(valor: string): string | null {
  if (!valor.trim()) return 'Informe seu e-mail.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()) ? null : 'Digite um e-mail válido.';
}

export function validarSenhaLogin(valor: string): string | null {
  return valor ? null : 'Informe sua senha.';
}

/** Java: 8 a 72 caracteres. Pedimos tambem letra e numero. */
export function validarNovaSenha(valor: string): string | null {
  if (valor.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (valor.length > 72) return 'A senha pode ter no máximo 72 caracteres.';
  if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) return 'Use letras e números na senha.';
  return null;
}

export function validarConfirmacao(senha: string, confirmacao: string): string | null {
  return senha === confirmacao ? null : 'As senhas não são iguais.';
}

export function validarNome(valor: string): string | null {
  const nome = valor.trim();
  if (!nome) return 'Informe o nome completo.';
  if (nome.split(/\s+/).length < 2) return 'Digite nome e sobrenome.';
  if (nome.length > 150) return 'O nome pode ter no máximo 150 caracteres.';
  return null;
}

/** Confere os dois digitos verificadores do CPF. */
export function validarCpf(valor: string): string | null {
  const cpf = valor.replace(/\D/g, '');
  if (cpf.length !== 11) return 'O CPF tem 11 números.';
  if (/^(\d)\1{10}$/.test(cpf)) return 'CPF inválido.';
  const digito = (base: string, pesoInicial: number) => {
    const soma = base.split('').reduce((acc, n, i) => acc + Number(n) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const ok =
    digito(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    digito(cpf.slice(0, 10), 11) === Number(cpf[10]);
  return ok ? null : 'CPF inválido.';
}

export function validarDataNascimento(valor: string): string | null {
  if (!valor.trim()) return 'Informe a data de nascimento.';
  const iso = dataBrParaIso(valor);
  if (!iso) return 'Use o formato dd/mm/aaaa.';
  const data = new Date(`${iso}T00:00:00`);
  if (data >= new Date()) return 'A data precisa estar no passado.';
  if (data.getFullYear() < 1900) return 'Confira o ano.';
  return null;
}

export function validarRenda(valor: string): string | null {
  if (!valor.trim()) return 'Informe a renda da família (pode ser R$ 0,00).';
  const numero = moedaParaNumero(valor);
  return Number.isNaN(numero) || numero < 0 ? 'Valor inválido.' : null;
}

export function validarMembros(valor: string): string | null {
  const n = Number(valor);
  if (!valor.trim()) return 'Informe quantas pessoas moram na casa.';
  if (!Number.isInteger(n) || n < 1) return 'Precisa ser pelo menos 1.';
  if (n > 30) return 'Confira esse número.';
  return null;
}

/** Roda as regras e devolve so os campos com erro. Objeto vazio = formulario valido. */
export function validar<C extends string>(regras: Record<C, () => string | null>) {
  const erros: Partial<Record<C, string>> = {};
  for (const campo of Object.keys(regras) as C[]) {
    const erro = regras[campo]();
    if (erro) erros[campo] = erro;
  }
  return erros;
}

export function temErros(erros: object): boolean {
  return Object.keys(erros).length > 0;
}
