'use client';
import ListenLogoutSocket from '@/components/listen-logout-socket';
import RefreshToken from '@/components/refresh-token';
import envConfig from '@/config';
import { decodeJWT, getAccessTokenFromLocalStorage, removeAuthTokens } from '@/lib/utils';
import { DishInCartType } from '@/schemaValidations/dish.schema';
import { RoleType } from '@/types/jwt.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
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

type StoreType = {
  role: RoleType | null;
  setRole: (role: RoleType | null) => void;
  socket: Socket | null;
  createConnectSocket: (accessToken: string) => void;
  disconnectSocket: () => void;
  cart: DishInCartType[];
  pushToCart: (dish: DishInCartType) => void;
  removeDishFromCart: (dishId: string) => void;
  changeQuantity: (dishId: string, quantity: number) => void;
  removeAllCart: () => void;
};

export const useStore = create<StoreType>((set) => ({
  role: null,
  socket: null,
  setRole: (role: RoleType | null) => {
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
  }
}));

export const useAppStore = () => {
  const role = useStore((state) => state.role);
  const setRole = useStore((state) => state.setRole);
  const socket = useStore((state) => state.socket);
  const createConnectSocket = useStore((state) => state.createConnectSocket);
  const disconnectSocket = useStore((state) => state.disconnectSocket);
  const cart = useStore((state) => state.cart);
  const pushToCart = useStore((state) => state.pushToCart);
  const removeDishFromCart = useStore((state) => state.removeDishFromCart);
  const changeQuantity = useStore((state) => state.changeQuantity);
  const removeAllCart = useStore((state) => state.removeAllCart);
  return {
    role,
    setRole,
    socket,
    createConnectSocket,
    disconnectSocket,
    cart,
    pushToCart,
    removeDishFromCart,
    changeQuantity,
    removeAllCart
  };
};

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
