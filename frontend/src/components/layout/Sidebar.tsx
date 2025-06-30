import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Send as SendIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as AdminIcon,
  Support as SupportIcon,
  CurrencyExchange as ExchangeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const drawerWidth = 280;

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Send Money', icon: <SendIcon />, path: '/send' },
  { text: 'Transactions', icon: <HistoryIcon />, path: '/transactions' },
  { text: 'Cross-Border', icon: <ExchangeIcon />, path: '/cross-border' },
  { text: 'Exchange Rates', icon: <TrendingUpIcon />, path: '/rates' },
];

const userMenuItems: MenuItem[] = [
  { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  { text: 'KYC Verification', icon: <VerifiedUserIcon />, path: '/kyc' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', badge: 4 },
];

const adminMenuItems: MenuItem[] = [
  { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin', adminOnly: true },
  { text: 'User Management', icon: <PersonIcon />, path: '/admin/users', adminOnly: true },
  { text: 'KYC Review', icon: <VerifiedUserIcon />, path: '/admin/kyc', adminOnly: true },
  { text: 'System Health', icon: <AccountBalanceIcon />, path: '/admin/health', adminOnly: true },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.role === 'admin';

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      onDrawerToggle();
    }
  };

  const renderMenuItems = (items: MenuItem[], title?: string) => (
    <>
      {title && (
        <Box sx={{ px: 2, py: 1 }}>
          <ListItemText 
            primary={title} 
            primaryTypographyProps={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          />
        </Box>
      )}
      <List sx={{ py: 0 }}>
        {items.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                  color: isActive ? theme.palette.primary.contrastText : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? theme.palette.primary.dark 
                      : theme.palette.action.hover,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                    minWidth: 40,
                  }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      
      <Box sx={{ overflow: 'auto', flexGrow: 1, py: 1 }}>
        {renderMenuItems(menuItems, 'Main')}
        
        <Divider sx={{ my: 2, mx: 2 }} />
        
        {renderMenuItems(userMenuItems, 'Account')}
        
        {isAdmin && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
            {renderMenuItems(adminMenuItems, 'Administration')}
          </>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => handleNavigation('/support')}
          sx={{
            borderRadius: 2,
            backgroundColor: theme.palette.action.hover,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SupportIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Support"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(180deg, rgba(18,18,18,0.95) 0%, rgba(18,18,18,1) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,1) 100%)',
            backdropFilter: 'blur(10px)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
