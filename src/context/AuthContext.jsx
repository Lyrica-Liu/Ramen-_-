import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    return token && email ? { token, email } : null;
  });

  function login(token, email) {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setAuth({ token, email });
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setAuth(null);
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
