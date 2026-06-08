import { AppProvider } from '@/src/context/AppContext';
import { QueryProvider } from '@/src/providers/QueryProvider';
import AppShell from '@/src/layout/AppShell';
import '@/src/styles/global.css';

export const metadata = {
  title: 'Studio Pilates — Gestão',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
