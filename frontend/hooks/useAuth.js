import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_TOKEN_KEY } from '../services/api';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function saveSession(authData) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    setToken(authData.token);
    setUser(authData.user);
  }

  async function clearSession() {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function restoreSession() {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (!storedToken) {
        return;
      }

      setToken(storedToken);
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (_error) {
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(credentials) {
    const authData = await authService.login(credentials);
    await saveSession(authData);
  }

  async function signUp(userData) {
    const authData = await authService.register(userData);
    await saveSession(authData);
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isLoading,
      signIn,
      signOut: clearSession,
      signUp,
      token,
      user,
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }

  return context;
}
