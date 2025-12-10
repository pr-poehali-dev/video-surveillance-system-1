import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import ProtectedRoute from './ProtectedRoute';
import { useSession } from '@/hooks/useSession';
import { usePermissions } from '@/hooks/usePermissions';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  containerClassName?: string;
  permission?: keyof ReturnType<typeof usePermissions>['permissions'];
}

const AuthenticatedLayout = ({ children, containerClassName = 'container mx-auto px-4 py-6', permission }: AuthenticatedLayoutProps) => {
  useSession();

  return (
    <>
      <Header />
      <Navigation />
      <ProtectedRoute permission={permission}>
        <div className={containerClassName}>
          {children}
        </div>
      </ProtectedRoute>
    </>
  );
};

export default AuthenticatedLayout;