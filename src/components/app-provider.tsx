'use client';
import ListenLogoutSocket from '@/components/listen-logout-socket';
import RefreshToken from '@/components/refresh-token';
import envConfig from '@/config';
import { Role } from '@/constants/enum';
import { decodeJWT, getAccessTokenFromLocalStorage, removeAuthTokens } from '@/lib/utils';
import { StoreType } from '@/types/common.type';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { create } from 'zustand';

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

export const useStore = create<StoreType>((set) => ({
  role: null,
  socket: null,
  setRole: (role: Role | null) => {
    set({ role });
    if (role === null) {
      removeAuthTokens();
    }
  },
  createConnectSocket: (accessToken: string) => {
    if (accessToken) {
      set({
        socket: io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
          auth: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      });
    }
  },
  disconnectSocket: () => {
    set((state) => {
      if (state.socket) {
        state.socket.disconnect();
        return { socket: null };
      }
      return state;
    });
  },
  cart: [],
  pushToCart: (dish) => {
    set((state) => {
      return { cart: [...state.cart, dish] };
    });
  },
  removeDishFromCart: (dishId) => {
    set((state) => {
      return { cart: state.cart.filter((dish) => dish.id !== dishId) };
    });
  },
  changeQuantity: (dishId, quantity) => {
    set((state) => {
      if (quantity === 0) {
        return { cart: state.cart.filter((dish) => dish.id !== dishId) };
      }
      return {
        cart: state.cart.map((dish) => {
          if (dish.id === dishId) {
            return { ...dish, quantity };
          }
          return dish;
        })
      };
    });
  },
  removeAllCart: () => {
    set({ cart: [] });
  },
  isShowAlertDialog: false,
  optionAlertDialog: {
    title: 'default',
    description: 'default',
    onAction: () => {},
    cancel: 'cancel',
    action: 'confirm'
  },
  closeAlertDialog: () => {
    set({ isShowAlertDialog: false });
  },
  showAlertDialog: (option) => {
    set({ isShowAlertDialog: true, optionAlertDialog: option });
  }
}));

export const useAppStore = () => useStore((state) => state);

const AppProvider = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { setRole, createConnectSocket } = useAppStore();

  const count = useRef(0);

  useEffect(() => {
    if (count.current > 0) return;
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      const { role } = decodeJWT(accessToken);
      setRole(role);
      createConnectSocket(accessToken);
      count.current++;
    }
  }, [createConnectSocket, setRole]);

  return (
    <QueryClientProvider client={queryClient}>
      <RefreshToken />
      <ListenLogoutSocket />
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default AppProvider;
