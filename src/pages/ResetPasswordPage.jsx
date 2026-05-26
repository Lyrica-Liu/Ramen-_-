import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [resetToken, setResetToken] = useState(location.state?.resetToken || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!resetToken.trim()) {
      setError('Reset code required');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
        return;
      }
      login(data.token, data.email);
      navigate('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Title>Set New Password</Title>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit}>
          <Label>Reset Code</Label>
          <Input
            type="text"
            placeholder="Paste your reset code"
            value={resetToken}
            onChange={e => setResetToken(e.target.value)}
            required
            autoFocus
          />
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Label>Confirm</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </SubmitBtn>
        </form>

        <Footer>
          <Link to="/login">Back to Sign In</Link>
        </Footer>
      </Card>
    </Page>
  );
}
