import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Divider,
  Menu,
  MenuItem,
  Badge,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    unread: false,
    types: [] as string[],
  });

  const notificationTypes = [
    { value: 'transaction', label: 'Transactions', icon: <PaymentIcon />, color: 'primary' },
    { value: 'security', label: 'Security', icon: <SecurityIcon />, color: 'error' },
    { value: 'system', label: 'System', icon: <InfoIcon />, color: 'info' },
    { value: 'kyc', label: 'KYC', icon: <WarningIcon />, color: 'warning' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryParams = {
          page: 1,
          limit: 50,
        };
        
        const notificationFilters: any = {};
        if (filters.unread) notificationFilters.unread = filters.unread;
        if (filters.types.length > 0) notificationFilters.type = filters.types;

        const response = await notificationService.getNotifications(notificationFilters, queryParams);
        setNotifications(response.data?.items || response.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err: any) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchData();
    fetchCount();
  }, [tabValue, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: 1,
        limit: 50,
      };
      
      const notificationFilters: any = {};
      if (filters.unread) notificationFilters.unread = filters.unread;
      if (filters.types.length > 0) notificationFilters.type = filters.types;

      const response = await notificationService.getNotifications(notificationFilters, queryParams);
      setNotifications(response.data?.items || response.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      fetchUnreadCount();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      fetchUnreadCount();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig?.icon || <InfoIcon />;
  };

  const getNotificationColor = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig?.color || 'default';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (tabValue === 1 && notification.isRead) return false; // Unread tab
    if (tabValue === 2 && !notification.isRead) return false; // Read tab
    return true;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading && notifications.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<FilterIcon />}
              variant="outlined"
              onClick={() => setFilterDialog(true)}
            >
              Filter
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              onClick={fetchNotifications}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              startIcon={<MarkReadIcon />}
              variant="contained"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab 
                label={
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                    All
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                    Unread
                  </Badge>
                } 
              />
              <Tab label="Read" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {filteredNotifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                        '&:hover': { backgroundColor: 'action.selected' },
                      }}
                    >
                      <ListItemIcon>
                        <Box sx={{ position: 'relative' }}>
                          {getNotificationIcon(notification.type)}
                          {notification.priority === 'high' && (
                            <Box sx={{ position: 'absolute', top: -4, right: -4 }}>
                              <ErrorIcon color="error" sx={{ fontSize: 12 }} />
                            </Box>
                          )}
                        </Box>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                              {notification.title}
                            </Typography>
                            <Chip 
                              label={notification.type}
                              size="small"
                              color={getNotificationColor(notification.type) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {!notification.isRead && (
                            <IconButton
                              edge="end"
                              onClick={() => handleMarkAsRead(notification.id)}
                              size="small"
                            >
                              <MarkReadIcon />
                            </IconButton>
                          )}
                          <IconButton
                            edge="end"
                            onClick={(e) => handleMenuClick(e, notification.id)}
                            size="small"
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {filteredNotifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No unread notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Great! You're all caught up.
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        backgroundColor: 'action.hover',
                        '&:hover': { backgroundColor: 'action.selected' },
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {notification.title}
                            </Typography>
                            <Chip 
                              label={notification.type}
                              size="small"
                              color={getNotificationColor(notification.type) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            edge="end"
                            onClick={() => handleMarkAsRead(notification.id)}
                            size="small"
                          >
                            <MarkReadIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={(e) => handleMenuClick(e, notification.id)}
                            size="small"
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {filteredNotifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No read notifications
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1">
                              {notification.title}
                            </Typography>
                            <Chip 
                              label={notification.type}
                              size="small"
                              color={getNotificationColor(notification.type) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => handleMenuClick(e, notification.id)}
                          size="small"
                        >
                          <MoreIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < filteredNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </TabPanel>
        </Paper>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem 
            onClick={() => {
              if (selectedNotification) {
                handleMarkAsRead(selectedNotification);
              }
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <MarkReadIcon fontSize="small" />
            </ListItemIcon>
            Mark as Read
          </MenuItem>
          <MenuItem 
            onClick={() => {
              if (selectedNotification) {
                handleDeleteNotification(selectedNotification);
              }
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>

        {/* Filter Dialog */}
        <Dialog open={filterDialog} onClose={() => setFilterDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Notifications</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.unread}
                    onChange={(e) => setFilters({ ...filters, unread: e.target.checked })}
                  />
                }
                label="Show only unread notifications"
              />
              
              <Typography variant="subtitle2">Notification Types:</Typography>
              {notificationTypes.map((type) => (
                <FormControlLabel
                  key={type.value}
                  control={
                    <Switch
                      checked={filters.types.includes(type.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, types: [...filters.types, type.value] });
                        } else {
                          setFilters({ ...filters, types: filters.types.filter(t => t !== type.value) });
                        }
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  }
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilters({ unread: false, types: [] })}>
              Clear All
            </Button>
            <Button onClick={() => setFilterDialog(false)}>
              Close
            </Button>
            <Button onClick={() => { setFilterDialog(false); fetchNotifications(); }} variant="contained">
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default NotificationsPage;
