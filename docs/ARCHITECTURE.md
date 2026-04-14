# Documentação da Arquitetura — Contas da Casa (Mobile)

> Documento de referência para desenvolvimento contínuo do aplicativo.  
> Atualizado em: **Abril / 2026**

---

## 1. Visão Geral

Aplicativo mobile/web para gerenciamento de contas domésticas, desenvolvido com **React Native + Expo**.  
Suporta execução em **Android**, **iOS** e **Web** a partir de um único código-fonte.

As chamadas de dados seguem o padrão **Service Layer com Mockup comutável**:  
todas as integrações são implementadas duas vezes (mock + real) e alternadas pela flag `USE_MOCK` em `src/services/api.ts`.

---

## 2. Estrutura de Arquivos

```
contas_casa-mobile/
├── App.tsx                              # Ponto de entrada — envolve com AuthProvider e AppNavigator
├── index.ts                             # Registro do root component via Expo
├── app.json                             # Configurações do Expo (nome, slug, ícone, etc.)
├── tsconfig.json
├── package.json
├── assets/                              # Imagens e ícones estáticos
├── docs/
│   └── ARCHITECTURE.md                  # Este arquivo
└── src/
    ├── types/
    │   └── index.ts                     # Interfaces e tipos globais (Session, UserProfile, etc.)
    ├── services/
    │   ├── api.ts                       # Cliente HTTP base + flag USE_MOCK + mockDelay
    │   ├── authService.ts               # Serviço de autenticação (mock + real)
    │   └── familiaService.ts            # Serviço de família (mock + real)
    ├── context/
    │   └── AuthContext.tsx              # Estado global de autenticação — consome AuthService
    ├── navigation/
    │   └── AppNavigator.tsx             # Roteamento condicional por estado de sessão
    ├── screens/
    │   ├── LoginScreen.tsx              # Tela de login
    │   ├── HomeScreen.tsx               # Tela principal com menu lateral/horizontal
    │   └── FamiliaScreen.tsx            # Tela de família (template em branco)
    ├── config/
    │   └── auth.ts                      # (legado — substituído pelo AuthService)
    └── utils/
        └── session.ts                   # Geração de UUID (legado — substituído pelo token da API)
```

---

## 3. Padrão de Serviços (Service Layer + Mockup)

### 3.1 Princípio

Cada domínio da aplicação possui um arquivo de serviço em `src/services/`.  
Cada serviço implementa **duas versões** da mesma função:

- `*Mock()` — retorna dados estáticos com atraso simulado, sem depender de rede
- `*Real()` — faz a chamada HTTP real via `apiRequest()`

A exportação do serviço aponta para uma ou outra com base na flag `USE_MOCK`:

```ts
// src/services/api.ts
export const USE_MOCK = true; // ← alterar para false quando a API estiver disponível
```

### 3.2 Fluxo de uma chamada

```
Componente / Context
        │
        ▼
   XxxService.metodo()           ← interface pública única
        │
        ├── USE_MOCK = true  ──► xxxMock()    ──► dados estáticos + mockDelay()
        └── USE_MOCK = false ──► xxxReal()    ──► apiRequest() ──► API REST
```

### 3.3 `apiRequest` — cliente HTTP base

```ts
// src/services/api.ts
apiRequest<T>(path, options?, token?)
```

- Monta a URL com `API_BASE_URL + path`
- Injeta `Authorization: Bearer <token>` automaticamente quando fornecido
- Lança `ApiError { status, message }` em caso de resposta não-OK
- Usado apenas nas implementações `*Real()`; mockups não passam por ele

---

## 4. Tipos Globais (`src/types/index.ts`)

```ts
// Autenticação
interface LoginRequest  { username: string; password: string; }
interface LoginResponse { token: string; user: UserProfile; }
interface UserProfile   { id: string; username: string; name: string; email: string; }
interface Session       { token: string; user: UserProfile; loginAt: Date; }

// Família
interface FamilyMember  { id: string; name: string; role: 'responsavel' | 'dependente'; email?: string; }

// Utilitários
interface ApiResponse<T> { data: T; message?: string; }
interface ApiError       { status: number; message: string; }
```

---

## 5. Fluxo de Autenticação

