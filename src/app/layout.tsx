import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NotificationProvider } from '../lib/context/NotificationContext';
import Providers from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shareholder Management System',
  description: 'Quản lý cổ đông, cuộc họp và bầu cử',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <NotificationProvider>
          <Providers>
            {children}
          </Providers>
        </NotificationProvider>
      </body>
    </html>
  );
}