/**
 * ---------------------------------------------------------------------------
 * CONTEXTO DE AUTENTICACAO
 * ---------------------------------------------------------------------------
 * Tudo o que diz respeito a sessao: entrar, cadastrar, sair, restaurar ao
 * abrir o app e reagir a uma sessao expirada (401).
 *
 *   token          -> SecureStore   (criptografado pelo sistema)
 *   nome e papel   -> AsyncStorage  (leitura instantanea, funciona sem rede)
 *
 * O papel (CIDADAO ou GESTOR) decide quais telas existem: ver RootNavigator.
 * ---------------------------------------------------------------------------
 */

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { lerJwt } from '../lib/jwt';
import { queryClient } from '../lib/queryClient';
import { login as loginNaApi, registrar as registrarNaApi } from '../services/authService';
import { apagarLocal, guardarLocal, lerLocal } from '../storage/armazenamentoLocal';
import { apagarSeguro, guardarSeguro, lerSeguro } from '../storage/armazenamentoSeguro';
import { CHAVES, CHAVES_SEGURAS } from '../storage/chavesArmazenamento';
import { registrarAoExpirar } from '../storage/sessaoExpirada';
import { Credenciais, NovoUsuario, RespostaLogin, Usuario } from '../types/usuario';

type AuthContextValor = {
  usuario: Usuario | null;
  carregandoSessao: boolean;
  /** Mensagem para a tela de login quando a sessao caiu sozinha. */
  avisoSessao: string | null;
  entrar: (credenciais: Credenciais) => Promise<void>;
  cadastrar: (dados: NovoUsuario) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  /** Comeca em `true`: sem isso, a tela de login pisca antes de a sessao ser lida. */
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [avisoSessao, setAvisoSessao] = useState<string | null>(null);

  /**
   * Limpeza completa. ORDEM IMPORTA: a credencial primeiro. Se o app fechar
   * no meio, sobrar o dado e inofensivo; sobrar o token manteria a sessao viva.
   *
   * O cache do TanStack Query tambem vai embora: quem entrar depois no mesmo
   * celular nao pode ver, nem por um instante, a familia de quem saiu.
   */
  async function limparSessao() {
    await apagarSeguro(CHAVES_SEGURAS.token);
    await apagarLocal(CHAVES.usuario);
    queryClient.clear();
    setUsuario(null);
  }

  // ---- Restaura a sessao ao abrir o app -----------------------------------
  useEffect(() => {
    async function restaurarSessao() {
      try {
        const token = await lerSeguro(CHAVES_SEGURAS.token);
        if (!token) return;
        const guardado = await lerLocal<Usuario>(CHAVES.usuario);
        if (guardado) setUsuario(guardado);
      } finally {
        setCarregandoSessao(false);
      }
    }
    restaurarSessao();
  }, []);

  // ---- O interceptor chama isto quando recebe 401 ---------------------------
  useEffect(() => {
    registrarAoExpirar(async () => {
      setAvisoSessao('Sua sessão expirou. Entre novamente.');
      await limparSessao();
    });
  }, []);

  /**
   * Login e cadastro terminam igual: os dois devolvem { token, role, usuarioId }.
   * O nome e o e-mail vem de dentro do token (claims `nome` e `sub`).
   */
  async function guardarSessao(resposta: RespostaLogin, nomeInformado?: string) {
    const claims = lerJwt(resposta.token) ?? {};
    const email = claims.sub ?? '';
    const dadosUsuario: Usuario = {
      id: resposta.usuarioId,
      nome: nomeInformado ?? claims.nome ?? claims.name ?? email.split('@')[0] ?? '',
      email,
      papel: resposta.role,
    };

    await guardarSeguro(CHAVES_SEGURAS.token, resposta.token);
    await guardarLocal(CHAVES.usuario, dadosUsuario);

    setAvisoSessao(null);
    setUsuario(dadosUsuario);
  }

  async function entrar(credenciais: Credenciais) {
    await guardarSessao(await loginNaApi(credenciais));
  }

  /** Cadastro que JA ENTRA: o RootNavigator troca as telas sozinho. */
  async function cadastrar(dados: NovoUsuario) {
    await guardarSessao(await registrarNaApi(dados), dados.nome);
  }

  async function sair() {
    await limparSessao();
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregandoSessao, avisoSessao, entrar, cadastrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider');
  }
  return contexto;
}
