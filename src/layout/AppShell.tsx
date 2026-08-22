import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Toolbar,
  Typography,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import PetsIcon from '@mui/icons-material/Pets';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import GrassIcon from '@mui/icons-material/Grass';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABEL, type Role } from '../types/session';
import { SyncStatusBanner } from '../offline/OfflineContext';

const DRAWER = 260;

type NavItem = { to: string; label: string; icon: typeof DashboardIcon; roles?: Role[] };

type NavSection = { title: string; items: NavItem[]; roles?: Role[] };

const SECTIONS: NavSection[] = [
  {
    title: '',
    items: [{ to: '/', label: 'Dashboard', icon: DashboardIcon }],
  },
  {
    title: 'Farm management',
    items: [
      { to: '/animals', label: 'Animals', icon: PetsIcon },
      { to: '/health', label: 'Health', icon: HealthAndSafetyIcon, roles: ['super_admin', 'farm_owner', 'farm_manager', 'veterinarian'] },
      { to: '/feed', label: 'Feeding', icon: GrassIcon, roles: ['super_admin', 'farm_owner', 'farm_manager'] },
      { to: '/breeding', label: 'Breeding', icon: FavoriteIcon, roles: ['super_admin', 'farm_owner', 'farm_manager', 'veterinarian'] },
      { to: '/milking', label: 'Milking', icon: WaterDropIcon, roles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/tasks', label: 'Tasks', icon: AssignmentIcon },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/finance', label: 'Revenue & expenses', icon: PaymentsIcon, roles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant'] },
      { to: '/collection', label: 'Collection', icon: LocalShippingIcon, roles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator'] },
    ],
  },
  {
    title: 'Reports',
    items: [
      { to: '/reports', label: 'Farm reports', icon: AssessmentIcon, roles: ['super_admin', 'farm_owner', 'farm_manager'] },
      { to: '/ai-reports', label: 'AI reports', icon: AutoAwesomeIcon, roles: ['super_admin', 'farm_owner', 'farm_manager'] },
      { to: '/assistant', label: 'AI assistant', icon: AutoAwesomeIcon },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/employees', label: 'Users & people', icon: GroupsIcon, roles: ['super_admin', 'farm_owner'] },
      { to: '/roles', label: 'Roles & permissions', icon: SecurityIcon, roles: ['super_admin', 'farm_owner'] },
      { to: '/subscription', label: 'Subscription', icon: CardMembershipIcon, roles: ['super_admin', 'farm_owner'] },
      { to: '/admin', label: 'Platform', icon: AdminPanelSettingsIcon, roles: ['super_admin'] },
      { to: '/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

export function AppShell() {
  const { user, farm, selectFarm, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const role = farm?.role ?? user?.globalRole ?? 'worker';

  const sections = useMemo(() => {
    return SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(role) || role === 'super_admin',
      ),
    })).filter((s) => s.items.length > 0 && (!s.roles || s.roles.includes(role) || role === 'super_admin'));
  }, [role]);

  function toggleSection(title: string) {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark', color: '#F3F0E8' }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography variant="h5" sx={{ color: '#C4A35A' }}>
          HerdOS
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          Farm management SaaS
        </Typography>
      </Box>
      {user && user.farms.length > 0 ? (
        <Box sx={{ px: 2, pb: 2 }}>
          <Select
            fullWidth
            size="small"
            value={farm?.id ?? ''}
            onChange={(e) => selectFarm(e.target.value)}
            sx={{
              color: '#fff',
              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
              '.MuiSvgIcon-root': { color: '#C4A35A' },
            }}
          >
            {user.farms.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ) : null}
      <List sx={{ px: 1, flex: 1, overflow: 'auto' }}>
        {sections.map((section) => (
          <Box key={section.title || 'root'}>
            {section.title ? (
              <>
                <ListItemButton onClick={() => toggleSection(section.title)} sx={{ borderRadius: 2 }}>
                  <ListItemText primary={section.title} primaryTypographyProps={{ variant: 'caption', sx: { opacity: 0.7, textTransform: 'uppercase' } }} />
                  {openSections[section.title] !== false ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
                <Collapse in={openSections[section.title] !== false}>
                  {section.items.map((item) => {
                    const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to) && item.to !== '/';
                    return (
                      <ListItemButton
                        key={item.to + item.label}
                        selected={active}
                        onClick={() => {
                          navigate(item.to);
                          setMobileOpen(false);
                        }}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          pl: 3,
                          color: active ? '#C4A35A' : 'inherit',
                          '&.Mui-selected': { bgcolor: 'rgba(196,163,90,0.12)' },
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                          <item.icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItemButton>
                    );
                  })}
                </Collapse>
              </>
            ) : (
              section.items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <ListItemButton
                    key={item.to}
                    selected={active}
                    onClick={() => {
                      navigate(item.to);
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      color: active ? '#C4A35A' : 'inherit',
                      '&.Mui-selected': { bgcolor: 'rgba(196,163,90,0.12)' },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                );
              })
            )}
          </Box>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">{user?.fullName}</Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {ROLE_LABEL[role]}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER}px)` },
          ml: { md: `${DRAWER}px` },
          borderBottom: '1px solid rgba(15,61,46,0.08)',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <IconButton aria-label="Open menu" onClick={() => setMobileOpen(true)} sx={{ mr: 1, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography sx={{ flex: 1, minWidth: 120 }} color="text.secondary" noWrap>
            {farm ? `${farm.name} · ${farm.code}` : 'Select a farm'}
          </Typography>
          <SyncStatusBanner />
          <IconButton aria-label="Notifications" onClick={() => navigate('/tasks')}>
            <Badge color="warning" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Account">
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {user?.fullName?.slice(0, 1)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => { setAnchor(null); navigate('/settings'); }}>Settings</MenuItem>
            <MenuItem onClick={() => { setAnchor(null); void logout(); }}>Sign out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: DRAWER }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER, border: 0 } }} open>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { md: `calc(100% - ${DRAWER}px)` }, mt: 9, maxWidth: 1440 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
