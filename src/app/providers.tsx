'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import LanguageProvider from '@/components/LanguageProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: '"Noto Nastaliq Urdu", serif',
            direction: 'rtl',
          },
        }}
      />
    </SessionProvider>
  );
}
