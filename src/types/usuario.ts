/**
 * Tipos de autenticacao. Espelham os DTOs da API Java
 * (LoginRequest, UsuarioRequest e LoginResponse).
 */

export type Papel = 'CIDADAO' | 'GESTOR';

/** O usuario logado, guardado no AsyncStorage para o app abrir sem rede. */
export type Usuario = {
  id: number;
  nome: string;
  /** O `sub` do JWT. E ele que liga os documentos da API .NET a pessoa. */
  email: string;
  papel: Papel;
};

/** Corpo do POST /auth/login. */
export type Credenciais = {
  email: string;
  senha: string;
};

/** Corpo do POST /auth/registrar. */
export type NovoUsuario = Credenciais & {
  nome: string;
  cpf: string;
};

/** Resposta de POST /auth/login e POST /auth/registrar. */
export type RespostaLogin = {
  token: string;
  tipo: string;
  expiraEm: string;
  role: Papel;
  usuarioId: number;
};

/** Formato de pagina das listagens do Spring (PageResponse). */
export type Pagina<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
