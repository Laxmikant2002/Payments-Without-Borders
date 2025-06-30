import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarMonth as CalendarIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { User, Address, UserPreferences } from '../types';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [addressDialog, setAddressDialog] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileData, addressesData, preferencesData] = await Promise.all([
        userService.getProfile(),
        userService.getAddresses(),
        userService.getPreferences(),
      ]);
      
      setUser(profileData);
      setAddresses(addressesData);
      setPreferences(preferencesData);
      setProfileForm({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber || '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const updatedUser = await userService.updateProfile(profileForm);
      setUser(updatedUser);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAddress = async () => {
    try {
      const newAddress = await userService.addAddress({
        ...addressForm,
        isDefault: false,
      });
      setAddresses([...addresses, newAddress]);
      setAddressDialog(false);
      setAddressForm({
        type: 'home',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await userService.deleteAddress(addressId);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePreferenceUpdate = async (key: string, value: any) => {
    try {
      const updatedPrefs = await userService.updatePreferences({
        [key]: value,
      });
      setPreferences(updatedPrefs);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
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
          <Alert severity="error">{error || 'Failed to load profile'}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
                  {user.firstName[0]}{user.lastName[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Chip 
                    label={`KYC: ${user.kycStatus}`}
                    color={getKYCStatusColor(user.kycStatus) as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Button
                  startIcon={<EditIcon />}
                  variant={editMode ? "contained" : "outlined"}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              </Box>

              {editMode ? (
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="First Name"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Phone Number"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" onClick={handleProfileUpdate}>
                      Save Changes
                    </Button>
                    <Button variant="outlined" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <List>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText primary="Email" secondary={user.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText primary="Phone" secondary={user.phoneNumber || 'Not provided'} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Date of Birth" 
                      secondary={new Date(user.dateOfBirth).toLocaleDateString()} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationOnIcon /></ListItemIcon>
                    <ListItemText primary="Country" secondary={user.country} />
                  </ListItem>
                </List>
              )}
            </Paper>

            {/* Addresses */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Addresses</Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={() => setAddressDialog(true)}
                >
                  Add Address
                </Button>
              </Box>
              
              {addresses.length === 0 ? (
                <Typography color="text.secondary">No addresses added</Typography>
              ) : (
                addresses.map((address) => (
                  <Card key={address.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                            {address.type} Address
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {address.street}<br />
                            {address.city}, {address.state} {address.postalCode}<br />
                            {address.country}
                          </Typography>
                          {address.isDefault && (
                            <Chip label="Default" color="primary" size="small" sx={{ mt: 1 }} />
                          )}
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Paper>
          </Grid>

          {/* Preferences */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Preferences
              </Typography>
              
              {preferences && (
                <List>
                  <ListItem>
                    <ListItemIcon><LanguageIcon /></ListItemIcon>
                    <ListItemText primary="Language" secondary={preferences.language} />
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText primary="Notification Preferences" />
                  </ListItem>
                  
                  <ListItem sx={{ pl: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.email}
                          onChange={(e) => handlePreferenceUpdate('notifications', {
                            ...preferences.notifications,
                            email: e.target.checked
                          })}
                        />
                      }
                      label="Email Notifications"
                    />
                  </ListItem>
                  
                  <ListItem sx={{ pl: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.sms}
                          onChange={(e) => handlePreferenceUpdate('notifications', {
                            ...preferences.notifications,
                            sms: e.target.checked
                          })}
                        />
                      }
                      label="SMS Notifications"
                    />
                  </ListItem>
                  
                  <ListItem sx={{ pl: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.push}
                          onChange={(e) => handlePreferenceUpdate('notifications', {
                            ...preferences.notifications,
                            push: e.target.checked
                          })}
                        />
                      }
                      label="Push Notifications"
                    />
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.twoFactorEnabled}
                          onChange={(e) => handlePreferenceUpdate('twoFactorEnabled', e.target.checked)}
                        />
                      }
                      label="Two-Factor Authentication"
                    />
                  </ListItem>
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Add Address Dialog */}
        <Dialog open={addressDialog} onClose={() => setAddressDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Address</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                select
                label="Type"
                value={addressForm.type}
                onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as any })}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </TextField>
              <TextField
                label="Street Address"
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                fullWidth
              />
              <TextField
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                fullWidth
              />
              <TextField
                label="State/Province"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                fullWidth
              />
              <TextField
                label="Postal Code"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                fullWidth
              />
              <TextField
                label="Country"
                value={addressForm.country}
                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddressDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAddress} variant="contained">Add Address</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProfilePage;
