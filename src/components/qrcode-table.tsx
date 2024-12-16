'use client';

import { getTableLink } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface QRCodeTableProps {
  token: string;
  tableNumber: string;
  size?: number;

  isFillText?: boolean;
}

export default function QRCodeTable({ token, tableNumber, size = 200, isFillText = true }: QRCodeTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const locale = useLocale();
  const url = getTableLink({
    token,
    tableNumber,
    locale
  });

  const tManageTable = useTranslations('manage.tables');

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = size;
      canvas.height = (size ?? 0) + (isFillText ? 40 : 0);
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = '#000';
      context.textAlign = 'center';
      context.font = '12px Arial';
      if (isFillText) {
        context.fillText(tManageTable('qr-table-info', { number: tableNumber }), canvas.width / 2, canvas.width + 15);
        context.fillText(tManageTable('qr-table-description'), canvas.width / 2, canvas.width + 35);
      }

      const virtualCanvas = document.createElement('canvas');
      QRCode.toCanvas(
        virtualCanvas,
        url,
        {
          width: canvas.width,
          margin: 4
        },
        (error) => {
          if (error) {
            console.error(error);
          }
          context.drawImage(virtualCanvas, 0, 0, canvas.width, canvas.width);
        }
      );
    }
  }, [url, size, tableNumber, tManageTable, isFillText]);
  return (
    <canvas
      ref={canvasRef}
      style={{
        marginLeft: 'auto',
        marginRight: 'auto'
      }}
    />
  );
}