```
App inicia
    │
    ▼
AuthProvider  (AuthContext.tsx)
    │
    ├── session === null ──► LoginScreen
    │       │
    │       └── login(username, password)   [async]
    │               │
    │               └── AuthService.login({ username, password })
    │                       │
    │                       ├── USE_MOCK = true  ──► verifica MOCK_USERS → retorna token mock
    │                       └── USE_MOCK = false ──► POST /auth/login → retorna token real
    │                               │
    │                               ├── sucesso ──► setSession({ token, user, loginAt })
    │                               └── erro    ──► return false → exibe erro na tela
    │
    └── session !== null ──► HomeScreen
            │
            └── logout() ──► setSession(null) ──► volta para LoginScreen
```

### Hook de acesso

```ts
const { session, login, logout } = useAuth();

// session contém:
session.token          // JWT ou token mock
session.user.name      // nome exibível
session.user.username  // login do usuário
session.loginAt        // timestamp do login
```

> ⚠️ `useAuth()` lança erro se usado fora do `<AuthProvider>`.

---

## 6. Serviços Disponíveis

### 6.1 `AuthService` (`src/services/authService.ts`)

| Método  | Assinatura                                        | Descrição               |
|---------|---------------------------------------------------|-------------------------|
| `login` | `(req: LoginRequest) => Promise<ApiResponse<LoginResponse>>` | Autentica o usuário |

**Mock:** verifica contra `MOCK_USERS` (admin / 1234)  
**Real:** `POST /auth/login`

---

### 6.2 `FamiliaService` (`src/services/familiaService.ts`)

| Método        | Assinatura                                              | Descrição                   |
|---------------|---------------------------------------------------------|-----------------------------|
| `listMembers` | `() => Promise<ApiResponse<FamilyMember[]>>`            | Lista membros da família    |

**Mock:** retorna 3 membros estáticos  
**Real:** `GET /familia/members` com token no header

---

## 7. Como adicionar um novo serviço

1. Adicionar interface do domínio em `src/types/index.ts`
2. Criar `src/services/xxxService.ts` seguindo o padrão:

```ts
import { USE_MOCK, mockDelay, apiRequest } from './api';
import { MinhaEntidade, ApiResponse } from '../types';

async function listarMock(): Promise<ApiResponse<MinhaEntidade[]>> {
  await mockDelay();
  return { data: [ /* dados estáticos */ ] };
}

async function listarReal(token: string): Promise<ApiResponse<MinhaEntidade[]>> {
  return apiRequest<ApiResponse<MinhaEntidade[]>>('/meu-endpoint', {}, token);
}

export const MeuService = {
  listar: USE_MOCK ? () => listarMock() : (token: string) => listarReal(token),
};
```

3. Consumir no componente/context via `await MeuService.listar(session?.token)`

---

## 8. Navegação

| Estado       | Rota ativa | Componente        |
|--------------|------------|-------------------|
| Sem sessão   | `Login`    | `LoginScreen`     |
| Com sessão   | `Home`     | `HomeScreen`      |

```ts
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Familia: undefined;   // declarado — pronto para ser registrado no Stack se necessário
};
```

---

## 9. Telas

### 9.1 LoginScreen
- Chama `await login(username, password)` (agora assíncrono)
- Exibe erro inline se retornar `false`
- Layout responsivo: card na web (≥ 600px), fullscreen no mobile

### 9.2 HomeScreen
- Header + menu (sidebar web / barra mobile)
- Seções:

| Chave     | Label   | Status            |
|-----------|---------|-------------------|
| `home`    | Home    | ✅ Implementado   |
| `familia` | Família | 🔲 Template vazio |

### 9.3 FamiliaScreen
- Template em branco — pronto para consumir `FamiliaService.listMembers()`

---

## 10. Responsividade

| Breakpoint | Contexto                           |
|------------|------------------------------------|
| 600px      | LoginScreen — ativa card centrado  |
| 768px      | HomeScreen — ativa sidebar lateral |

```ts
const { width } = useWindowDimensions();
const isWide = Platform.OS === 'web' && width >= [breakpoint];
```

---

## 11. Migrando do Mock para API Real

1. Configurar a URL da API em `src/services/api.ts`:
   ```ts
   export const API_BASE_URL = 'https://sua-api.com';
   ```
2. Alterar a flag:
   ```ts
   export const USE_MOCK = false;
   ```
3. Implementar persistência do token com `expo-secure-store`:
   ```bash
   npx expo install expo-secure-store
   ```
   ```ts
   import * as SecureStore from 'expo-secure-store';
   await SecureStore.setItemAsync('auth_token', token);
   const token = await SecureStore.getItemAsync('auth_token');
   await SecureStore.deleteItemAsync('auth_token');
   ```
