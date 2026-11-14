import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logout from "@mui/icons-material/Logout";
import { navigationFor } from "@/app/navigation";
import { useLogout, useUser } from "@/features/auth/session";
import { ROLE_LABELS } from "@/shared/domain/labels";

const DRAWER_WIDTH = 264;

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  if (to === "/haes") return pathname === "/haes";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell() {
  const user = useUser();
  const logout = useLogout();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const groups = navigationFor(user);

  const drawer = (
    <Box
      component="nav"
      aria-label="Menu principal"
      sx={{ height: "100%", bgcolor: "secondary.main", color: "#fff" }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <Box component="img" src="/logo_fatec_br.png" alt="" sx={{ height: 32 }} />
        <Typography component="span" sx={{ fontWeight: 700, color: "#fff" }}>
          Sistema de HAEs
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
      {groups.map((group, i) => (
        <List
          key={group.title ?? i}
          dense
          subheader={
            group.title ? (
              <ListSubheader disableSticky sx={{ bgcolor: "transparent", color: "rgba(255,255,255,0.75)" }}>
                {group.title}
              </ListSubheader>
            ) : undefined
          }
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  color: "#fff",
                  "&[aria-current='page']": { bgcolor: "rgba(255,255,255,0.18)", fontWeight: 700 },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                  "&.Mui-focusVisible": { outline: "2px solid #fff" },
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, display: { md: "none" } }}
            aria-label="Abrir menu"
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            {user.institution && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.institution.name}
              </Typography>
            )}
          </Box>
          <Tooltip title="Conta e sair">
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label={`Menu da conta de ${user.name}`}
              aria-haspopup="menu"
              aria-expanded={menuAnchor ? "true" : undefined}
            >
              <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34, fontSize: 15 }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={menuAnchor} open={menuAnchor !== null} onClose={() => setMenuAnchor(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {ROLE_LABELS[user.role]} · {user.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem component={NavLink} to="/conta" onClick={() => setMenuAnchor(null)}>
              Minha conta
            </MenuItem>
            <MenuItem onClick={() => logout.mutate()} disabled={logout.isPending}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: 0 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        id="conteudo"
        tabIndex={-1}
        sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, lg: 4 }, mt: 8, outline: "none" }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
