import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,    setToken]    = useState(() => localStorage.getItem('qm_token'));
  const [userName, setUserName] = useState(() => localStorage.getItem('qm_username'));
  const [userEmail,setUserEmail]= useState(() => localStorage.getItem('qm_email'));

  function login(tok, name, email = '') {
    localStorage.setItem('qm_token', tok);
    localStorage.setItem('qm_username', name);
    localStorage.setItem('qm_email', email);
    setToken(tok);
    setUserName(name);
    setUserEmail(email);
  }

  function logout() {
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_username');
    localStorage.removeItem('qm_email');
    setToken(null);
    setUserName(null);
    setUserEmail(null);
  }

  return (
    <AuthContext.Provider value={{ token, userName, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
