import { LoginRequest, LoginResponse, ApiResponse } from '../types';
import { USE_MOCK, mockDelay, apiRequest } from './api';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USERS = [
  {
    username: 'admin',
    password: '1234',
    profile: {
      id: 'usr-001',
      username: 'admin',
      name: 'Administrador',
      email: 'admin@contascasa.app',
    },
  },
];

// ─── Mock implementation ──────────────────────────────────────────────────────

async function loginMock(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  await mockDelay();
  const found = MOCK_USERS.find(
    (u) => u.username === req.username && u.password === req.password
  );
  if (!found) {
    throw { status: 401, message: 'Usuário ou senha inválidos.' };
  }
  return {
    data: {
      token: `mock-token-${found.profile.id}-${Date.now()}`,
      user: found.profile,
    },
  };
}

// ─── Real implementation ──────────────────────────────────────────────────────

async function loginReal(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<ApiResponse<LoginResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const AuthService = {
  login: USE_MOCK ? loginMock : loginReal,
};
