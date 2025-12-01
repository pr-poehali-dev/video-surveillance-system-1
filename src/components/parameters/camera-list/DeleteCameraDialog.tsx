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
import { Camera } from './CameraListTypes';

interface DeleteCameraDialogProps {
  open: boolean;
  camera: Camera | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteCameraDialog = ({
  open,
  camera,
  onOpenChange,
  onConfirm,
}: DeleteCameraDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить камеру?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить камеру "{camera?.name}"? Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Удалить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
