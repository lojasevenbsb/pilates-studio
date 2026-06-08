import { AppProvider } from '@/src/context/AppContext';
import AppShell from '@/src/layout/AppShell';
import '@/src/styles/global.css';

export const metadata = {
  title: 'Studio Pilates — Gestão',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
