import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const GUIDE_SECTIONS = [
  {
    title: 'Мониторинг',
    icon: 'Monitor',
    content: [
      { q: 'Как просмотреть видеопоток камеры?', a: 'Перейдите в раздел «Мониторинг», найдите камеру на карте или в списке слева и кликните на неё. Откроется окно с видеопотоком и информацией о камере.' },
      { q: 'Как включить/выключить кластеризацию камер на карте?', a: 'На странице мониторинга нажмите кнопку «Кластеризация» в правом нижнем углу карты.' },
      { q: 'Как фильтровать камеры?', a: 'Используйте панель фильтров слева: поиск по названию, фильтр по статусу, собственнику, группе, территориальному делению, тегам и аналитикам.' },
    ],
  },
  {
    title: 'Реестр камер',
    icon: 'Video',
    content: [
      { q: 'Как добавить новую камеру?', a: 'Перейдите в раздел «Параметры» → «Реестр камер» и нажмите кнопку «Добавить камеру». Заполните обязательные поля: название, RTSP-адрес, координаты.' },
      { q: 'Как редактировать камеру?', a: 'В реестре камер найдите нужную запись и нажмите иконку редактирования. Внесите изменения и сохраните.' },
      { q: 'Как удалить камеру?', a: 'В реестре камер нажмите иконку удаления напротив нужной камеры и подтвердите действие.' },
    ],
  },
  {
    title: 'Группы камер',
    icon: 'Layers',
    content: [
      { q: 'Как создать группу камер?', a: 'Перейдите в «Параметры» → «Группы камер» и нажмите «Создать группу». Укажите название, описание и добавьте камеры из списка.' },
      { q: 'Как добавить камеры в группу?', a: 'При создании или редактировании группы используйте список камер с поиском. Отмечайте нужные камеры галочками или нажмите «Выбрать все».' },
    ],
  },
  {
    title: 'ОРД — Поиск лиц и ГРЗ',
    icon: 'UserSearch',
    content: [
      { q: 'Как создать лист мониторинга лиц?', a: 'Перейдите в раздел «ОРД» → вкладка «Онлайн поиск лиц» и нажмите «Создать лист мониторинга». Загрузите фото и укажите e-mail для уведомлений.' },
      { q: 'Как выполнить исторический поиск лиц?', a: 'Перейдите в «ОРД» → «Исторический поиск лиц». Укажите период, выберите камеры для поиска, загрузите изображения и нажмите «Запустить».' },
      { q: 'Как найти автомобиль по ГРЗ?', a: 'Перейдите в «ОРД» → «Исторический поиск ГРЗ». Введите регистрационный знак (только кириллица и цифры), укажите период и камеры.' },
    ],
  },
  {
    title: 'Пользователи и роли',
    icon: 'Users',
    content: [
      { q: 'Как управлять пользователями?', a: 'Раздел «Администрирование» → «Пользователи». Здесь можно создавать, редактировать и удалять учётные записи, назначать роли и группы.' },
      { q: 'Как сменить пароль?', a: 'Нажмите на своё имя в правом верхнем углу и выберите «Сменить пароль». Введите текущий пароль и дважды новый.' },
      { q: 'Что делать если забыл пароль?', a: 'Обратитесь к системному администратору или в техническую поддержку по адресу support@esvs-perm.ru.' },
    ],
  },
  {
    title: 'Фотоархив',
    icon: 'Archive',
    content: [
      { q: 'Как создать задание на фотоархивирование?', a: 'Перейдите в раздел «Фотоархив» и нажмите «Создать задание». Укажите название, период, интервал съёмки и выберите камеры.' },
      { q: 'Как скачать архив?', a: 'В списке заданий найдите нужное и нажмите кнопку загрузки. Архив будет доступен в виде ZIP-файла.' },
    ],
  },
];

interface UserGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserGuideDialog = ({ open, onOpenChange }: UserGuideDialogProps) => {
  const [guideSearch, setGuideSearch] = useState('');

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) setGuideSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="BookOpen" size={20} />
            Руководство пользователя
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по инструкциям..."
            value={guideSearch}
            onChange={e => setGuideSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 pb-2">
            {GUIDE_SECTIONS.map(section => {
              const filtered = section.content.filter(
                item =>
                  !guideSearch ||
                  item.q.toLowerCase().includes(guideSearch.toLowerCase()) ||
                  item.a.toLowerCase().includes(guideSearch.toLowerCase())
              );
              if (filtered.length === 0) return null;
              return (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={section.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                  </div>
                  <div className="space-y-2 ml-6">
                    {filtered.map((item, i) => (
                      <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                        <p className="text-sm font-medium">{item.q}</p>
                        <p className="text-sm text-muted-foreground">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {guideSearch && GUIDE_SECTIONS.every(s => s.content.every(
              item => !item.q.toLowerCase().includes(guideSearch.toLowerCase()) && !item.a.toLowerCase().includes(guideSearch.toLowerCase())
            )) && (
              <div className="text-center text-muted-foreground py-8">
                <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Ничего не найдено по запросу «{guideSearch}»</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuideDialog;
