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
import { toast } from 'sonner';
import { useTrashStore } from '@/stores/trashStore';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete: any;
  setUserToDelete: (user: any) => void;
  users: any[];
  setUsers: (users: any[]) => void;
}

const DeleteUserDialog = ({ isOpen, onOpenChange, userToDelete, setUserToDelete, users, setUsers }: DeleteUserDialogProps) => {
  const { addToTrash } = useTrashStore();
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить пользователя "{userToDelete?.fio}"? 
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (userToDelete) {
                addToTrash('user', userToDelete);
                setUsers(users.filter((u) => u.id !== userToDelete.id));
                toast.success('Пользователь перемещен в корзину');
                setUserToDelete(null);
                onOpenChange(false);
              }
            }}
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;