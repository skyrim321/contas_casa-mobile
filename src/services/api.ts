import { ApiError } from '../types';

/**
 * Flag de controle: quando true, todos os serviços usam implementação mockup.
 * Alterar para false quando a API real estiver disponível.
 */
export const USE_MOCK = true;

export const API_BASE_URL = 'https://sua-api.com';

/**
 * Simula latência de rede nas chamadas mockup.
 */
export function mockDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cliente HTTP base para chamadas à API real.
 * Injeta o token de autorização automaticamente quando disponível.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: await response.text().catch(() => 'Erro desconhecido'),
    };
    throw error;
  }

  return response.json() as Promise<T>;
}
