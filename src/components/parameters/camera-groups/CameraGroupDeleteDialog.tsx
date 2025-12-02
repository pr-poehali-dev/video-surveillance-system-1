import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CameraGroup {
  id: number;
  name: string;
  description: string;
  camera_ids: number[];
}

interface CameraGroupDeleteDialogProps {
  open: boolean;
  group: CameraGroup | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const CameraGroupDeleteDialog = ({
  open,
  group,
  onOpenChange,
  onConfirm,
}: CameraGroupDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить группу?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить группу "{group?.name}"?
            Камеры останутся в системе.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
