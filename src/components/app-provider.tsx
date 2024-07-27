"use client";
import RefreshToken from "@/components/refresh-token";
import { getAccessTokenFromLocalStorage, removeAuthTokens } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryOnMount: false,
    },
  },
});

export const AppContext = createContext({
  isAuth: false,
  setIsAuth: (isAuth: boolean) => {},
});

export const useAppContext = () => {
  return useContext(AppContext);
};

const AppProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isAuth, setIsAuthState] = useState(false);

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      setIsAuthState(true);
    }
  }, []);

  const setIsAuth = useCallback(
    (isAuth: boolean) => {
      setIsAuthState(isAuth);
      if (!isAuth) {
        removeAuthTokens();
      }
    },
    [setIsAuthState]
  );

  return (
    <AppContext.Provider value={{ isAuth, setIsAuth }}>
      <QueryClientProvider client={queryClient}>
        <RefreshToken />
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </AppContext.Provider>
  );
};

export default AppProvider;
