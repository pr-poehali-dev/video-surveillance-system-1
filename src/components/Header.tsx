import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import HeaderBar from '@/components/header/HeaderBar';
import ChangePasswordDialog from '@/components/header/ChangePasswordDialog';
import SettingsDialog from '@/components/header/SettingsDialog';
import UserGuideDialog from '@/components/header/UserGuideDialog';

const getInitialSettings = () => {
  try { return JSON.parse(localStorage.getItem('portalSettings') || '{}'); } catch { return {}; }
};

const applyTheme = (theme: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

const applyCompact = (compact: boolean) => {
  document.documentElement.setAttribute('data-compact', compact ? 'true' : 'false');
};

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState(3);
  const [userRole, setUserRole] = useState<string>('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [portalSettings, setPortalSettings] = useState(getInitialSettings);
  const [settingsForm, setSettingsForm] = useState(() => {
    const s = getInitialSettings();
    return {
      notifyOnAlert: s.notifyOnAlert ?? true,
      notifyOnOffline: s.notifyOnOffline ?? true,
      notifySound: s.notifySound ?? false,
      theme: (s.theme ?? 'light') as 'light' | 'dark',
      compactTables: s.compactTables ?? false,
      defaultPage: (s.defaultPage ?? '/dashboard') as '/dashboard' | '/monitoring' | '/camera-registry',
    };
  });

  useEffect(() => {
    const s = getInitialSettings();
    applyTheme(s.theme ?? 'light');
    applyCompact(s.compactTables ?? false);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('portalSettings', JSON.stringify(settingsForm));
    setPortalSettings(settingsForm);
    applyTheme(settingsForm.theme);
    applyCompact(settingsForm.compactTables);
    setSettingsOpen(false);
    toast.success('Настройки сохранены');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const roleId = localStorage.getItem('userRoleId');
      if (!roleId) return;
      try {
        const response = await fetch('https://functions.poehali.dev/6d4b14b4-cdd5-4bb0-b2f2-ef1cf5b25f4b');
        if (response.ok) {
          const roles = await response.json();
          const role = roles.find((r: { id: number; name: string }) => r.id === parseInt(roleId));
          if (role) setUserRole(role.name);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();
  }, []);

  return (
    <>
      <HeaderBar
        currentTime={currentTime}
        notifications={notifications}
        userRole={userRole}
        onChangePassword={() => setChangePasswordOpen(true)}
        onOpenGuide={() => setUserGuideOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settingsForm={settingsForm}
        setSettingsForm={setSettingsForm}
        onSave={handleSaveSettings}
      />
      <UserGuideDialog
        open={userGuideOpen}
        onOpenChange={setUserGuideOpen}
      />
    </>
  );
};

export default Header;
