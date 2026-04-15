import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from './theme';
import Bookshelf from './pages/Bookshelf';
import BookView from './pages/BookView';

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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Bookshelf />} />
          <Route path="/bookshelf" element={<Bookshelf />} />
          <Route path="/book/:bookId" element={<BookView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
