import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Wallet,
  AccountBalance,
  ContentCopy,
  QrCode,
  Download,
  Check,
  Person,
  Refresh,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

interface PendingTransfer {
  id: string;
  senderName: string;
  senderPhone?: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  convertedAmount: number;
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
  description?: string;
}

const ReceiveMoney: React.FC = () => {
  const theme = useTheme();
  const user = useSelector((state: any) => state.auth.user);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock pending transfers for demo
  useEffect(() => {
    const mockTransfers: PendingTransfer[] = [
      {
        id: 'tx-001',
        senderName: 'John Smith',
        senderPhone: '+1234567890',
        amount: 500,
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
        convertedAmount: 425.50,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        description: 'Payment for consulting services'
      },
      {
        id: 'tx-002',
        senderName: 'Alice Johnson',
        senderPhone: '+9876543210',
        amount: 250,
        sourceCurrency: 'GBP',
        targetCurrency: 'USD',
        convertedAmount: 315.25,
        status: 'processing',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        description: 'Rent payment'
      }
    ];
    setPendingTransfers(mockTransfers);
  }, []);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handleAcceptTransfer = async (transferId: string) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPendingTransfers(prev => 
        prev.map(transfer => 
          transfer.id === transferId 
            ? { ...transfer, status: 'completed' as const }
            : transfer
        )
      );
      
      toast.success('Transfer accepted successfully!');
    } catch (error) {
      toast.error('Failed to accept transfer');
    }
    setLoading(false);
  };

  const handleDeclineTransfer = async (transferId: string) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingTransfers(prev => 
        prev.filter(transfer => transfer.id !== transferId)
      );
      
      toast.success('Transfer declined');
    } catch (error) {
      toast.error('Failed to decline transfer');
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Receive Money
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Share your payment details or manage incoming transfers.
      </Typography>

      <Grid container spacing={3}>
        {/* Payment Details Section */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Your Payment Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Wallet sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Wallet ID
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Share this ID to receive payments
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontFamily="monospace">
                        {user?.id || 'wallet-id-12345'}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(user?.id || 'wallet-id-12345', 'Wallet ID')}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Account Details
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your registered account information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {user?.email}
                    </Typography>
                    {user?.phoneNumber && (
                      <Typography variant="body2">
                        <strong>Phone:</strong> {user.phoneNumber}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<QrCode />}
                  onClick={() => setQrDialogOpen(true)}
                >
                  Generate QR Code
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopy />}
                  onClick={() => {
                    const details = `Payment Details:\nName: ${user?.firstName} ${user?.lastName}\nWallet ID: ${user?.id || 'wallet-id-12345'}\nEmail: ${user?.email}`;
                    handleCopyToClipboard(details, 'Payment details');
                  }}
                >
                  Copy Details
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Pending Transfers */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Pending Transfers
                </Typography>
                <IconButton onClick={() => window.location.reload()}>
                  <Refresh />
                </IconButton>
              </Box>

              {pendingTransfers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No pending transfers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When someone sends you money, it will appear here
                  </Typography>
                </Box>
              ) : (
                <List>
                  {pendingTransfers.map((transfer, index) => (
                    <React.Fragment key={transfer.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {transfer.senderName}
                              </Typography>
                              <Chip
                                label={transfer.status}
                                size="small"
                                color={getStatusColor(transfer.status) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {transfer.amount} {transfer.sourceCurrency} → {transfer.convertedAmount} {transfer.targetCurrency}
                              </Typography>
                              {transfer.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {transfer.description}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(transfer.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {transfer.status === 'pending' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleAcceptTransfer(transfer.id)}
                                disabled={loading}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeclineTransfer(transfer.id)}
                                disabled={loading}
                              >
                                Decline
                              </Button>
                            </Box>
                          )}
                          {transfer.status === 'completed' && (
                            <Check color="success" />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < pendingTransfers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Tips
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  Share your Wallet ID or QR code to receive payments instantly.
                </Alert>
                
                <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                  All incoming transfers are automatically screened for security.
                </Alert>
                
                <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                  Always verify the sender before accepting large transfers.
                </Alert>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Supported Currencies
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'JPY', 'CAD', 'AUD'].map((currency) => (
                  <Chip
                    key={currency}
                    label={currency}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 200,
                mx: 'auto',
                mb: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
              }}
            >
              <QrCode sx={{ fontSize: 80, color: 'primary.main' }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Scan this QR code to get payment details
            </Typography>
            <Typography variant="body2" fontFamily="monospace" sx={{ mt: 1 }}>
              {user?.id || 'wallet-id-12345'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Download QR Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceiveMoney;
