
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api, { setAuthToken, login as apiLogin, register as apiRegister } from '../api/api';

interface AuthContextData {
  user: any;
  loading: boolean;
  updateUser: (newUserData: any) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      console.log('[Auth] Attempting to load user...');
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      if (token) {
        console.log('[Auth] Token found. Fetching user data.');
        setAuthToken(token);
        try {
          const response = await api.get('/users/me');
          console.log('[Auth] User data fetched:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('[Auth] Failed to fetch user on load:', error);
          if (Platform.OS === 'web') {
            localStorage.removeItem('token');
          } else {
            await SecureStore.deleteItemAsync('token');
          }
          setAuthToken(null);
        }
      } else {
        console.log('[Auth] No token found.');
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (username, password) => {
    const response = await apiLogin(username, password);
    const { token, user } = response.data;
    if (Platform.OS === 'web') {
      localStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
    setAuthToken(token);
    console.log('[Auth] User logged in:', user);
    setUser(user);
  };

  const register = async (username, password, nickname) => {
    await apiRegister(username, password, nickname);
  };

  const logout = async () => {
    console.log('[Auth] Logging out.');
    try {
        await api.put('/users/me/status', { status: '睡着' });
    } catch (error) {
        console.error('[Auth] Failed to update status on logout:', error);
    }
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
    } else {
      await SecureStore.deleteItemAsync('token');
    }
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (newUserData: any) => {
    console.log('[Auth] Updating user data with:', newUserData);
    setUser(currentUser => {
      const updatedUser = { ...currentUser, ...newUserData };
      console.log('[Auth] User data updated to:', updatedUser);
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
