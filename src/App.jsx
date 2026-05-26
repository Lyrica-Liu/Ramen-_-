import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Bookshelf from './pages/Bookshelf';
import BookView from './pages/BookView';
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
    overflow: hidden;
  }

  body {
    font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', system-ui,
      BlinkMacSystemFont, sans-serif;
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

function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<ProtectedRoute><Bookshelf /></ProtectedRoute>} />
            <Route path="/bookshelf" element={<ProtectedRoute><Bookshelf /></ProtectedRoute>} />
            <Route path="/book/:bookId" element={<ProtectedRoute><BookView /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
