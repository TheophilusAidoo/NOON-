import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import ConditionalHeader from '@/components/ConditionalHeader';
import ConditionalFooter from '@/components/ConditionalFooter';
import AuthInit from '@/components/AuthInit';
import SettingsInit from '@/components/SettingsInit';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rakuten - Multi-Vendor E-commerce',
  description: 'Your one-stop shop for electronics, fashion, and more',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full">
      <body className="min-h-screen bg-gray-50 antialiased flex flex-col">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <AuthInit />
            <SettingsInit />
            <ConditionalHeader />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
