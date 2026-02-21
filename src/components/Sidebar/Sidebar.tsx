import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthForms } from "@/hooks/useAuthForms";
import { authService } from "@/services";
import {
  ArticleOutlined,
  DashboardOutlined,
  PeopleOutline,
  BarChartOutlined,
  ListAltOutlined,
  AdminPanelSettingsOutlined,
  SettingsOutlined,
  AlternateEmail,
  AddBusinessOutlined,
  BusinessOutlined,
} from "@mui/icons-material";
import { SidebarItem } from "./SidebarItem";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { handleLogout } = useAuthForms(authService);

  const onLogout = async () => {
    if (await handleLogout()) {
      navigate("/login");
    }
  };

  const renderNavLinks = () => {
    if (!user) return null;

    const currentPath = location.pathname;
    const isActive = (path: string) => currentPath === path;

    switch (user.role) {
      case "PROFESSOR":
        return (
          <>
            <SidebarItem
              to="/dashboard"
              icon={<DashboardOutlined sx={{ fill: "white" }} />}
              text="Minha Visão Geral"
              active={isActive("/dashboard")}
            />
            <SidebarItem
              to="/requestHae"
              icon={<ArticleOutlined sx={{ fill: "white" }} />}
              text="Solicitar HAE"
              active={isActive("/requestHae")}
            />
            <SidebarItem
              to="/myrequests"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="Minhas Solicitações"
              active={isActive("/myrequests")}
            />
            <SidebarItem
              to="/support"
              icon={<AlternateEmail sx={{ fill: "white" }} />}
              text="Entre Em Contato"
              active={isActive("/support")}
            />
          </>
        );
      case "COORDENADOR":
        return (
          <>
            <SidebarItem
              to="/dashboard-coordenador"
              icon={<DashboardOutlined sx={{ fill: "white" }} />}
              text="Visão Geral (Curso)"
              active={isActive("/dashboard-coordenador")}
            />
            <SidebarItem
              to="/requestHae"
              icon={<ArticleOutlined sx={{ fill: "white" }} />}
              text="Solicitar HAE"
              active={isActive("/requestHae")}
            />
            <SidebarItem
              to="/myrequests"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="Minhas Solicitações"
              active={isActive("/myrequests")}
            />
            <SidebarItem
              to="/closure-requests"
              icon={<ArticleOutlined sx={{ fill: "white" }} />}
              text="Solicitações de Fechamento"
              active={isActive("/closure-requests")}
            />
            <SidebarItem
              to="/approved-haes"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="HAEs Aprovadas"
              active={isActive("/approved-haes")}
            />
            <SidebarItem
              to="/support"
              icon={<AlternateEmail sx={{ fill: "white" }} />}
              text="Entre Em Contato"
              active={isActive("/support")}
            />
          </>
        );
      case "ADMIN":
        return (
          <>
            <SidebarItem
              to="/dashboard-admin"
              icon={<DashboardOutlined sx={{ fill: "white" }} />}
              text="Visão Geral"
              active={isActive("/dashboard-admin")}
            />
            <SidebarItem
              to="/gerenciar-usuarios"
              icon={<AdminPanelSettingsOutlined sx={{ fill: "white" }} />}
              text="Gerenciar Usuários"
              active={isActive("/gerenciar-usuarios")}
            />
            <SidebarItem
              to="/requestHae"
              icon={<ArticleOutlined sx={{ fill: "white" }} />}
              text="Solicitar HAE"
              active={isActive("/requestHae")}
            />
            <SidebarItem
              to="/myrequests"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="Minhas Solicitações"
              active={isActive("/myrequests")}
            />
            <SidebarItem
              to="/support"
              icon={<AlternateEmail sx={{ fill: "white" }} />}
              text="Entre Em Contato"
              active={isActive("/support")}
            />
          </>
        );
      case "DIRETOR":
        return (
          <>
            <SidebarItem
              to="/dashboard-diretor"
              icon={<BarChartOutlined sx={{ fill: "white" }} />}
              text="Dashboard Geral"
              active={isActive("/dashboard-diretor")}
            />
            <SidebarItem
              to="/haes"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="Visualizar HAEs"
              active={isActive("/haes")}
            />
            <SidebarItem
              to="/professores"
              icon={<PeopleOutline sx={{ fill: "white" }} />}
              text="Visualizar Professores"
              active={isActive("/professores")}
            />
            <SidebarItem
              to="/coordenadores"
              icon={<PeopleOutline sx={{ fill: "white" }} />}
              text="Visualizar Coordenadores"
              active={isActive("/coordenadores")}
            />
            <SidebarItem
              to="/approved-haes"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="HAEs Aprovadas"
              active={isActive("/approved-haes")}
            />
            <SidebarItem
              to="/configuracoes"
              icon={<SettingsOutlined sx={{ fill: "white" }} />}
              text="Configurações"
              active={isActive("/configuracoes")}
            />
            <SidebarItem
              to="/support"
              icon={<AlternateEmail sx={{ fill: "white" }} />}
              text="Entre Em Contato"
              active={isActive("/support")}
            />
          </>
        );
      case "DEV":
        return (
          <>
            <SidebarItem
              to="/dashboard-dev"
              icon={<DashboardOutlined sx={{ fill: "white" }} />}
              text="Painel DEV"
              active={isActive("/dashboard-dev")}
            />
            <SidebarItem
              to="/gerenciar-usuarios"
              icon={<AdminPanelSettingsOutlined sx={{ fill: "white" }} />}
              text="Gerenciar Usuários"
              active={isActive("/gerenciar-usuarios")}
            />
            <SidebarItem
              to="/allHaes"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="Todas as HAEs"
              active={isActive("/allHaes")}
            />
            <SidebarItem
              to="/requestHae"
              icon={<ArticleOutlined sx={{ fill: "white" }} />}
              text="Solicitar HAE"
              active={isActive("/requestHae")}
            />
            <SidebarItem
              to="/myrequests"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="Minhas Solicitações"
              active={isActive("/myrequests")}
            />
            <SidebarItem
              to="/professores"
              icon={<PeopleOutline sx={{ fill: "white" }} />}
              text="Todos os Professores"
              active={isActive("/professores")}
            />
            <SidebarItem
              to="/coordenadores"
              icon={<PeopleOutline sx={{ fill: "white" }} />}
              text="Visualizar Coordenadores"
              active={isActive("/coordenadores")}
            />
            <SidebarItem
              to="/create-institution"
              icon={<AddBusinessOutlined sx={{ fill: "white" }} />}
              text="Criar Instituição"
              active={isActive("/create-institution")}
            />
            <SidebarItem
              to="/institutions"
              icon={<BusinessOutlined sx={{ fill: "white" }} />}
              text="Gerenciar Instituições"
              active={isActive("/institutions")}
            />
            <SidebarItem
              to="/approved-haes"
              icon={<ListAltOutlined sx={{ fill: "white" }} />}
              text="HAEs Aprovadas"
              active={isActive("/approved-haes")}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside>
      <div className="h-screen  bg-gray-fatec flex flex-col items-center  ">
        <img
          src="/fatec_zona_leste_icon_branco.png"
          alt="Logo da Fatec da Zona Leste"
          className="xl:w-50 w-25 p-4"
        />
        <nav className="w-full h-full items-center">
          <ul className="flex flex-col gap-2.5  ">{renderNavLinks()}</ul>
        </nav>

        <button
          onClick={onLogout}
          className="btnFatec mb-4 px-3 py-2 text-white uppercase bg-red-800 hover:bg-red-900"
        >
          Sair da Conta
        </button>
      </div>
    </aside>
  );
};
