import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ImageUploadZoneProps {
  selectedImages: File[];
  isDragging: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

export const ImageUploadZone = ({
  selectedImages,
  isDragging,
  onImageUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  removeImage,
  clearImages,
}: ImageUploadZoneProps) => {
  return (
    <div className="space-y-2">
      <Label>Загрузить изображения</Label>
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onImageUpload}
          className="hidden"
          id="face-upload"
        />
        <label htmlFor="face-upload" className="cursor-pointer">
          <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Нажмите для загрузки или перетащите изображения сюда
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG до 10MB, можно загрузить несколько файлов
          </p>
        </label>
      </div>
      {selectedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Загружено изображений: {selectedImages.length}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearImages}
            >
              <Icon name="X" size={16} className="mr-1" />
              Очистить все
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <Icon name="X" size={14} />
                </Button>
                <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
