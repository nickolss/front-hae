import { Link } from "react-router-dom";

interface SidebarItemProps {
  to: string;
  icon: React.ReactElement;
  text: string;
  active?: boolean;
}

export const SidebarItem = ({
  to,
  icon,
  text,
  active = false,
}: SidebarItemProps) => (
  <li
    className={`text-white flex items-center gap-2 px-2 py-2 rounded-md transition-colors
      ${active ? "bg-white/20" : "hover:bg-white/10"}
    `}
  >
    <span className="text-white mb-0.5">{icon}</span>
    <Link
      to={to}
      className="w-full t "
      style={{ fontSize: window.innerWidth > 1280 ? "1rem" : "0.75rem" }}
    >
      {text}
    </Link>
  </li>
);
