import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const ForgotPasswordPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Forgot Password
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            This page is under construction.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
