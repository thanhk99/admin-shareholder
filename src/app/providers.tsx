'use client';

import { AuthProvider } from "@/lib/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosError } from 'axios';

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: (failureCount: number, error: unknown) => {
          // Type-safe error handling với AxiosError
          if (error instanceof AxiosError) {
            if (error.response?.status === 401 || error.response?.status === 403) {
              return false;
            }
          }
          return failureCount < 2;
        },
        retryDelay: 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}