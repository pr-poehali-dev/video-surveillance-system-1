import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { useSession } from '@/hooks/useSession';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  containerClassName?: string;
}

const AuthenticatedLayout = ({ children, containerClassName = 'container mx-auto px-4 py-6' }: AuthenticatedLayoutProps) => {
  useSession();

  return (
    <>
      <Header />
      <Navigation />
      <div className={containerClassName}>
        {children}
      </div>
    </>
  );
};

export default AuthenticatedLayout;