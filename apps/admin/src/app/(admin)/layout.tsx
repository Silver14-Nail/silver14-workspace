import AppInitializer from '@/components/AppInitializer';
import AdminShell from '@/components/layouts/AdminShell';
import { AdminThemeProvider } from '../context/AdminThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AppInitializer>
        <AdminShell>{children}</AdminShell>
      </AppInitializer>
    </AdminThemeProvider>
  );
}
