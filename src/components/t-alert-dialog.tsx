'use client';
import { useAppStore } from '@/components/app-provider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useTranslations } from 'next-intl';

export default function TAlterDialog() {
  const { isShowAlertDialog, optionAlertDialog, closeAlertDialog } = useAppStore();

  const { title, description, onAction, cancel, action, onCancel } = optionAlertDialog;

  const tButton = useTranslations('button');
  const tAlertDialogTitle = useTranslations('alert-dialog.title');
  const tAlertDialogDescription = useTranslations('alert-dialog.description');

  const handleClose = () => {
    onCancel && onCancel();
    closeAlertDialog();
  };

  const handleAction = () => {
    onAction();
    closeAlertDialog();
  };

  return (
    <AlertDialog open={isShowAlertDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tAlertDialogTitle(title.key, title.values)}</AlertDialogTitle>
          <AlertDialogDescription>
            {tAlertDialogDescription(description.key, description.values)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>{tButton(cancel.key, cancel.values)}</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction}>{tButton(action.key, action.values)}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
