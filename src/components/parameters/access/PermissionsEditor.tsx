import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RolePermissions } from '@/types/permissions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface PermissionsEditorProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
}

export const PermissionsEditor = ({ permissions, onChange }: PermissionsEditorProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    home: true,
    monitoring: true,
    ord: true,
    layouts: true,
    reports: true,
    photo_archive: true,
    parameters: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updatePermission = (path: string[], value: boolean) => {
    const newPermissions = { ...permissions };
    let current: any = newPermissions;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    onChange(newPermissions);
  };

  const PermissionCheckbox = ({ label, path }: { label: string; path: string[] }) => {
    const getValue = () => {
      let current: any = permissions;
      for (const key of path) {
        current = current[key];
      }
      return current;
    };

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={path.join('-')}
          checked={getValue()}
          onCheckedChange={(checked) => updatePermission(path, checked as boolean)}
        />
        <Label htmlFor={path.join('-')} className="text-sm cursor-pointer">
          {label}
        </Label>
      </div>
    );
  };

  const Section = ({ title, section, children }: { title: string; section: string; children: React.ReactNode }) => (
    <Collapsible open={openSections[section]} onOpenChange={() => toggleSection(section)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
        <span className="font-semibold text-sm">{title}</span>
        <Icon name={openSections[section] ? "ChevronDown" : "ChevronRight"} size={16} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 pt-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        <Section title="1. Главная" section="home">
          <PermissionCheckbox label="Просмотр" path={['home', 'view']} />
        </Section>

        <Section title="2. Мониторинг" section="monitoring">
          <PermissionCheckbox label="Просмотр" path={['monitoring', 'view']} />
          <PermissionCheckbox label="Просмотр онлайн" path={['monitoring', 'view_online']} />
          <PermissionCheckbox label="Просмотр видеоархива" path={['monitoring', 'view_archive']} />
          <PermissionCheckbox label="PTZ управление" path={['monitoring', 'ptz_control']} />
        </Section>

        <Section title="3. ОРД" section="ord">
          <PermissionCheckbox label="Просмотр страницы" path={['ord', 'view']} />
          
          <div className="ml-4 space-y-2 mt-2">
            <div className="font-medium text-sm text-muted-foreground">3.1. Онлайн поиск</div>
            <div className="ml-4 space-y-1">
              <PermissionCheckbox label="Чтение" path={['ord', 'online_search', 'view']} />
              <PermissionCheckbox label="Создание" path={['ord', 'online_search', 'create']} />
              <PermissionCheckbox label="Редактирование" path={['ord', 'online_search', 'edit']} />
              <PermissionCheckbox label="Удаление" path={['ord', 'online_search', 'delete']} />
            </div>

            <div className="font-medium text-sm text-muted-foreground mt-2">3.2. Онлайн поиск по ГРЗ</div>
            <div className="ml-4 space-y-1">
              <PermissionCheckbox label="Чтение" path={['ord', 'online_search_license_plate', 'view']} />
              <PermissionCheckbox label="Создание" path={['ord', 'online_search_license_plate', 'create']} />
              <PermissionCheckbox label="Редактирование" path={['ord', 'online_search_license_plate', 'edit']} />
              <PermissionCheckbox label="Удаление" path={['ord', 'online_search_license_plate', 'delete']} />
            </div>

            <div className="font-medium text-sm text-muted-foreground mt-2">3.3. Исторический поиск лиц</div>
            <div className="ml-4">
              <PermissionCheckbox label="Просмотр" path={['ord', 'historical_search_faces', 'view']} />
            </div>

            <div className="font-medium text-sm text-muted-foreground mt-2">3.4. Исторический поиск ГРЗ</div>
            <div className="ml-4">
              <PermissionCheckbox label="Просмотр" path={['ord', 'historical_search_license_plates', 'view']} />
            </div>
          </div>
        </Section>

        <Section title="4. Раскладки" section="layouts">
          <PermissionCheckbox label="Просмотр" path={['layouts', 'view']} />
          <PermissionCheckbox label="Создание" path={['layouts', 'create']} />
          <PermissionCheckbox label="Редактирование" path={['layouts', 'edit']} />
          <PermissionCheckbox label="Удаление" path={['layouts', 'delete']} />
          <PermissionCheckbox label="Настройка камер" path={['layouts', 'camera_settings']} />
        </Section>

        <Section title="5. Отчеты" section="reports">
          <PermissionCheckbox label="Просмотр" path={['reports', 'view']} />
        </Section>

        <Section title="6. Фотоархив" section="photo_archive">
          <PermissionCheckbox label="Просмотр" path={['photo_archive', 'view']} />
          <PermissionCheckbox label="Создание" path={['photo_archive', 'create']} />
          <PermissionCheckbox label="Редактирование" path={['photo_archive', 'edit']} />
          <PermissionCheckbox label="Удаление" path={['photo_archive', 'delete']} />
        </Section>

        <Section title="7. Параметры" section="parameters">
          <PermissionCheckbox label="Просмотр страницы" path={['parameters', 'view']} />
          
          <div className="ml-4 space-y-2 mt-2">
            <div className="font-medium text-sm text-muted-foreground">7.1. Управление доступом</div>
            <div className="ml-4 space-y-1">
              <PermissionCheckbox label="Просмотр раздела" path={['parameters', 'access_management', 'view']} />
              
              <div className="ml-4 space-y-2 mt-2">
                <div className="text-sm text-muted-foreground">7.1.1. Роли</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'access_management', 'roles', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'access_management', 'roles', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'access_management', 'roles', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'access_management', 'roles', 'delete']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.1.2. Пользователи</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'access_management', 'users', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'access_management', 'users', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'access_management', 'users', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'access_management', 'users', 'delete']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.1.3. Группы пользователей</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'access_management', 'user_groups', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'access_management', 'user_groups', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'access_management', 'user_groups', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'access_management', 'user_groups', 'delete']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.1.4. Сеансы</div>
                <div className="ml-4">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'access_management', 'sessions', 'view']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.1.5. Журнал</div>
                <div className="ml-4">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'access_management', 'audit_log', 'view']} />
                </div>
              </div>
            </div>

            <div className="font-medium text-sm text-muted-foreground mt-2">7.2. Источники камер видеонаблюдения</div>
            <div className="ml-4 space-y-1">
              <PermissionCheckbox label="Просмотр раздела" path={['parameters', 'camera_sources', 'view']} />
              
              <div className="ml-4 space-y-2 mt-2">
                <div className="text-sm text-muted-foreground">7.2.1. Камеры</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'camera_sources', 'cameras', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'camera_sources', 'cameras', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'camera_sources', 'cameras', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'camera_sources', 'cameras', 'delete']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.2.2. Группы камер</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'camera_sources', 'camera_groups', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'camera_sources', 'camera_groups', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'camera_sources', 'camera_groups', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'camera_sources', 'camera_groups', 'delete']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.2.3. Реестр собственников</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'camera_sources', 'owners_registry', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'camera_sources', 'owners_registry', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'camera_sources', 'owners_registry', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'camera_sources', 'owners_registry', 'delete']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.2.4. Теги</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'camera_sources', 'tags', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'camera_sources', 'tags', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'camera_sources', 'tags', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'camera_sources', 'tags', 'delete']} />
                </div>

                <div className="text-sm text-muted-foreground mt-2">7.2.5. Модели камер</div>
                <div className="ml-4 space-y-1">
                  <PermissionCheckbox label="Просмотр" path={['parameters', 'camera_sources', 'camera_models', 'view']} />
                  <PermissionCheckbox label="Создание" path={['parameters', 'camera_sources', 'camera_models', 'create']} />
                  <PermissionCheckbox label="Редактирование" path={['parameters', 'camera_sources', 'camera_models', 'edit']} />
                  <PermissionCheckbox label="Удаление" path={['parameters', 'camera_sources', 'camera_models', 'delete']} />
                </div>
              </div>
            </div>

            <div className="font-medium text-sm text-muted-foreground mt-2">7.3. Территориальное деление</div>
            <div className="ml-4 space-y-1">
              <PermissionCheckbox label="Просмотр" path={['parameters', 'territorial_divisions', 'view']} />
              <PermissionCheckbox label="Создание" path={['parameters', 'territorial_divisions', 'create']} />
              <PermissionCheckbox label="Редактирование" path={['parameters', 'territorial_divisions', 'edit']} />
              <PermissionCheckbox label="Удаление" path={['parameters', 'territorial_divisions', 'delete']} />
            </div>

            <div className="font-medium text-sm text-muted-foreground mt-2">7.4. Корзина</div>
            <div className="ml-4">
              <PermissionCheckbox label="Просмотр" path={['parameters', 'trash', 'view']} />
            </div>

            <div className="font-medium text-sm text-muted-foreground mt-2">7.5. ВиВС</div>
            <div className="ml-4">
              <PermissionCheckbox label="Просмотр" path={['parameters', 'vvs', 'view']} />
            </div>
          </div>
        </Section>
      </div>
    </ScrollArea>
  );
};
