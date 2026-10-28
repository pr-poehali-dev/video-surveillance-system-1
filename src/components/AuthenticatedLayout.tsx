import { ReactNode, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { useSession } from '@/hooks/useSession';
import { usePermissions } from '@/hooks/usePermissions';
import { useLocation, useNavigate } from '@/lib/router-compat';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  containerClassName?: string;
}

const AuthenticatedLayout = ({ children, containerClassName = 'container mx-auto px-4 py-6' }: AuthenticatedLayoutProps) => {
  useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { loading, canAccess, firstAllowedPath } = usePermissions();

  const allowed = !loading && canAccess(pathname);

  useEffect(() => {
    if (!loading && !allowed && firstAllowedPath && firstAllowedPath !== pathname) {
      navigate(firstAllowedPath, { replace: true });
    }
  }, [loading, allowed, firstAllowedPath, pathname, navigate]);

  return (
    <>
      <Header />
      <Navigation canAccess={loading ? () => false : canAccess} />
      <div className={containerClassName}>
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        {allowed && children}
        {!loading && !allowed && !firstAllowedPath && (
          <div className="text-center py-20 text-muted-foreground">
            У вашей роли нет доступа ни к одному разделу. Обратитесь к администратору.
          </div>
        )}
      </div>
    </>
  );
};

export default AuthenticatedLayout;
