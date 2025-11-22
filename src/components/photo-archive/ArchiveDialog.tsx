import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ScreenshotTask {
  id: number;
  name: string;
  cameras: string[];
  startDate: string;
  endDate: string;
  interval: number;
  status: 'active' | 'paused' | 'completed';
  totalScreenshots: number;
}

interface Screenshot {
  id: number;
  url: string;
  timestamp: string;
  camera: string;
}

interface ArchiveDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedTask: ScreenshotTask | null;
  mockScreenshots: Screenshot[];
}

const ArchiveDialog = ({ isOpen, setIsOpen, selectedTask, mockScreenshots }: ArchiveDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FolderOpen" size={20} />
            Архив скриншотов: {selectedTask?.name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh]">
          <div className="space-y-4 pr-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Всего скриншотов: {selectedTask?.totalScreenshots}
              </div>
              <Button variant="outline" size="sm">
                <Icon name="Download" size={14} className="mr-1" />
                Скачать все
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockScreenshots.map((screenshot) => (
                <Card key={screenshot.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative group">
                    <img 
                      src={screenshot.url} 
                      alt={`Screenshot ${screenshot.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Icon name="Eye" size={16} className="mr-1" />
                        Открыть
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Icon name="Download" size={16} className="mr-1" />
                        Скачать
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline">
                        <Icon name="Video" size={10} className="mr-1" />
                        {screenshot.camera}
                      </Badge>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Icon name="Clock" size={10} />
                        {screenshot.timestamp}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveDialog;
