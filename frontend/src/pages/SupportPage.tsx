import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Chat as ChatIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  QuestionAnswer as FAQIcon,
  Feedback as FeedbackIcon,
  LiveHelp as LiveHelpIcon,
  Send as SendIcon,
} from '@mui/icons-material';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  subject: string;
  description: string;
  category: string;
  priority: string;
}

const SupportPage: React.FC = () => {
  const [contactDialog, setContactDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [supportTicket, setSupportTicket] = useState<SupportTicket>({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });

  const [feedback, setFeedback] = useState({
    type: 'general',
    message: '',
    rating: 5,
  });

  const supportCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'account', label: 'Account Issues' },
    { value: 'payment', label: 'Payment Problems' },
    { value: 'kyc', label: 'KYC Verification' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'security', label: 'Security Concerns' },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I verify my account (KYC)?',
      answer: 'To verify your account, go to the KYC Verification page and upload a valid government-issued ID and proof of address. Our team will review your documents within 1-3 business days.',
      category: 'kyc',
    },
    {
      id: '2',
      question: 'What are the transaction fees?',
      answer: 'Transaction fees vary based on the payment method and amount. Domestic transfers typically have a flat fee of $1-3, while international transfers may have additional exchange rate fees.',
      category: 'payment',
    },
    {
      id: '3',
      question: 'How long do international transfers take?',
      answer: 'International transfers usually take 1-3 business days to complete, depending on the destination country and local banking systems.',
      category: 'payment',
    },
    {
      id: '4',
      question: 'Is my money safe with your platform?',
      answer: 'Yes, we use bank-level security measures including encryption, two-factor authentication, and regulatory compliance to protect your funds and data.',
      category: 'security',
    },
    {
      id: '5',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email to reset your password.',
      category: 'account',
    },
    {
      id: '6',
      question: 'Can I cancel a transaction?',
      answer: 'Transactions can only be cancelled if they are still in "pending" status. Once a transaction is being processed or completed, it cannot be cancelled.',
      category: 'payment',
    },
  ];

  const handleSubmitTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Your support ticket has been submitted successfully. We\'ll get back to you within 24 hours.');
      setSupportTicket({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
      });
      setContactDialog(false);
    } catch (err: any) {
      setError('Failed to submit support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Thank you for your feedback! Your input helps us improve our service.');
      setFeedback({
        type: 'general',
        message: '',
        rating: 5,
      });
      setFeedbackDialog(false);
    } catch (err: any) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Help & Support
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              How can we help you?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ChatIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Live Chat
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get instant help from our support team
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    <Button size="small" variant="contained" startIcon={<LiveHelpIcon />}>
                      Start Chat
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EmailIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Contact Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submit a ticket for detailed assistance
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<EmailIcon />}
                      onClick={() => setContactDialog(true)}
                    >
                      Contact Us
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PhoneIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Call Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Speak directly with our team
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    <Button size="small" variant="contained" startIcon={<PhoneIcon />}>
                      Call Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <FeedbackIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Send Feedback
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Help us improve our service
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center' }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<FeedbackIcon />}
                      onClick={() => setFeedbackDialog(true)}
                    >
                      Give Feedback
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Support" 
                    secondary="support@payhack.com"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone Support" 
                    secondary="+1 (555) 123-4567"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ChatIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Live Chat" 
                    secondary="Available 24/7"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Support Hours
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                  Saturday: 10:00 AM - 4:00 PM EST<br />
                  Sunday: Closed
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* FAQ Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FAQIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Frequently Asked Questions
                </Typography>
              </Box>
              
              {faqs.map((faq) => (
                <Accordion key={faq.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {faq.question}
                      </Typography>
                      <Chip 
                        label={faq.category} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* Contact Support Dialog */}
        <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HelpIcon sx={{ mr: 1 }} />
              Contact Support
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                select
                label="Category"
                value={supportTicket.category}
                onChange={(e) => setSupportTicket({ ...supportTicket, category: e.target.value })}
                SelectProps={{ native: true }}
                fullWidth
              >
                {supportCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </TextField>
              
              <TextField
                select
                label="Priority"
                value={supportTicket.priority}
                onChange={(e) => setSupportTicket({ ...supportTicket, priority: e.target.value })}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </TextField>
              
              <TextField
                label="Subject"
                value={supportTicket.subject}
                onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                fullWidth
                required
              />
              
              <TextField
                label="Description"
                value={supportTicket.description}
                onChange={(e) => setSupportTicket({ ...supportTicket, description: e.target.value })}
                multiline
                rows={4}
                fullWidth
                required
                helperText="Please provide as much detail as possible to help us assist you better."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitTicket} 
              variant="contained" 
              disabled={loading || !supportTicket.subject || !supportTicket.description}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Submit Ticket
            </Button>
          </DialogActions>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FeedbackIcon sx={{ mr: 1 }} />
              Send Feedback
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                select
                label="Feedback Type"
                value={feedback.type}
                onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
              </TextField>
              
              <TextField
                label="Message"
                value={feedback.message}
                onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                multiline
                rows={4}
                fullWidth
                required
                helperText="Tell us what you think about our service or report any issues you've encountered."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeedbackDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback} 
              variant="contained" 
              disabled={loading || !feedback.message}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Send Feedback
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default SupportPage;
