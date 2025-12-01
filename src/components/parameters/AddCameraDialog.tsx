import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface AddCameraDialogProps {
  onTestStream: () => void;
  testingStream: boolean;
}

export const AddCameraDialog = ({ onTestStream, testingStream }: AddCameraDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить камеру
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить новую камеру видеонаблюдения</DialogTitle>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label>Название камеры <span className="text-red-500">*</span></Label>
            <Input placeholder="Камера-001" required />
          </div>

          <div className="space-y-2">
            <Label>RTSP ссылка на видеопоток <span className="text-red-500">*</span></Label>
            <Input
              placeholder="rtsp://username:password@ip:port/stream"
              className="font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Логин RTSP</Label>
              <Input placeholder="Введите логин" />
            </div>
            <div className="space-y-2">
              <Label>Пароль RTSP</Label>
              <Input placeholder="Введите пароль" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Марка и модель камеры</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hikvision-ds2cd">Hikvision DS-2CD2143G0-I</SelectItem>
                <SelectItem value="dahua-ipc">Dahua IPC-HDBW4631R-ZS</SelectItem>
                <SelectItem value="axis-p3375">Axis P3375-V</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IP адрес PTZ</Label>
              <Input placeholder="192.168.1.10" />
            </div>
            <div className="space-y-2">
              <Label>Порт PTZ</Label>
              <Input placeholder="8000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Логин PTZ</Label>
              <Input placeholder="admin" />
            </div>
            <div className="space-y-2">
              <Label>Пароль PTZ</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Собственник камеры <span className="text-red-500">*</span></Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите собственника" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mvd">МВД</SelectItem>
                <SelectItem value="admin">Администрация</SelectItem>
                <SelectItem value="gibdd">ГИБДД</SelectItem>
                <SelectItem value="mchs">МЧС</SelectItem>
                <SelectItem value="private">Частное лицо</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Глубина хранения видеоархива (дней) <span className="text-red-500">*</span></Label>
            <Select defaultValue="30" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 дней</SelectItem>
                <SelectItem value="14">14 дней</SelectItem>
                <SelectItem value="30">30 дней</SelectItem>
                <SelectItem value="60">60 дней</SelectItem>
                <SelectItem value="90">90 дней</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Территориальное деление <span className="text-red-500">*</span></Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите территорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Центральный район</SelectItem>
                <SelectItem value="leninsky">Ленинский район</SelectItem>
                <SelectItem value="dzer">Дзержинский район</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Адрес местоположения <span className="text-red-500">*</span></Label>
            <Input placeholder="Введите адрес" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Широта <span className="text-red-500">*</span></Label>
              <Input placeholder="58.0105" type="number" step="any" required />
            </div>
            <div className="space-y-2">
              <Label>Долгота <span className="text-red-500">*</span></Label>
              <Input placeholder="56.2502" type="number" step="any" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Карта местоположения</Label>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Переместите маркер для указания местоположения
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1">
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              Добавить камеру
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};