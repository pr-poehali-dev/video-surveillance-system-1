import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface FileUploadSectionProps {
  attachedFiles: (File | string)[];
  setAttachedFiles: (files: (File | string)[]) => void;
}

export const FileUploadSection = ({ attachedFiles, setAttachedFiles }: FileUploadSectionProps) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setAttachedFiles([...attachedFiles, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getFileName = (file: File | string): string => {
    return typeof file === 'string' ? file : file.name;
  };

  const getFileSize = (file: File | string): string | null => {
    if (typeof file === 'string') return null;
    return `(${(file.size / 1024).toFixed(1)} KB)`;
  };

  return (
    <div className="space-y-2">
      <Label>Прикрепление файлов</Label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
      >
        <Icon name="Upload" size={32} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Перетащите файлы сюда или нажмите кнопку ниже
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button type="button" variant="outline" size="sm" asChild>
            <span>
              <Icon name="Paperclip" size={16} className="mr-2" />
              Выбрать файлы
            </span>
          </Button>
        </label>
      </div>

      {attachedFiles.length > 0 && (
        <div className="space-y-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex items-center gap-2">
                <Icon name="File" size={16} />
                <span className="text-sm">{getFileName(file)}</span>
                {getFileSize(file) && (
                  <span className="text-xs text-muted-foreground">
                    {getFileSize(file)}
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
