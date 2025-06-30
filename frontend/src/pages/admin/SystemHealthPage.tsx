import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const SystemHealthPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Health
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is under construction.
        </Typography>
      </Box>
    </Container>
  );
};

export default SystemHealthPage;
