import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Upload as UploadIcon,
  Description as DocumentIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { User } from '../types';

const KYCPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: '',
    number: '',
    additionalInfo: '',
    file: null as File | null,
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  const kycSteps = [
    {
      label: 'Document Upload',
      description: 'Upload required identification documents',
    },
    {
      label: 'Verification',
      description: 'Our team reviews your documents',
    },
    {
      label: 'Approval',
      description: 'KYC verification complete',
    },
  ];

  const documentTypes = [
    { value: 'passport', label: 'Passport' },
    { value: 'driver_license', label: "Driver's License" },
    { value: 'national_id', label: 'National ID Card' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'bank_statement', label: 'Bank Statement' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfile();
      setUser(profileData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          color: 'success' as const,
          icon: <CheckIcon />,
          title: 'KYC Approved',
          description: 'Your identity has been successfully verified.',
          step: 2,
        };
      case 'pending':
        return {
          color: 'warning' as const,
          icon: <PendingIcon />,
          title: 'KYC Pending',
          description: 'Your documents are being reviewed. This usually takes 1-3 business days.',
          step: 1,
        };
      case 'under_review':
        return {
          color: 'info' as const,
          icon: <PendingIcon />,
          title: 'KYC Under Review',
          description: 'Your documents are currently being processed.',
          step: 1,
        };
      case 'rejected':
        return {
          color: 'error' as const,
          icon: <ErrorIcon />,
          title: 'KYC Rejected',
          description: 'Your documents were rejected. Please upload new documents.',
          step: 0,
        };
      case 'expired':
        return {
          color: 'warning' as const,
          icon: <WarningIcon />,
          title: 'KYC Expired',
          description: 'Your KYC verification has expired. Please submit new documents.',
          step: 0,
        };
      default:
        return {
          color: 'default' as const,
          icon: <WarningIcon />,
          title: 'KYC Required',
          description: 'Please complete your KYC verification to access all features.',
          step: 0,
        };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleDocumentSubmit = async () => {
    if (!uploadForm.type || !uploadForm.number || !uploadForm.file) {
      setError('Please fill all required fields and select a file');
      return;
    }

    try {
      setUploadLoading(true);
      
      // In a real implementation, you would upload the file and submit KYC documents
      // For now, we'll simulate this process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadDialog(false);
      setUploadForm({
        type: '',
        number: '',
        additionalInfo: '',
        file: null,
      });
      
      // Refresh user data
      await fetchUserData();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Alert severity="error">{error || 'Failed to load KYC information'}</Alert>
        </Box>
      </Container>
    );
  }

  const statusInfo = getKYCStatusInfo(user.kycStatus);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          KYC Verification
        </Typography>

        <Grid container spacing={3}>
          {/* Status Overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {statusInfo.icon}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">{statusInfo.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statusInfo.description}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Chip 
                  label={user.kycStatus.toUpperCase()}
                  color={statusInfo.color}
                  variant="outlined"
                />
              </Box>

              {user.kycStatus === 'rejected' && user.kycRejectionReason && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Rejection Reason:</Typography>
                  <Typography variant="body2">{user.kycRejectionReason}</Typography>
                </Alert>
              )}

              {/* Progress Bar */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Verification Progress
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(statusInfo.step / 2) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* KYC Process Steps */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Verification Process
              </Typography>
              
              <Stepper activeStep={statusInfo.step} orientation="vertical">
                {kycSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>
                      <Typography variant="subtitle1">{step.label}</Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      {index === 0 && user.kycStatus !== 'approved' && (
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<UploadIcon />}
                            onClick={() => setUploadDialog(true)}
                            disabled={user.kycStatus === 'under_review'}
                          >
                            {user.kycDocuments ? 'Upload New Documents' : 'Upload Documents'}
                          </Button>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>

          {/* Document Information */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Document Requirements
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DocumentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Government ID"
                    secondary="Passport, Driver's License, or National ID"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DocumentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Proof of Address"
                    secondary="Utility bill or bank statement (less than 3 months old)"
                  />
                </ListItem>
              </List>

              {user.kycDocuments && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Submitted Documents
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2">
                        <strong>Type:</strong> {user.kycDocuments.type}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Number:</strong> {user.kycDocuments.number}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Submitted:</strong> {new Date(user.kycDocuments.submittedAt).toLocaleDateString()}
                      </Typography>
                      {user.kycDocuments.additionalInfo && (
                        <Typography variant="body2">
                          <strong>Notes:</strong> {user.kycDocuments.additionalInfo}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Alert severity="info" variant="outlined">
                  <Typography variant="body2">
                    • Documents must be clear and readable<br/>
                    • File formats: JPG, PNG, PDF<br/>
                    • Maximum file size: 10MB<br/>
                    • No screenshots or photocopies
                  </Typography>
                </Alert>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Upload Dialog */}
        <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload KYC Documents</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={uploadForm.type}
                  label="Document Type"
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Document Number"
                value={uploadForm.number}
                onChange={(e) => setUploadForm({ ...uploadForm, number: e.target.value })}
                fullWidth
                helperText="Enter the ID/reference number from your document"
              />
              
              <TextField
                label="Additional Information (Optional)"
                value={uploadForm.additionalInfo}
                onChange={(e) => setUploadForm({ ...uploadForm, additionalInfo: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button variant="outlined" component="span" startIcon={<UploadIcon />} fullWidth>
                    {uploadForm.file ? uploadForm.file.name : 'Choose File'}
                  </Button>
                </label>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialog(false)} disabled={uploadLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDocumentSubmit} 
              variant="contained" 
              disabled={uploadLoading || !uploadForm.type || !uploadForm.number || !uploadForm.file}
            >
              {uploadLoading ? <CircularProgress size={20} /> : 'Submit Documents'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default KYCPage;
