import Icon from '@/components/ui/icon';
import Navigation from './Navigation';

// Server-rendered shell for ssr:false pages (session lives in localStorage):
// static part of the header + navigation, replaced by the real page after hydration.
const AuthPending = () => (
  <>
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold leading-tight">
                  Единая система видеонаблюдения
                </h1>
                <p className="text-xs text-muted-foreground">Пермский край</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <Navigation />
  </>
);

export default AuthPending;
