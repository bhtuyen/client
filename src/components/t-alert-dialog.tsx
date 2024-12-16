'use client';
import { useTranslations } from 'next-intl';

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
import { getArguments } from '@/lib/utils';

export default function TAlterDialog() {
  const { isShowAlertDialog, optionAlertDialog, closeAlertDialog } = useAppStore();

  const { title, description, onAction, cancel, action, onCancel } = optionAlertDialog;

  const tButton = useTranslations('t-button');
  const tAlertDialogTitle = useTranslations('t-alert-dialog.title');
  const tAlertDialogDescription = useTranslations('t-alert-dialog.description');

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
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
          <AlertDialogTitle>{tAlertDialogTitle(...getArguments(title ?? 'default'))}</AlertDialogTitle>
          <AlertDialogDescription>{tAlertDialogDescription(...getArguments(description ?? 'default'))}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>{tButton(...getArguments(cancel ?? 'cancel'))}</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction}>{tButton(...getArguments(action ?? 'confirm'))}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
