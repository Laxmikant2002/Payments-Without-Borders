import React from 'react';
import { Box, Typography } from '@mui/material';

const RegisterPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        <Typography variant="body1">
          Registration page coming soon...
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
