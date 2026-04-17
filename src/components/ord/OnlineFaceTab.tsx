import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { ImageUploadZone } from '@/components/ord/ImageUploadZone';
import { SearchResults } from '@/components/ord/SearchResults';

interface SearchResult {
  id: number;
  type: 'face' | 'plate';
  match: number;
  time: string;
  camera: string;
  address: string;
  image: string;
  plate?: string;
}

interface OnlineFaceTabProps {
  isCreateFormOpen: boolean;
  setIsCreateFormOpen: (v: boolean) => void;
  faceEmails: string[];
  setFaceEmails: (emails: string[]) => void;
  faceMaxNicknames?: string[];
  setFaceMaxNicknames?: (nicknames: string[]) => void;
  selectedImages: File[];
  isDragging: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  mockResults: SearchResult[];
}

export const OnlineFaceTab = ({
  isCreateFormOpen,
  setIsCreateFormOpen,
  faceEmails,
  setFaceEmails,
  faceMaxNicknames = [],
  setFaceMaxNicknames = () => {},
  selectedImages,
  isDragging,
  onImageUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  removeImage,
  clearImages,
  mockResults,
}: OnlineFaceTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}>
          <Icon name={isCreateFormOpen ? "ChevronUp" : "Plus"} size={16} className="mr-2" />
          {isCreateFormOpen ? "Скрыть форму" : "Создать лист мониторинга"}
        </Button>
      </div>

      {isCreateFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="UserSearch" size={20} />
              Создать лист мониторинга лиц
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="face-name">Наименование <span className="text-destructive">*</span></Label>
              <Input id="face-name" placeholder="Введите название листа мониторинга" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="face-description">Описание</Label>
              <Input id="face-description" placeholder="Описание листа мониторинга" />
            </div>

            <ImageUploadZone
              selectedImages={selectedImages}
              isDragging={isDragging}
              onImageUpload={onImageUpload}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              removeImage={removeImage}
              clearImages={clearImages}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Уведомления на e-mail</Label>
                <div className="space-y-2">
                  {faceEmails.map((email, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="example@mail.ru"
                        value={email}
                        onChange={(e) => {
                          const updated = [...faceEmails];
                          updated[idx] = e.target.value;
                          setFaceEmails(updated);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFaceEmails(faceEmails.filter((_, i) => i !== idx))}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFaceEmails([...faceEmails, ''])}
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    Добавить e-mail
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Уведомления в MAX</Label>
                <div className="space-y-2">
                  {faceMaxNicknames.map((nick, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="@никнейм"
                        value={nick}
                        onChange={(e) => {
                          const updated = [...faceMaxNicknames];
                          updated[idx] = e.target.value;
                          setFaceMaxNicknames(updated);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFaceMaxNicknames(faceMaxNicknames.filter((_, i) => i !== idx))}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFaceMaxNicknames([...faceMaxNicknames, ''])}
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    Добавить никнейм
                  </Button>
                </div>
              </div>
            </div>

            <Button className="w-full">
              <Icon name="Plus" size={16} className="mr-2" />
              Создать лист мониторинга
            </Button>
          </CardContent>
        </Card>
      )}

      <SearchResults results={mockResults} />
    </div>
  );
};