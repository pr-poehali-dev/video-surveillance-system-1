import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import HeaderBar from '@/components/header/HeaderBar';
import ChangePasswordDialog from '@/components/header/ChangePasswordDialog';
import SettingsDialog from '@/components/header/SettingsDialog';
import UserGuideDialog from '@/components/header/UserGuideDialog';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState(3);
  const [userRole, setUserRole] = useState<string>('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [portalSettings, setPortalSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portalSettings') || '{}'); } catch { return {}; }
  });
  const [settingsForm, setSettingsForm] = useState({
    notifyOnAlert: portalSettings.notifyOnAlert ?? true,
    notifyOnOffline: portalSettings.notifyOnOffline ?? true,
    notifySound: portalSettings.notifySound ?? false,
  });

  const handleSaveSettings = () => {
    localStorage.setItem('portalSettings', JSON.stringify(settingsForm));
    setPortalSettings(settingsForm);
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
