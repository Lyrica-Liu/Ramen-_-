import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  box-shadow: ${p => p.theme.shadowLg};
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  font-size: 0.92rem;
  color: ${p => p.theme.textSecondary};
  margin-bottom: 28px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  font-size: 0.97rem;
  outline: none;
  background: #fff;
  margin-bottom: 16px;

  &:focus {
    border-color: ${p => p.theme.primary};
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.radiusSm};
  font-size: 1rem;
  font-weight: 600;
  margin-top: 4px;
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
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
        <Title>Create account</Title>
        <Subtitle>Start tracking your vocabulary</Subtitle>

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
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Label>Confirm Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </SubmitBtn>
        </form>

        <Footer>
          Already have an account? <Link to="/login">Sign in</Link>
        </Footer>
      </Card>
    </Page>
  );
}
