// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
}

export interface Session {
  token: string;
  user: UserProfile;
  loginAt: Date;
}

// ─── Família ─────────────────────────────────────────────────────────────────

export interface Family {
  id: number;
  descricao: string;
  ativo: boolean;
}

export interface CreateFamilyRequest {
  descricao: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'responsavel' | 'dependente';
  email?: string;
}

// ─── API utilitários ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
}
