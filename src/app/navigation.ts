import type { SvgIconComponent } from "@mui/icons-material";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import ListAltOutlined from "@mui/icons-material/ListAltOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import PeopleOutline from "@mui/icons-material/PeopleAltOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import type { Profile } from "@/features/auth/api";
import { canManageInstitution, canViewInstitution, isGlobal } from "@/shared/domain/labels";

export interface NavItem {
  label: string;
  to: string;
  icon: SvgIconComponent;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

/** Menu montado a partir do papel do usuário (mostra apenas o que ele pode usar). */
export function navigationFor(user: Profile): NavGroup[] {
  const groups: NavGroup[] = [{ items: [{ label: "Início", to: "/", icon: DashboardOutlined }] }];

  if (!isGlobal(user.role)) {
    groups.push({
      title: "Minhas HAEs",
      items: [
        { label: "Nova HAE", to: "/haes/nova", icon: NoteAddOutlined },
        { label: "Minhas HAEs", to: "/minhas-haes", icon: ListAltOutlined },
      ],
    });
  }

  if (canViewInstitution(user.role)) {
    const management: NavItem[] = [
      {
        label: isGlobal(user.role) ? "Todas as HAEs" : "HAEs da unidade",
        to: "/haes",
        icon: FactCheckOutlined,
      },
      { label: "Funcionários", to: "/funcionarios", icon: PeopleOutline },
    ];
    if (isGlobal(user.role)) {
      management.push({ label: "Instituições", to: "/instituicoes", icon: BusinessOutlined });
    } else if (canManageInstitution(user.role) && user.institution) {
      management.push({
        label: "Minha unidade",
        to: `/instituicoes/${user.institution.id}`,
        icon: BusinessOutlined,
      });
    }
    groups.push({ title: "Gestão", items: management });
  }

  groups.push({
    title: "Conta",
    items: [
      { label: "Minha conta", to: "/conta", icon: AccountCircleOutlined },
      { label: "Suporte", to: "/suporte", icon: SupportAgentOutlined },
    ],
  });
  return groups;
}