4. No `AuthProvider`, adicionar `useEffect` para restaurar a sessão ao iniciar:
   ```ts
   useEffect(() => {
     async function restore() {
       const token = await SecureStore.getItemAsync('auth_token');
       if (token) {
         // validar token com /auth/me ou decodificar JWT
         // setSession({ token, user, loginAt: new Date() });
       }
     }
     restore();
   }, []);
   ```

---

## 12. Dependências Principais

| Pacote                           | Versão  | Uso                             |
|----------------------------------|---------|---------------------------------|
| `expo`                           | ~54.0   | Plataforma base                 |
| `react-native`                   | 0.81.5  | Framework UI                    |
| `@react-navigation/native`       | ^7.2    | Navegação                       |
| `@react-navigation/native-stack` | ^7.14   | Stack navigator                 |
| `react-native-screens`           | ^4.24   | Otimização de telas nativas     |
| `react-native-safe-area-context` | ^5.7    | Margens seguras                 |
| `react-dom` + `react-native-web` | —       | Suporte à plataforma web        |

---

## 13. Comandos Úteis

```bash
npm start              # Inicia servidor Expo
npm run android        # Android
npm run ios            # iOS
npm run web            # Navegador
npm install            # Instala dependências
npx expo install <pkg> # Instala pacote compatível com a versão do Expo
```


---

## 1. Visão Geral

Aplicativo mobile/web para gerenciamento de contas domésticas, desenvolvido com **React Native + Expo**.  
Suporta execução em **Android**, **iOS** e **Web** a partir de um único código-fonte.

---

## 2. Estrutura de Arquivos

```
contas_casa-mobile/
├── App.tsx                         # Ponto de entrada — envolve com AuthProvider e AppNavigator
├── index.ts                        # Registro do root component via Expo
├── app.json                        # Configurações do Expo (nome, slug, ícone, etc.)
├── tsconfig.json                   # Configurações do TypeScript
├── package.json
├── assets/                         # Imagens e ícones estáticos
├── docs/
│   └── ARCHITECTURE.md             # Este arquivo
└── src/
    ├── config/
    │   └── auth.ts                 # Credenciais de demonstração (substituir por API real)
    ├── context/
    │   └── AuthContext.tsx         # Estado global de autenticação (session, login, logout)
    ├── navigation/
    │   └── AppNavigator.tsx        # Roteamento condicional por estado de sessão
    ├── screens/
    │   ├── LoginScreen.tsx         # Tela de login
    │   ├── HomeScreen.tsx          # Tela principal com menu lateral/horizontal
    │   └── FamiliaScreen.tsx       # Tela de família (template em branco)
    └── utils/
        └── session.ts              # Geração de sessionId via crypto.randomUUID()
```

---

## 3. Fluxo de Autenticação

```
App inicia
    │
    ▼
AuthProvider (AuthContext)
    │
    ├── session === null ──► LoginScreen
    │       │
    │       └── login(username, password)
    │               │
    │               ├── credenciais válidas ──► cria Session { username, sessionId, loginAt }
    │               └── credenciais inválidas ──► exibe erro na tela
    │
    └── session !== null ──► HomeScreen
            │
            └── logout() ──► session = null ──► volta para LoginScreen
```

### Interface `Session`

```ts
interface Session {
  username: string;      // nome do usuário autenticado
  sessionId: string;     // UUID gerado em crypto.randomUUID()
  loginAt: Date;         // timestamp do login
}
```

### Hook de acesso

```ts
const { session, login, logout } = useAuth();
```

> ⚠️ `useAuth()` lança erro se usado fora do `<AuthProvider>`.

---

## 4. Navegação

Gerenciada por `@react-navigation/native-stack`.  
A lógica de roteamento é **condicional por sessão**, sem redirecionamentos manuais:

| Estado       | Rota ativa | Componente        |
|--------------|------------|-------------------|
| Sem sessão   | `Login`    | `LoginScreen`     |
| Com sessão   | `Home`     | `HomeScreen`      |

### Tipo das rotas (`RootStackParamList`)

```ts
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Familia: undefined;   // declarado — pronto para ser registrado no Stack quando necessário
};
```

---

## 5. Telas

### 5.1 LoginScreen

