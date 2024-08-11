'use client';
import RefreshToken from '@/components/refresh-token';
import { decodeJWT, getAccessTokenFromLocalStorage, removeAuthTokens } from '@/lib/utils';
import { RoleType } from '@/types/jwt.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryOnMount: false
    }
  }
});

export const AppContext = createContext({
  role: undefined as RoleType | undefined,
  setRole: (_role: RoleType | undefined) => {}
});

export const useAppContext = () => {
  return useContext(AppContext);
};

const AppProvider = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [role, setRoleState] = useState<RoleType | undefined>(undefined);

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      const { role } = decodeJWT(accessToken);
      setRoleState(role);
    }
  }, []);

  const setRole = useCallback((role: RoleType | undefined) => {
    setRoleState(role);
    if (!role) {
      removeAuthTokens();
    }
  }, []);

  return (
    <AppContext.Provider value={{ role, setRole }}>
      <QueryClientProvider client={queryClient}>
        <RefreshToken />
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </AppContext.Provider>
  );
};

export default AppProvider;
