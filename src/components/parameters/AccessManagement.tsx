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
  const [searchQuery, setSearchQuery] = useState('');



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
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </TabsContent>

      <TabsContent value="groups">
        <UserGroupsTab />
      </TabsContent>

      <TabsContent value="sessions">
        <SessionsTab />
      </TabsContent>

      <TabsContent value="audit">
        <AuditLogTab auditLog={auditLog} />
      </TabsContent>
    </Tabs>
  );
};

export default AccessManagement;