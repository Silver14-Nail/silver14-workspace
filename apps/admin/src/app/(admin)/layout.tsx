import AppInitializer from '@/components/AppInitializer';
import AdminShell from '@/components/layouts/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppInitializer>
      <AdminShell>{children}</AdminShell>
    </AppInitializer>
  );
}