- Campos: **Usuário** e **Senha**
- Validação: exibe mensagem de erro inline se credenciais inválidas
- Layout responsivo: card centralizado na web (≥ 600px), fullscreen no mobile

### 5.2 HomeScreen

- Header fixo com título e botão **Sair**
- Menu de navegação interna:
  - **Mobile**: barra horizontal no topo do conteúdo
  - **Web (≥ 768px)**: sidebar vertical fixa à esquerda (220px)
- Seções disponíveis:

| Chave      | Label    | Status             |
|------------|----------|--------------------|
| `home`     | Home     | ✅ Implementado    |
| `familia`  | Família  | 🔲 Template vazio  |

- Renderiza `FamiliaScreen` quando o menu `familia` está ativo

### 5.3 FamiliaScreen

- Template em branco pronto para desenvolvimento
- Acesso: via menu "Família" no `HomeScreen`

---

## 6. Responsividade

Padrão utilizado em todas as telas:

```ts
const { width } = useWindowDimensions();
const isWide = Platform.OS === 'web' && width >= [breakpoint];
```

| Breakpoint | Contexto                          |
|------------|-----------------------------------|
| 600px      | LoginScreen — ativa card centrado |
| 768px      | HomeScreen — ativa sidebar        |

---

## 7. Autenticação — Estado Atual e Próximos Passos

### Estado atual
- Credenciais fixas em `src/config/auth.ts`:
  ```ts
  export const DEMO_USERNAME = 'admin';
  export const DEMO_PASSWORD = '1234';
  ```
- Sessão armazenada apenas em **memória** (React state) — perdida ao recarregar

### Após leitura/integração do token (próximos passos)

Ao conectar com uma API real, os pontos de integração são:

#### 7.1 — Substituir a função `login` em `AuthContext.tsx`

```ts
// Atual (demo)
function login(username: string, password: string): boolean {
  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) { ... }
}

// Substituir por chamada à API:
async function login(username: string, password: string): Promise<boolean> {
  const response = await fetch('https://sua-api.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) return false;
  const { token, user } = await response.json();
  await saveToken(token);           // persistir token (ver 7.2)
  setSession({ username: user.name, sessionId: user.id, loginAt: new Date() });
  return true;
}
```

#### 7.2 — Persistência do token

Instalar e usar `expo-secure-store` para salvar o token de forma segura:

```bash
npx expo install expo-secure-store
```

```ts
import * as SecureStore from 'expo-secure-store';

async function saveToken(token: string) {
  await SecureStore.setItemAsync('auth_token', token);
}

async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('auth_token');
}

async function removeToken() {
  await SecureStore.deleteItemAsync('auth_token');
}
```

#### 7.3 — Restaurar sessão ao iniciar o app

No `AuthProvider`, adicionar `useEffect` para verificar token salvo:

```ts
useEffect(() => {
  async function restoreSession() {
    const token = await getToken();
    if (token) {
      // validar token com a API ou decodificar JWT
      // setSession({ ... });
    }
  }
  restoreSession();
}, []);
```

#### 7.4 — Enviar token nas requisições autenticadas

```ts
const token = await getToken();

fetch('https://sua-api.com/dados', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

#### 7.5 — Logout com invalidação de token

```ts
async function logout() {
  await removeToken();
  // opcional: chamar endpoint de logout na API
  setSession(null);
}
```

---

## 8. Dependências Principais

| Pacote                          | Versão   | Uso                              |
|---------------------------------|----------|----------------------------------|
| `expo`                          | ~54.0    | Plataforma base                  |
| `react-native`                  | 0.81.5   | Framework UI                     |
| `@react-navigation/native`      | ^7.2     | Navegação                        |
| `@react-navigation/native-stack`| ^7.14    | Stack navigator                  |
| `react-native-screens`          | ^4.24    | Otimização de telas nativas      |
| `react-native-safe-area-context`| ^5.7     | Margens seguras (notch, barra)   |
| `react-dom` + `react-native-web`| —        | Suporte à plataforma web         |

---

## 9. Comandos Úteis

```bash
npm start              # Inicia servidor Expo (escolha a plataforma no terminal)
npm run android        # Abre no emulador/dispositivo Android
npm run ios            # Abre no simulador iOS
npm run web            # Abre no navegador
npm install            # Instala dependências
npx expo install <pkg> # Instala pacote compatível com a versão do Expo
```
