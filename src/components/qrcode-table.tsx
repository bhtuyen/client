'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { getTableLink } from '@/lib/utils';
import { Row } from '@tanstack/react-table';

interface QRCodeTableProps<T> {
  row: Row<T>;
  size?: number;
}

export default function QRCodeTable<T>({ row, size = 200 }: QRCodeTableProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = getTableLink({
    token: row.getValue('token'),
    tableNumber: row.getValue('number')
  });

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = size;
      canvas.height = (size ?? 0) + 40;
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = '#000';
      context.textAlign = 'center';
      context.font = '12px Arial';
      context.fillText(`Bàn số ${row.getValue('number')}`, canvas.width / 2, canvas.width + 15);
      context.fillText(`Quét QR để gọi món`, canvas.width / 2, canvas.width + 35);

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
  }, [row, url, size]);
  return <canvas ref={canvasRef} />;
}
