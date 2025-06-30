import React from 'react';
import { Box, Typography } from '@mui/material';

const LoginPage: React.FC = () => {
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
          Login
        </Typography>
        <Typography variant="body1">
          Login page coming soon...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
