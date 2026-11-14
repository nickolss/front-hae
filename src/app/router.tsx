import { createBrowserRouter } from "react-router";
import { PublicOnly, RequireAuth, RequireRole } from "./guards";
import { AppShell } from "./layout/AppShell";
import { RouteErrorPage, NotFoundPage } from "./ErrorPages";

const MANAGERS = ["COORDENADOR", "DIRETOR", "ADMIN", "DEV"] as const;
const AUTHORS = ["PROFESSOR", "COORDENADOR", "DIRETOR"] as const;
const GLOBAL = ["ADMIN", "DEV"] as const;
const INSTITUTION_MANAGERS = ["DIRETOR", "ADMIN", "DEV"] as const;

/** Cada página é carregada sob demanda (code splitting por rota). */
export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PublicOnly />,
        children: [
          {
            path: "/login",
            lazy: async () => ({ Component: (await import("@/features/auth/pages/LoginPage")).LoginPage }),
          },
          {
            path: "/cadastro",
            lazy: async () => ({
              Component: (await import("@/features/auth/pages/RegisterPage")).RegisterPage,
            }),
          },
          {
            path: "/esqueci-senha",
            lazy: async () => ({
              Component: (await import("@/features/auth/pages/ForgotPasswordPage")).ForgotPasswordPage,
            }),
          },
        ],
      },
      {
        path: "/ativar-conta",
        lazy: async () => ({ Component: (await import("@/features/auth/pages/ActivatePage")).ActivatePage }),
      },
      {
        path: "/redefinir-senha",
        lazy: async () => ({
          Component: (await import("@/features/auth/pages/ResetPasswordPage")).ResetPasswordPage,
        }),
      },
      {
        element: (
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import("@/features/dashboard/HomePage")).HomePage }),
          },
          {
            element: <RequireRole roles={[...AUTHORS]} />,
            children: [
              {
                path: "/haes/nova",
                lazy: async () => ({
                  Component: (await import("@/features/haes/pages/HaeFormPage")).NewHaePage,
                }),
              },
              {
                path: "/minhas-haes",
                lazy: async () => ({
                  Component: (await import("@/features/haes/pages/MyHaesPage")).MyHaesPage,
                }),
              },
            ],
          },
          {
            path: "/haes/:id",
            lazy: async () => ({
              Component: (await import("@/features/haes/pages/HaeDetailPage")).HaeDetailPage,
            }),
          },
          {
            path: "/haes/:id/editar",
            lazy: async () => ({
              Component: (await import("@/features/haes/pages/HaeFormPage")).EditHaePage,
            }),
          },
          {
            element: <RequireRole roles={[...MANAGERS]} />,
            children: [
              {
                path: "/haes",
                lazy: async () => ({
                  Component: (await import("@/features/haes/pages/HaeListPage")).HaeListPage,
                }),
              },
              {
                path: "/funcionarios",
                lazy: async () => ({
                  Component: (await import("@/features/employees/EmployeesPage")).EmployeesPage,
                }),
              },
            ],
          },
          {
            element: <RequireRole roles={[...GLOBAL]} />,
            children: [
              {
                path: "/instituicoes",
                lazy: async () => ({
                  Component: (await import("@/features/institutions/InstitutionsPage")).InstitutionsPage,
                }),
              },
            ],
          },
          {
            element: <RequireRole roles={[...INSTITUTION_MANAGERS]} />,
            children: [
              {
                path: "/instituicoes/:id",
                lazy: async () => ({
                  Component: (await import("@/features/institutions/InstitutionDetailPage"))
                    .InstitutionDetailPage,
                }),
              },
            ],
          },
          {
            path: "/conta",
            lazy: async () => ({ Component: (await import("@/features/account/AccountPage")).AccountPage }),
          },
          {
            path: "/suporte",
            lazy: async () => ({ Component: (await import("@/features/support/SupportPage")).SupportPage }),
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
