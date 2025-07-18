'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { create } from 'zustand';

import type { GuestOrderRole } from '@/constants/const';
import type { Role } from '@/constants/enum';
import type { StoreType } from '@/types/common.type';
import type { ReactNode } from 'react';

import ListenLogoutSocket from '@/components/listen-logout-socket';
import RefreshToken from '@/components/refresh-token';
import TLoading from '@/components/t-loading';
import envConfig from '@/config';
import { decodeJWT, getAccessTokenFromLocalStorage, removeAuthTokens } from '@/lib/utils';

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
  setRole: (role: Role | null | typeof GuestOrderRole) => {
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
  setCart: (dishes) => {
    set({ cart: dishes });
    localStorage.setItem('cart', JSON.stringify(dishes));
  },
  pushToCart: (dishes) => {
    set((state) => {
      return {
        cart: [...state.cart, ...dishes]
      };
    });
    localStorage.setItem('cart', JSON.stringify(useStore.getState().cart));
  },
  removeDishesFromCart: (dishIds) => {
    set((state) => {
      return { cart: state.cart.filter((dish) => !dishIds.includes(dish.id)) };
    });
    localStorage.setItem('cart', JSON.stringify(useStore.getState().cart.filter((dish) => !dishIds.includes(dish.id))));
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
    localStorage.setItem(
      'cart',
      JSON.stringify(
        useStore.getState().cart.map((dish) => {
          if (dish.id === dishId) {
            return { ...dish, quantity };
          }
          return dish;
        })
      )
    );
  },
  removeAllCart: () => {
    set({ cart: [] });
    localStorage.removeItem('cart');
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
  },
  loading: false,
  setLoading: (loading) => {
    set({ loading });
  }
}));

export const useAppStore = () => useStore((state) => state);

const AppProvider = ({
  children
}: Readonly<{
  children: ReactNode;
}>) => {
  const { setRole, createConnectSocket, setCart, loading } = useAppStore();

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

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      setCart(JSON.parse(cart));
    }
  }, [setCart]);

  return (
    <QueryClientProvider client={queryClient}>
      <RefreshToken />
      {loading && <TLoading />}
      <ListenLogoutSocket />
      {children}
    </QueryClientProvider>
  );
};

export default AppProvider;
