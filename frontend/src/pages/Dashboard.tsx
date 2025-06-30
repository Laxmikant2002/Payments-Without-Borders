import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Button,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Send,
  Receipt,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Mock data
const chartData = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 1398 },
  { name: 'Mar', value: 9800 },
  { name: 'Apr', value: 3908 },
  { name: 'May', value: 4800 },
  { name: 'Jun', value: 3800 },
];

const recentTransactions = [
  { id: 1, type: 'sent', recipient: 'John Doe', amount: -150.00, currency: 'USD', status: 'completed', date: '2 hours ago' },
  { id: 2, type: 'received', recipient: 'Sarah Smith', amount: 320.50, currency: 'EUR', status: 'completed', date: '1 day ago' },
  { id: 3, type: 'sent', recipient: 'Mike Johnson', amount: -75.25, currency: 'USD', status: 'pending', date: '2 days ago' },
  { id: 4, type: 'received', recipient: 'Anna Wilson', amount: 500.00, currency: 'GBP', status: 'completed', date: '3 days ago' },
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.5)} 100%)`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {changeType === 'up' ? <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 16 }} /> : <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 16 }} />}
            <Typography variant="body2" color={changeType === 'up' ? 'success.main' : 'error.main'} fontWeight={600}>
              {change}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const stats = [
    {
      title: 'Total Balance',
      value: balanceVisible ? '$12,450.00' : '••••••',
      change: '+12.5%',
      changeType: 'up' as const,
      icon: <AccountBalance />,
      color: theme.palette.primary.main,
    },
    {
      title: 'This Month Sent',
      value: '$3,240.50',
      change: '+8.2%',
      changeType: 'up' as const,
      icon: <ArrowUpward />,
      color: theme.palette.error.main,
    },
    {
      title: 'This Month Received',
      value: '$5,680.75',
      change: '+15.3%',
      changeType: 'up' as const,
      icon: <ArrowDownward />,
      color: theme.palette.success.main,
    },
    {
      title: 'Pending Transactions',
      value: '3',
      change: '-2',
      changeType: 'down' as const,
      icon: <Receipt />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your payments today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Balance Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Balance Overview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setBalanceVisible(!balanceVisible)}
                  >
                    {balanceVisible ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  sx={{ 
                    borderRadius: 3,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                  }}
                >
                  Send Money
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Receipt />}
                  sx={{ borderRadius: 3, py: 1.5 }}
                >
                  Request Payment
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<TrendingUp />}
                  sx={{ borderRadius: 3, py: 1.5 }}
                >
                  View Analytics
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Exchange Rates (Live)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">USD → EUR</Typography>
                    <Chip label="0.85" size="small" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">USD → GBP</Typography>
                    <Chip label="0.73" size="small" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">USD → JPY</Typography>
                    <Chip label="110.25" size="small" color="error" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Transactions
                </Typography>
                <Button variant="text" size="small">
                  View All
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentTransactions.map((transaction) => (
                  <Box
                    key={transaction.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: theme.palette.action.hover,
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: transaction.type === 'sent' ? theme.palette.error.main : theme.palette.success.main,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {transaction.type === 'sent' ? <ArrowUpward /> : <ArrowDownward />}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {transaction.recipient}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.date}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color={transaction.type === 'sent' ? 'error.main' : 'success.main'}
                      >
                        {transaction.type === 'sent' ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)} {transaction.currency}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        size="small"
                        color={transaction.status === 'completed' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
