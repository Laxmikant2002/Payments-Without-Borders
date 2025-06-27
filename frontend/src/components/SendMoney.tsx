import React, { useState } from 'react';

const currencies = ['USD', 'EUR', 'GBP', 'INR'];

const SendMoney: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (!recipient || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError('Please enter a valid recipient and amount.');
        setLoading(false);
        return;
      }
      setSuccess('Money sent successfully!');
      setLoading(false);
      setRecipient('');
      setAmount('');
      setCurrency('USD');
    }, 1200);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{maxWidth:420}}>
        <h2 className="auth-title">Send Money</h2>
        {success && <div className="alert alert-success fade-in">{success}</div>}
        {error && <div className="alert alert-danger fade-in icon-shake">{error}</div>}
        <form onSubmit={handleSubmit} className="slide-in-up">
          <div className="form-group">
            <label htmlFor="recipient">Recipient</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              className={`form-control${error && !recipient ? ' input-validated' : ''}`}
              placeholder="Recipient email or username"
              aria-label="Recipient"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`form-control${error && (!amount || isNaN(Number(amount)) || Number(amount) <= 0) ? ' input-validated' : ''}`}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              aria-label="Amount"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="form-control"
              aria-label="Currency"
            >
              {currencies.map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} aria-label="Send Money">
            {loading ? <span className="loading-spinner">Sending...</span> : 'Send Money'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendMoney; 