import { QueryClient, QueryClientProvider, hydrate } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

try {
  const cachedState = (lynx.__globalProps as any)?._queryCache;
  if (cachedState) {
    hydrate(queryClient, cachedState);
  }
} catch {}
