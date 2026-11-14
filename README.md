# HAE · Front-end

Interface do Sistema de controle de Horas de Atividades Específicas (HAE) da Fatec/CPS.

**Stack:** React 19 · TypeScript · Vite · MUI 9 + Tailwind 4 · TanStack Query · React Router · React Hook Form + Zod ·
Vitest + Testing Library.

## Estrutura

```
src/
├── app/          # composição: providers, rotas (lazy), layout, guardas de acesso, tema
├── features/     # uma pasta por funcionalidade (api, componentes, páginas, schemas)
│   ├── auth/  haes/  dashboard/  employees/  institutions/  account/  support/
├── shared/       # cliente HTTP, Problem Details, rótulos de domínio, componentes e hooks comuns
└── test/         # utilitários de teste
```

- **Sessão:** cookie HttpOnly emitido pela API; o front descobre o usuário via `GET /api/v1/me` (nada sensível
  em `localStorage`). CSRF por cookie `XSRF-TOKEN` (o axios envia o header automaticamente).
- **Mesma origem:** o front chama `/api/...`; em dev o Vite faz proxy para `localhost:8080`, em produção a Vercel
  reescreve para o Render (`vercel.json`).
- **Permissões:** o menu e as ações vêm do papel do usuário e do objeto `permissions` retornado pela API — a API é
  quem decide.

## Desenvolvimento

```bash
npm ci
npm run dev           # http://localhost:5173 (suba a API: ver back-hae/README.md)
npm test              # testes
npm run lint && npm run typecheck && npm run format:check
```

## Deploy

GitHub Actions → Vercel CLI: _preview_ a cada PR (URL comentada no PR) e produção em `main`, após lint, tipos,
testes, build, `npm audit`, CodeQL e gitleaks. O deploy automático da integração Git da Vercel fica desligado
(`vercel.json` → `git.deploymentEnabled: false`) para que só código aprovado no CI seja publicado.

Secrets no GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (obtidos com `npx vercel link`, arquivo
`.vercel/project.json`).

> Ajuste o destino do rewrite `/api/:path*` em `vercel.json` para a URL real do serviço no Render.
