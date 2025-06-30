import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ExchangeRatesPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Exchange Rates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is under construction.
        </Typography>
      </Box>
    </Container>
  );
};

export default ExchangeRatesPage;
