import { Family, CreateFamilyRequest, FamilyMember, ApiResponse } from '../types';
import { USE_MOCK, mockDelay, apiRequest } from './api';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_FAMILIES: Family[] = [
  { id: 1, descricao: 'Sete Setembro', ativo: true },
];

const MOCK_MEMBERS: FamilyMember[] = [
  { id: 'fam-001', name: 'João Silva', role: 'responsavel', email: 'joao@email.com' },
  { id: 'fam-002', name: 'Maria Silva', role: 'responsavel', email: 'maria@email.com' },
  { id: 'fam-003', name: 'Pedro Silva', role: 'dependente' },
];

let mockNextId = 2;

// ─── Mock implementations ─────────────────────────────────────────────────────

async function searchFamilyMock(query: string): Promise<ApiResponse<Family[]>> {
  await mockDelay();
  const q = query.trim().toLowerCase();
  const results = MOCK_FAMILIES.filter(
    (f) =>
      f.descricao.toLowerCase().includes(q) ||
      String(f.id) === q
  );
  return { data: results };
}

async function createFamilyMock(req: CreateFamilyRequest): Promise<ApiResponse<Family>> {
  await mockDelay();
  const created: Family = { id: mockNextId++, descricao: req.descricao, ativo: true };
  MOCK_FAMILIES.push(created);
  return { data: created };
}

async function joinFamilyMock(familyId: number): Promise<ApiResponse<string>> {
  await mockDelay();
  return { data: `Você entrou na família #${familyId} com sucesso.` };
}

async function listMembersMock(): Promise<ApiResponse<FamilyMember[]>> {
  await mockDelay();
  return { data: MOCK_MEMBERS };
}

// ─── Real implementations ─────────────────────────────────────────────────────

async function searchFamilyReal(query: string, token: string): Promise<ApiResponse<Family[]>> {
  return apiRequest<ApiResponse<Family[]>>(`/familia/search?q=${encodeURIComponent(query)}`, {}, token);
}

async function createFamilyReal(req: CreateFamilyRequest, token: string): Promise<ApiResponse<Family>> {
  return apiRequest<ApiResponse<Family>>('/familia', { method: 'POST', body: JSON.stringify(req) }, token);
}

async function joinFamilyReal(familyId: number, token: string): Promise<ApiResponse<string>> {
  return apiRequest<ApiResponse<string>>(`/familia/${familyId}/join`, { method: 'POST' }, token);
}

async function listMembersReal(token: string): Promise<ApiResponse<FamilyMember[]>> {
  return apiRequest<ApiResponse<FamilyMember[]>>('/familia/members', {}, token);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const FamiliaService = {
  searchFamily: USE_MOCK
    ? (query: string) => searchFamilyMock(query)
    : (query: string, token: string) => searchFamilyReal(query, token),

  createFamily: USE_MOCK
    ? (req: CreateFamilyRequest) => createFamilyMock(req)
    : (req: CreateFamilyRequest, token: string) => createFamilyReal(req, token),

  joinFamily: USE_MOCK
    ? (familyId: number) => joinFamilyMock(familyId)
    : (familyId: number, token: string) => joinFamilyReal(familyId, token),

  listMembers: USE_MOCK
    ? () => listMembersMock()
    : (token: string) => listMembersReal(token),
};

