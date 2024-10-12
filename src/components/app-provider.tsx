'use client';
import RefreshToken from '@/components/refresh-token';
import envConfig from '@/config';
import { decodeJWT, getAccessTokenFromLocalStorage, removeAuthTokens } from '@/lib/utils';
import { RoleType } from '@/types/jwt.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Default
// staleTime: 0
// gcTime: 5 minutes

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

export const AppContext = createContext({
  role: undefined as RoleType | undefined,
  setRole: (_role: RoleType | undefined) => {},
  socket: null as Socket | null,
  createConnectSocket: (_accessToken: string) => {},
  disconnectSocket: () => {}
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
  const [socket, setSocket] = useState<Socket | null>(null);

  const createConnectSocket = useCallback((accessToken: string) => {
    if (accessToken) {
      setSocket(
        io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
          auth: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      );
    }
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  const setRole = useCallback((role: RoleType | undefined) => {
    setRoleState(role);
    if (!role) {
      removeAuthTokens();
    }
  }, []);

  const count = useRef(0);

  useEffect(() => {
    if (count.current > 0) return;
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      const { role } = decodeJWT(accessToken);
      setRoleState(role);
      createConnectSocket(accessToken);
      count.current++;
    }
  }, [createConnectSocket]);

  return (
    <AppContext.Provider value={{ role, setRole, socket, createConnectSocket, disconnectSocket }}>
      <QueryClientProvider client={queryClient}>
        <RefreshToken />
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </AppContext.Provider>
  );
};

export default AppProvider;
