import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.bodyBg};
  padding: 24px;
`;

const Card = styled.div`
  background: ${p => p.theme.panel};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radius};
  padding: 32px;
  width: 100%;
  max-width: 380px;
  box-shadow: ${p => p.theme.shadow};
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: ${p => p.theme.textSecondary};
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 12px;
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.95rem;
  outline: none;
  background: #fff;
  margin-bottom: 16px;

  &:focus {
    border-color: ${p => p.theme.primary};
    box-shadow: 0 0 0 2px ${p => p.theme.primaryMuted};
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-size: 1rem;
  font-weight: 600;
  margin-top: 8px;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryStrong};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const ErrorMsg = styled.p`
  font-size: 0.88rem;
  color: ${p => p.theme.hardText};
  background: ${p => p.theme.hardBg};
  border: 1px solid ${p => p.theme.hardBorder};
  border-radius: ${p => p.theme.radiusSm};
  padding: 10px 14px;
  margin-bottom: 16px;
`;

const SuccessMsg = styled.div`
  font-size: 0.9rem;
  color: ${p => p.theme.easyText};
  background: ${p => p.theme.easyBg};
  border: 1px solid ${p => p.theme.easyBorder};
  border-radius: ${p => p.theme.radiusSm};
  padding: 12px 14px;
  margin-bottom: 16px;

  strong {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
  }

  code {
    background: rgba(0,0,0,0.05);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
  }
`;

const Footer = styled.p`
  text-align: center;
  font-size: 0.9rem;
  color: ${p => p.theme.textSecondary};
  margin-top: 20px;

  a {
    color: ${p => p.theme.primary};
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed');
        return;
      }
      setResetToken(data.resetToken);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    navigate('/reset-password', { state: { resetToken } });
  };

  return (
    <Page>
      <Card>
        <Title>Reset Password</Title>
        <Subtitle>Enter your email to get a reset code</Subtitle>

        {resetToken && (
          <>
            <SuccessMsg>
              <strong>Reset code generated!</strong>
              Copy this code: <code>{resetToken}</code>
              <div style={{ marginTop: '12px' }}>
                <SubmitBtn onClick={handleReset}>Continue to Reset</SubmitBtn>
              </div>
            </SuccessMsg>
          </>
        )}

        {!resetToken && (
          <>
            {error && <ErrorMsg>{error}</ErrorMsg>}

            <form onSubmit={handleSubmit}>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              <SubmitBtn type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Code'}
              </SubmitBtn>
            </form>
          </>
        )}

        <Footer>
          Remember password? <Link to="/login">Sign in</Link>
        </Footer>
      </Card>
    </Page>
  );
}
