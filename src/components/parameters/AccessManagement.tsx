import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import RolesTab from './access/RolesTab';
import UsersTab from './access/UsersTab';
import SessionsTab from './access/SessionsTab';
import AuditLogTab from './access/AuditLogTab';
import UserGroupsTab from './access/UserGroupsTab';

const AccessManagement = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [roles, setRoles] = useState([
    { id: 1, name: 'Администратор', users: 3, permissions: ['all'] },
    { id: 2, name: 'Оператор', users: 12, permissions: ['view', 'search'] },
    { id: 3, name: 'Наблюдатель', users: 8, permissions: ['view'] },
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      fio: 'Иванов Иван Иванович',
      company: 'МВД',
      email: 'ivanov@mvd.ru',
      login: 'ivanov',
      workPhone: '+7 (342) 123-45-67',
      mobilePhone: '+7 (912) 345-67-89',
      role: 'Администратор',
      isOnline: true,
      note: '',
      documents: [],
    },
    {
      id: 2,
      fio: 'Петров Петр Петрович',
      company: 'Администрация',
      email: 'petrov@admin.perm.ru',
      login: 'petrov',
      workPhone: '+7 (342) 234-56-78',
      mobilePhone: '+7 (912) 456-78-90',
      role: 'Оператор',
      isOnline: false,
      note: '',
      documents: [],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const [sessions, setSessions] = useState([
    {
      id: 1,
      user: 'Иванов Иван Иванович',
      ip: '192.168.1.10',
      page: '/monitoring',
      startTime: new Date(Date.now() - 3600000),
      lastActivity: new Date(),
    },
  ]);

  const [auditLog, setAuditLog] = useState([
    {
      id: 1,
      user: 'Иванов И.И.',
      action: 'Просмотр камеры',
      details: 'Камера-001',
      timestamp: new Date(Date.now() - 600000),
      ip: '192.168.1.10',
    },
    {
      id: 2,
      user: 'Петров П.П.',
      action: 'Поиск ГРЗ',
      details: 'А123ВС159',
      timestamp: new Date(Date.now() - 1800000),
      ip: '192.168.1.15',
    },
  ]);

  return (
    <Tabs defaultValue="roles" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="roles">
          <Icon name="Shield" size={16} className="mr-2" />
          Роли
        </TabsTrigger>
        <TabsTrigger value="users">
          <Icon name="Users" size={16} className="mr-2" />
          Пользователи
        </TabsTrigger>
        <TabsTrigger value="groups">
          <Icon name="FolderTree" size={16} className="mr-2" />
          Группы пользователей
        </TabsTrigger>
        <TabsTrigger value="sessions">
          <Icon name="Clock" size={16} className="mr-2" />
          Сеансы
        </TabsTrigger>
        <TabsTrigger value="audit">
          <Icon name="FileText" size={16} className="mr-2" />
          Журнал
        </TabsTrigger>
      </TabsList>

      <TabsContent value="roles">
        <RolesTab 
          roles={roles} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab 
          users={users} 
          setUsers={setUsers}
          roles={roles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
        />
      </TabsContent>

      <TabsContent value="groups">
        <UserGroupsTab />
      </TabsContent>

      <TabsContent value="sessions">
        <SessionsTab sessions={sessions} />
      </TabsContent>

      <TabsContent value="audit">
        <AuditLogTab auditLog={auditLog} />
      </TabsContent>
    </Tabs>
  );
};

export default AccessManagement;