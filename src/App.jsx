import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createGlobalStyle, ThemeProvider, keyframes, styled } from 'styled-components';
import { theme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext';
import { UIProvider } from './context/UIContext';
import Bookshelf from './pages/Bookshelf';
import BookView from './pages/BookView';
import StatisticsPage from './pages/StatisticsPage';
import CollectionPage from './pages/CollectionPage';
import WordSearchPage from './pages/WordSearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: 'Nunito', -apple-system, 'SF Pro Display', system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.5;
    color: ${p => p.theme.text};
    background: ${p => p.theme.bodyBg};
    -webkit-font-smoothing: antialiased;
  }

  button {
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
  }

  input, textarea {
    font-family: inherit;
    font-size: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const pageFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const RouteShell = styled.div`
  animation: ${pageFadeIn} 0.20s ease-out;
`;

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <RouteShell key={location.pathname}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={<Bookshelf />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/book/:bookId" element={
          <ProtectedRoute>
            <StudyProvider>
              <UIProvider>
                <BookView />
              </UIProvider>
            </StudyProvider>
          </ProtectedRoute>
        } />
        <Route path="/book/:bookId/search" element={
          <ProtectedRoute>
            <WordSearchPage />
          </ProtectedRoute>
        } />
        <Route path="/statistics" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
        <Route path="/collection" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteShell>
  );
}

function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
