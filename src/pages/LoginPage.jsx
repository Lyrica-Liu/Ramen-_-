import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: ${p => p.theme.textSecondary};
  font-size: 0.82rem;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${p => p.theme.border};
  }
`;

const GoogleBtn = styled.button`
  width: 100%;
  padding: 11px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusSm};
  background: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3c4043;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover:not(:disabled) {
    box-shadow: 0 1px 6px rgba(0,0,0,0.12);
    border-color: #aaa;
  }
  &:disabled { opacity: 0.6; cursor: default; }
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

const ForgotLink = styled(Link)`
  display: block;
  text-align: center;
  font-size: 0.9rem;
  color: ${p => p.theme.primary};
  font-weight: 600;
  text-decoration: none;
  margin-top: 12px;
  margin-bottom: 16px;
  &:hover { text-decoration: underline; }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Google login failed'); return; }
      login(data.token, data.email);
      navigate('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
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
        <Title>Sign In</Title>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-in failed. Please try again.')}
          width="100%"
          text="signin_with"
          shape="rectangular"
        />

        <Divider>or</Divider>

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
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <ForgotLink to="/forgot-password">Forgot password?</ForgotLink>
          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </SubmitBtn>
        </form>

        <Footer>
          No account? <Link to="/register">Create one</Link>
        </Footer>
      </Card>
    </Page>
  );
}
